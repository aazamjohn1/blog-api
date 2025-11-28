// src/helpers/sendLoginMessage.ts
import { Markup } from "telegraf";
import type { ParseMode } from "telegraf/typings/core/types/typegram";

export function buildLoginMessage(code: string) {
	const loginURL = "https://azamjonov.com/login";

	return {
		text: `🔐 Code: <b>${code}</b>\n🔗 Click and Login\n <a href="${loginURL}">azamjonov.com/login </a>`,
		options: {
			parse_mode: "HTML" as ParseMode,
			reply_markup: Markup.inlineKeyboard([
				Markup.button.callback("🔁 Yangilash / Renew", "RENEW_CODE"),
			]).reply_markup,
		},
	};
}

export function buildExpiredMessage() {
	return {
		text: `🔒 Kod muddati tugadi.\n<b>Yangilash</b> tugmasini bosing.`,
		options: {
			parse_mode: "HTML" as ParseMode,
			reply_markup: Markup.inlineKeyboard([
				Markup.button.callback("🔁 Yangilash", "RENEW_CODE"),
			]).reply_markup,
		},
	};
}
