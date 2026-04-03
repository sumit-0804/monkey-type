import { Router } from "express";
import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import type { IUser } from "../models/User";

const router = Router();
const oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req: Request, res: Response) => {
  try {
    // Expected frontend to send credential (id token)
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ message: "No credential provided" });
      return;
    }

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ message: "Invalid token payload" });
      return;
    }

    const { sub, email, name, picture } = payload;

    if (!email) {
      res.status(400).json({ message: "Email not found in Google profile" });
      return;
    }

    // Optional campus lock check (uncomment when testing real domain)
    // if (!email.endsWith("@youruniversity.edu")) {
    //   res.status(403).json({ message: "Must log in with university email" });
    //   return;
    // }

    let user = await User.findOne({ email });
    const emailPrefix = email.split("@")[0] || "";
    const yearMatch = emailPrefix.match(/^(\d{4})(\d{2})\d{3}$/);
    
    let degree = "";
    let startYear = 0;
    
    if (yearMatch) {
      startYear = parseInt(yearMatch[1] || "0");
      const code = parseInt(yearMatch[2] || "0");
      if (code >= 1 && code <= 9) {
        degree = "Bachelors";
      } else if (code >= 11 && code <= 30) {
        degree = "Masters";
      }
    }

    if (!user) {
      user = new User({
        email,
        name: name || "User",
        avatarUrl: picture || "",
        degree,
        startYear,
      });
      await user.save();
    } else {
      user.name = name || user.name;
      user.avatarUrl = picture || user.avatarUrl;
      if (!user.degree && degree) user.degree = degree;
      if (!user.startYear && startYear) user.startYear = startYear;
      await user.save();
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Logged in successfully", user });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
});

export default router;
