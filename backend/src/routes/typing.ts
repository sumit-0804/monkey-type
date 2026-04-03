import { Router } from "express";
import type { Request, Response } from "express";
import { getCodeFromCache } from "../services/snippetCache";
import { generateFromDictionary } from "../services/wordDictionary";
import { getQueueStats } from "../services/requestQueue";

const router = Router();

router.get("/content", async (req: Request, res: Response): Promise<void> => {
  try {
    const { mode, language, wordCount, punctuation, numbers } = req.query;

    let textStr = "";

    if (mode === "code") {
      const lang = (language as string) || "javascript";
      textStr = await getCodeFromCache(lang);
    } else {
      const wCount = parseInt(wordCount as string) || 50;
      const usePunc = punctuation === "true";
      const useNum = numbers === "true";
      textStr = generateFromDictionary(wCount, usePunc, useNum);
    }

    res.json({ text: textStr });
  } catch (error) {
    console.error("Typing content API error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Diagnostic endpoint to monitor queue health
router.get("/stats", (_req: Request, res: Response): void => {
  res.json(getQueueStats());
});

export default router;
