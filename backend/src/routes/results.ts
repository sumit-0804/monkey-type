import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { TestResult } from "../models/TestResult";

const router = Router();

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

    res.json({
      totalTests,
      bestWpm,
      avgWpm: Math.round(avgWpm * 100) / 100,
      avgAccuracy: Math.round(avgAccuracy * 100) / 100,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
