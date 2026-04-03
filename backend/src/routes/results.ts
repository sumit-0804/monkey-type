import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { TestResult } from "../models/TestResult";

const router = Router();

// POST /api/results - Save a new test result
router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { wpm, accuracy, mode, testType, testAmount, punctuation, numbers, language, timeElapsed } = req.body;

    if (wpm === undefined || accuracy === undefined || !mode || !testType || testAmount === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const testResult = new TestResult({
      user: req.user.id,
      wpm,
      accuracy,
      mode,
      testType,
      testAmount,
      punctuation,
      numbers,
      language,
      timeElapsed,
    });

    await testResult.save();
    res.status(201).json(testResult);
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/results/me - Fetch current user's results
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const results = await TestResult.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/results/user/:userId - Fetch test results for any user (public)
router.get("/user/:userId", async (req: Request | any, res: Response) => {
  try {
    const { userId } = req.params;
    const results = await TestResult.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/results/stats/:userId - Fetch aggregate metrics for any user
router.get("/stats/:userId", async (req: Request | any, res: Response) => {
  try {
    const { userId } = req.params;
    const results = await TestResult.find({ user: userId });

    const totalTests = results.length;
    const bestWpm = results.length > 0 ? Math.max(...results.map(r => r.wpm)) : 0;
    const avgWpm = results.length > 0 ? results.reduce((acc, r) => acc + r.wpm, 0) / totalTests : 0;
    const avgAccuracy = results.length > 0 ? results.reduce((acc, r) => acc + r.accuracy, 0) / totalTests : 0;
    const totalTime = results.reduce((acc, r) => acc + (r.timeElapsed || 0), 0);

    res.json({
      totalTests,
      bestWpm,
      avgWpm: Math.round(avgWpm * 100) / 100,
      avgAccuracy: Math.round(avgAccuracy * 100) / 100,
      totalTime: Math.round(totalTime),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/results/leaderboard - Fetch global leaderboard with filters
router.get("/leaderboard", async (req: Request, res: Response) => {
  try {
    const { mode, testType, testAmount, punctuation, numbers, language } = req.query;

    const query: any = {};
    if (mode) query.mode = mode;
    if (testType) query.testType = testType;
    if (testAmount && Number(testAmount) !== 0) query.testAmount = Number(testAmount);
    
    // Default to standard tests (no punctuation/numbers) for normal mode
    if (mode === "normal") {
      query.punctuation = false;
      query.numbers = false;
    }
    
    if (language) query.language = language;

    const leaderboard = await TestResult.find(query)
      .sort({ wpm: -1 })
      .limit(50)
      .populate("user", "name avatarUrl");

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
