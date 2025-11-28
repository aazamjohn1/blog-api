// src/utils/jwt.ts
import { Response } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES = "1d";

export function signAccessToken(payload: any) {
	return jwt.sign(payload, "supersecretaccesstoken123"!, {
		expiresIn: ACCESS_EXPIRES,
	});
}

export function signRefreshToken(payload: any) {
	return jwt.sign(payload, "supersecretrefreshtoken456"!, {
		expiresIn: REFRESH_EXPIRES,
	});
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 15 * 60 * 1000, // 15 minutes
	});

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 24 * 60 * 60 * 1000, // 1 day
	});
}
