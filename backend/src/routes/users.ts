import { Router } from "express";
import type { Response } from "express";
import { authenticate } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";

const router = Router();

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { bio, name, avatarUrl, degree, startYear } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    if (typeof bio === "string") user.bio = bio;
    if (typeof name === "string") user.name = name;
    if (typeof avatarUrl === "string") user.avatarUrl = avatarUrl;
    if (typeof degree === "string") user.degree = degree;
    if (typeof startYear === "number") user.startYear = startYear;
    
    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId", async (req: Request | any, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select("-email -isAdmin");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
