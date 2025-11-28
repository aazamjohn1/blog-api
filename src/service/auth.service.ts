// src/service/authService.ts
import { signAccessToken, signRefreshToken } from "../utils/jwt";

export async function issueTokens(user: any) {
	const accessToken = signAccessToken({ id: user._id });
	const refreshToken = signRefreshToken({ id: user._id });

	// save refresh token to DB
	user.refreshToken = refreshToken;
	await user.save();

	return { accessToken, refreshToken };
}

export function setAuthCookies(res: any, access: string, refresh: string) {
	res.cookie("accessToken", access, {
		httpOnly: true,
		secure: true,
		sameSite: "none",
		maxAge: 15 * 60 * 1000, // 15 min
	});

	res.cookie("refreshToken", refresh, {
		httpOnly: true,
		secure: true,
		sameSite: "none",
		maxAge: 24 * 60 * 60 * 1000, // 1 day
	});
}
