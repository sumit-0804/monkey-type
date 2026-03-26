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
    
    if (!user) {
      user = new User({
        email,
        name,
        avatarUrl: picture,
      });
      await user.save();
    } else {
      // update user profile picture/name slightly on relogin
      user.name = name || user.name;
      user.avatarUrl = picture || user.avatarUrl;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // 'lax' helps with local development
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Logged in successfully", user });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
});

export default router;
