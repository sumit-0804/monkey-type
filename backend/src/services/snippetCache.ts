import { Snippet } from "../models/Snippet";
import { generateBatchCodeSnippets, getFallbackCode } from "./gemini";

// Map of languages to keep cached
const TARGET_LANGUAGES = ["javascript", "python", "java", "cpp", "go"];
const MIN_SNIPPET_COUNT = 5;

/**
 * Fetch a random snippet for the given language from the MongoDB cache.
 * Falls back to local hardcoded snippets if none are found in DB.
 */
export async function getCodeFromCache(language: string): Promise<string> {
  try {
    // Select a random snippet using MongoDB aggregation
    const randomSnippet = await Snippet.aggregate([
      { $match: { language } },
      { $sample: { size: 1 } }
    ]);

    if (randomSnippet && randomSnippet.length > 0) {
      // Find the document and delete it so we don't serve exactly the same snippet again.
      // Alternatively, we could just leave it or manage it differently, 
      // but deleting it ensures fresh content flow.
      await Snippet.findByIdAndDelete(randomSnippet[0]._id);
      return randomSnippet[0].text;
    }
  } catch (error) {
    console.error(`[SnippetCache] Error fetching cached snippet for ${language}:`, error);
  }

  // Fallback if cache is empty or DB fails
  console.log(`[SnippetCache] Cache empty/failed for ${language}, using fallback.`);
  return getFallbackCode(language);
}

/**
 * Executes a cache refill check for the given language.
 * Will run the batch generation only if the snippet count is below MIN_SNIPPET_COUNT.
 */
async function checkAndRefillLanguage(language: string) {
  try {
    const count = await Snippet.countDocuments({ language });
    if (count < MIN_SNIPPET_COUNT) {
      console.log(`[SnippetCache] ${language} count is ${count} (target >= ${MIN_SNIPPET_COUNT}). Generating batch...`);
      const snippets = await generateBatchCodeSnippets(language);
      
      if (snippets && snippets.length > 0) {
        // Bulk insert generated snippets
        const docs = snippets.map(text => ({ language, text }));
        await Snippet.insertMany(docs);
        console.log(`[SnippetCache] Inserted ${snippets.length} new ${language} snippets.`);
      }
    } else {
        // Logging for stats (optional)
        // console.log(`[SnippetCache] ${language} count is ${count}, no refill needed.`);
    }
  } catch (error) {
    console.error(`[SnippetCache] Refill error for ${language}:`, error);
  }
}

/**
 * The cron job logic. Runs periodically to check all target languages
 * and refill their caches using batched AI calls.
 */
export async function runCodeRefillCycle() {
  console.log("[SnippetCache] Running background refill cycle...");
  
  // We process these sequentially to space out API calls naturally via requestQueue.
  // We could also do Promise.all since the requestQueue serializes them, but sequence is fine.
  for (const language of TARGET_LANGUAGES) {
    await checkAndRefillLanguage(language);
  }
}

let refillTimer: ReturnType<typeof setInterval>;

/**
 * Start the background refill cron job.
 */
export function startCodeCacheRefill(intervalMinutes: number = 10) {
  // Run immediately on boot
  runCodeRefillCycle().catch(console.error);

  // Set interval
  const intervalMs = intervalMinutes * 60 * 1000;
  refillTimer = setInterval(() => {
    runCodeRefillCycle().catch(console.error);
  }, intervalMs);
}

export function stopCodeCacheRefill() {
  if (refillTimer) clearInterval(refillTimer);
}
