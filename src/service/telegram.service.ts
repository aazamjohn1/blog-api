// src/service/telegramBot.ts
import { Telegraf } from "telegraf";
import UserModel from "../schemas/userSchema";
import { buildExpiredMessage, buildLoginMessage } from "../utils/sendLoginMessage";
import { createOrUpdateLoginCode } from "./code.service";

const bot = new Telegraf(process.env.TELEGRAM_TOKEN!);

// LOGIN command
bot.command("login", async (ctx) => {
	try {
		const tg = ctx.from;
		console.log("Telegram login attempt from:", tg);
		if (!tg) return;

		const telegramId = tg.id;
		const fullName = `${tg.first_name ?? ""} ${tg.last_name ?? ""}`.trim();
		const username = tg.username ?? "";

		let user = await UserModel.findOne({ telegramId });

		if (!user) {
			user = await UserModel.create({
				telegramId,
				fullName,
				username,
				role: telegramId === 1097215587 ? "admin" : "user",
			});
		}

		if (user.username !== username) {
			user.username = username;
			await user.save();
		}

		const { code } = await createOrUpdateLoginCode(user);

		const loginMsg = buildLoginMessage(code);
		const sent = await ctx.reply(loginMsg.text, loginMsg.options);

		user.lastBotMessageId = sent.message_id;
		await user.save();
	} catch (err) {
		console.error(err);
		ctx.reply("❌ Xatolik yuz berdi.");
	}
});

// AUTO EXPIRY CHECKER
function startCodeExpiryChecker() {
	setInterval(async () => {
		const expired = await UserModel.find({
			telegramCodeExpiresAt: { $lt: new Date() },
			lastBotMessageId: { $exists: true },
		});

		for (const user of expired) {
			try {
				const msg = buildExpiredMessage();

				await bot.telegram.editMessageText(
					user.telegramId,
					user.lastBotMessageId!,
					undefined,
					msg.text,
					msg.options
				);

				user.lastBotMessageId = undefined;
				await user.save();
			} catch (err) {
				console.log("edit error:", err);
			}
		}
	}, 3000);
}

// BUTTON: RENEW_CODE
bot.action("RENEW_CODE", async (ctx) => {
	try {
		const telegramId = ctx.from?.id;
		const user = await UserModel.findOne({ telegramId });

		if (!user) return ctx.reply("❌ User not found.");

		if (user.telegramCodeExpiresAt && user.telegramCodeExpiresAt > new Date()) {
			const remain = Math.ceil((user.telegramCodeExpiresAt.getTime() - Date.now()) / 1000);
			return ctx.answerCbQuery(`🟡 Valid ${remain} seconds.`, { show_alert: true });
		}

		const { code } = await createOrUpdateLoginCode(user);
		const loginMsg = buildLoginMessage(code);

		const sent = await ctx.reply(loginMsg.text, loginMsg.options);
		user.lastBotMessageId = sent.message_id;
		await user.save();
	} catch {
		ctx.reply("❌ Cannot renew code.");
	}
});

export const launchTelegramBot = () => {
	bot.launch();
	console.log("🚀 Telegram bot running...");
	startCodeExpiryChecker();
};
