/**
 * Global Request Queue for Gemini API
 * 
 * Serializes all API requests with configurable spacing to respect
 * Gemini 3.1 Flash Lite free tier limits:
 *   - 15 RPM (requests per minute)
 *   - 250K TPM (tokens per minute)  
 *   - 500 RPD (requests per day) ← the binding constraint
 * 
 * Features:
 * - 5s between requests (~12 RPM effective, safely under 15 RPM)
 * - Daily budget tracking to avoid hitting 500 RPD
 * - Exponential backoff with jitter on 429 errors
 * - Queue depth limit to prevent unbounded growth
 */

interface QueueTask {
  execute: () => Promise<string>;
  resolve: (value: string | null) => void;
  reject: (error: Error) => void;
}

// --- Configuration ---
const MIN_REQUEST_INTERVAL_MS = 5000;   // 5s between requests = ~12 RPM (safe for 15 RPM limit)
const MAX_QUEUE_DEPTH = 15;             // Drop tasks beyond this
const MAX_RETRIES = 3;                  // Retry attempts on 429
const BASE_BACKOFF_MS = 15000;          // 15s initial backoff
const MAX_BACKOFF_MS = 120000;          // 2 min max backoff
const MAX_JITTER_MS = 2000;            // Random 0-2s jitter

// --- Daily Budget (500 RPD) ---
const DAILY_BUDGET = 500;
const DAILY_BUDGET_RESERVE = 50;        // Stop at 450 to keep a safety margin
let dailyRequestCount = 0;
let dailyResetDate = new Date().toDateString();

// --- State ---
const queue: QueueTask[] = [];
let isProcessing = false;
let lastRequestTime = 0;

// --- Metrics ---
export const metrics = {
  totalRequests: 0,
  totalSuccess: 0,
  totalErrors: 0,
  total429s: 0,
  queueDrops: 0,
  dailyRequestCount: 0,
  dailyBudgetRemaining: DAILY_BUDGET - DAILY_BUDGET_RESERVE,
};

/**
 * Reset daily counter at midnight (checked on each request)
 */
function checkDailyReset(): void {
  const today = new Date().toDateString();
  if (today !== dailyResetDate) {
    console.log(`[RequestQueue] Daily budget reset. Previous day used: ${dailyRequestCount} requests.`);
    dailyRequestCount = 0;
    dailyResetDate = today;
  }
}

/**
 * Check if we still have daily budget remaining
 */
function hasDailyBudget(): boolean {
  checkDailyReset();
  return dailyRequestCount < (DAILY_BUDGET - DAILY_BUDGET_RESERVE);
}

/**
 * Check if an error is a rate limit (429) error
 */
export function isRateLimitError(error: any): boolean {
  if (!error) return false;
  if (error.status === 429 || error.statusCode === 429) return true;
  const msg = (error.message || error.toString() || "").toLowerCase();
  return msg.includes("429") || msg.includes("too many requests") || msg.includes("rate limit") || msg.includes("resource_exhausted");
}

function jitter(): number {
  return Math.floor(Math.random() * MAX_JITTER_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Enqueue a Gemini API task. Returns the result or null if queue is full / budget exhausted.
 */
export function enqueue(task: () => Promise<string>): Promise<string | null> {
  return new Promise((resolve) => {
    // Check daily budget
    if (!hasDailyBudget()) {
      console.warn(`[RequestQueue] Daily budget exhausted (${dailyRequestCount}/${DAILY_BUDGET}). Using fallback.`);
      resolve(null);
      return;
    }

    if (queue.length >= MAX_QUEUE_DEPTH) {
      metrics.queueDrops++;
      console.warn(`[RequestQueue] Queue full (${MAX_QUEUE_DEPTH}). Dropping task.`);
      resolve(null);
      return;
    }

    queue.push({ execute: task, resolve, reject: () => resolve(null) });

    if (!isProcessing) {
      processQueue();
    }
  });
}

/**
 * Process the queue sequentially, respecting rate limits
 */
async function processQueue(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length > 0) {
    const task = queue.shift()!;

    // Re-check daily budget before each request
    if (!hasDailyBudget()) {
      console.warn(`[RequestQueue] Daily budget exhausted mid-queue. Skipping remaining.`);
      task.resolve(null);
      continue;
    }

    // Enforce minimum interval between requests
    const elapsed = Date.now() - lastRequestTime;
    const waitTime = MIN_REQUEST_INTERVAL_MS - elapsed + jitter();
    if (waitTime > 0) {
      await sleep(waitTime);
    }

    // Execute with retry logic
    let result: string | null = null;
    let lastError: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        lastRequestTime = Date.now();
        metrics.totalRequests++;
        dailyRequestCount++;
        metrics.dailyRequestCount = dailyRequestCount;
        metrics.dailyBudgetRemaining = Math.max(0, DAILY_BUDGET - DAILY_BUDGET_RESERVE - dailyRequestCount);

        result = await task.execute();
        metrics.totalSuccess++;
        lastError = null;
        break;
      } catch (error: any) {
        lastError = error;
        metrics.totalErrors++;

        if (isRateLimitError(error)) {
          metrics.total429s++;
          const backoff = Math.min(BASE_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS) + jitter();
          console.warn(
            `[RequestQueue] 429 rate limit hit. Attempt ${attempt + 1}/${MAX_RETRIES + 1}. Backing off ${Math.round(backoff / 1000)}s...`
          );
          await sleep(backoff);
          lastRequestTime = Date.now();
        } else {
          console.error(`[RequestQueue] Non-retryable error:`, error.message || error);
          break;
        }
      }
    }

    if (result !== null) {
      task.resolve(result);
    } else {
      task.resolve(null);
      if (lastError) {
        console.error(`[RequestQueue] Task failed after retries:`, lastError.message || lastError);
      }
    }
  }

  isProcessing = false;
}

/**
 * Get current queue stats for diagnostics
 */
export function getQueueStats() {
  checkDailyReset();
  return {
    pending: queue.length,
    isProcessing,
    dailyUsed: dailyRequestCount,
    dailyRemaining: Math.max(0, DAILY_BUDGET - DAILY_BUDGET_RESERVE - dailyRequestCount),
    dailyBudget: DAILY_BUDGET,
    ...metrics,
  };
}
