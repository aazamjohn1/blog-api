// src/helpers/sendLoginMessage.ts
import { Markup } from "telegraf";
import type { ParseMode } from "telegraf/typings/core/types/typegram";

export function buildLoginMessage(code: string) {
	const loginURL = "https://blog.azamjonov.io/login";

	return {
		text: `🔐 Code: <b>${code}</b>\n🔗 Click and Login\n <a href="${loginURL}">blog.azamjonov.io/login </a>`,
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
    text: "⛔️ <b>Kod muddati tugadi!</b>\n\n♻ Yangilash tugmasini bosing.",
    options: {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "♻ Kodni yangilash", callback_data: "RENEW_CODE" }]
        ]
      }
    }
  };
}