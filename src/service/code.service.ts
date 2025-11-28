// src/service/codeService.ts
import UserModel from "../schemas/userSchema";

export function generateNumericCode() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOrUpdateLoginCode(user: any) {
	const newCode = generateNumericCode();
	const expiresAt = new Date(Date.now() + 60 * 1000); // 1 min

	user.telegramCode = newCode;
	user.telegramCodeExpiresAt = expiresAt;

	await user.save();
	return { code: newCode, expiresAt };
}

export async function validateCode(code: string, telegramId: number) {
	const user = await UserModel.findOne({ telegramId });

	if (!user || user.telegramCode !== code) return null;

	if (!user.telegramCodeExpiresAt || user.telegramCodeExpiresAt < new Date()) return null;

	return user;
}
