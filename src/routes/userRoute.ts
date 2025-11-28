// src/routes/userRoutes.ts
import { Router } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, authMiddleware } from "../middlewares/authentication";
import UserModel from "../schemas/userSchema";
import { issueTokens, setAuthCookies } from "../service/auth.service";

const router = Router();


/**
 * POST user/tlegram-auth
 */


router.post("/telegram-auth", async (req:AuthRequest , res) => {
	try {
		const { code } = req.body;
		if (!code) {
			return res.status(400).json({
				success: false,
				message: "Code is required",
			});
		}

		const user = await UserModel.findOne({
			telegramCode: code,
			telegramCodeExpiresAt: { $gt: new Date() },
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "Invalid or expired code",
			});
		}

		// Invalidate code after login
		user.lastLogin = new Date();

		await user.save();

		// Generate Access + Refresh tokens
		const { accessToken, refreshToken } = await issueTokens(user);

		// Set cookies
		setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user.toObject(),
        password: undefined,
        accessToken: undefined,
      },
    });
	} catch (error) {
		console.error("Telegram auth error:", error);
		return res
			.status(500)
			.json({ success: false, message: "Server error during Telegram authentication" });
	}
})

/**
 * GET /user/me
 * Protected — authMiddleware tekshiradi
 */
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * POST /user/refresh-token
 * Use refresh token cookie to rotate / issue new access token
 */
router.post("/refresh-token", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
		console.log("Refresh token received:", token);
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

    // Check stored refresh token (simple rotation strategy)
    if (!user.refreshToken || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: "Refresh token mismatch" });
    }

    // Issue new tokens (keep refresh same or rotate — here we rotate)
    const { accessToken, refreshToken } = await issueTokens(user); // issueTokens should save refreshToken to DB

    // Set cookies (updates both)
    setAuthCookies(res, accessToken, refreshToken);

    return res.json({ success: true });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /user/logout
 * Clears cookies and removes refreshToken in DB
 */
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      // try remove refreshToken from DB if present
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

    // clear cookies
    res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });

    return res.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false });
  }
});

export default router;
