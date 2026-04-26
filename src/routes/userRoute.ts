import { Router } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, authMiddleware } from "../middlewares/authentication";
import UserModel from "../schemas/userSchema";
import { issueTokens, setAuthCookies } from "../service/auth.service";

const router = Router();

const ADMIN_EMAIL = "adminasadbek";
const ADMIN_PASSWORD = "adminazamjonov";

router.post("/login", async (req: AuthRequest, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    let user = await UserModel.findOne({ email: ADMIN_EMAIL });
    if (!user) {
      user = await UserModel.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        fullName: "Admin",
        role: "admin",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = await issueTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user.toJSON(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

router.post("/refresh-token", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

    let decoded: any;
    try {
      decoded = jwt.verify(token, "supersecretrefreshtoken456"!);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const userId = decoded.id ?? decoded.userId;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(401).json({ success: false, message: "No user" });

    if (!user.refreshToken || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: "Refresh token mismatch" });
    }

    const { accessToken, refreshToken } = await issueTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.json({ success: true });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      let decoded: any;
      try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
      } catch (e) {
        decoded = null;
      }
      const userId = decoded?.id ?? decoded?.userId;
      if (userId) {
        await UserModel.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
      }
    }

    res.clearCookie("accessToken", { httpOnly: true, sameSite: "none", path: "/", secure: process.env.NODE_ENV === "production" });
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "none", path: "/", secure: process.env.NODE_ENV === "production" });

    return res.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false });
  }
});

export default router;
