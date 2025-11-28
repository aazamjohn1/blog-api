// src/middleware/authMiddleware.ts
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../schemas/userSchema";

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No access token" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    } catch (err: any) {
      // If token expired or invalid — forward 401 so frontend can call refresh
      return res.status(401).json({ success: false, message: "Unauthorized", reason: err.name });
    }

    const userId = decoded.id ?? decoded.userId;
    const user = await UserModel.findById(userId).select("-refreshToken");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token user" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
