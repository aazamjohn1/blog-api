// src/service/telegramBot.ts
import crypto from "crypto";
import { Telegraf } from "telegraf";
import blogSchema from "../schemas/blogSchema";
import BookModel from "../schemas/bookSchema";
import UserModel from "../schemas/userSchema";
import { buildExpiredMessage, buildLoginMessage } from "../utils/sendLoginMessage";
import { createOrUpdateLoginCode } from "./code.service";
import { listAllUsers, mainMenuKeyboard } from "./tg-helper";
const bot = new Telegraf(process.env.TELEGRAM_TOKEN!);

// at top of file


// stable stringify that sorts object keys
function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(stableStringify).join(",") + "]";
  const keys = Object.keys(obj).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}";
}

function payloadHash(text: string, options: any): string {
  const toHash = text + "|" + stableStringify(options?.reply_markup ?? options?.replyMarkup ?? options ?? {});
  return crypto.createHash("sha256").update(toHash).digest("hex");
}

export async function notifyAllUsers(text: string, extra?: any) {
  const users = await UserModel.find({}, { telegramId: 1 });

  // Check if text contains an <img> tag or a direct URL (simple regex)
  const imgTagMatch = text.match(/<img\s+src="(.+?)"\s*\/?>/i);

  for (const user of users) {
    try {
      if (imgTagMatch) {
        // Extract the image URL
        const imgUrl = imgTagMatch[1];

        // Remove the <img> tag from text for caption
        const caption = text.replace(/<img\s+src="(.+?)"\s*\/?>/i, "").trim();

        await bot.telegram.sendPhoto(
          user.telegramId as any,
          imgUrl,
          { caption, ...extra }
        );
      } else {
        await bot.telegram.sendMessage(user.telegramId as any, text, extra);
      }
    } catch (err) {
      console.log("notify error:", err);
    }
  }
}

bot.command("listusers", async (ctx) => {
  const adminId = ctx.from?.id;
  await listAllUsers(adminId as any, bot);
});

// start command

bot.command("start", async (ctx) => {
	const telegramId = ctx.from?.id;
  if (!telegramId) return;
	await bot.telegram.sendMessage(
  telegramId,
  "🚀 Hammasi tayyor! Asosiy menyuga o'ting:",
  mainMenuKeyboard()
);
})


bot.action(/MENU_.*/, async (ctx) => {
  const action = (ctx.callbackQuery as any)?.data;

  try {
    switch (action) {
      case "MENU_BLOGS":
        {
          const blogs = await blogSchema.find()
            .sort({ createdAt: -1 }) // newest first
            .limit(5);

          if (!blogs.length) {
            await ctx.reply("📚 Hozircha bloglar mavjud emas.");
            break;
          }

          let message = "📚 So'nggi 5 blog:\n";
          blogs.forEach((blog, idx) => {
            message += `\n\n${idx + 1}. ${blog.title}`;
          });

          await ctx.reply(message.trim());
        }
        break;

      case "MENU_BOOKS":
        {
          const books = await BookModel.find()
            .sort({ createdAt: -1 })
            .limit(5);

          if (!books.length) {
            await ctx.reply("📘 Hozircha kitoblar mavjud emas.");
            break;
          }

          let message = "📘 So'nggi 5 kitob:\n\n";
          books.forEach((book, idx) => {
            message += `${idx + 1}. ${book.title}`;
          });

          await ctx.reply(message.trim());
        }
        break;

      case "MENU_LOGIN":
        await ctx.reply("🔐 Login uchun /login buyrug‘ini yuboring yoki kodni yangilang.");
        break;

      case "MENU_SETTINGS":
        await ctx.reply(
          "⚙️ Sozlamalar:\n• Blog xabarnomalar: ON/OFF\n• Kitob xabarnomalar: ON/OFF\n• Til tanlovi: 🇺🇿/🇬🇧"
        );
        break;

      default:
        await ctx.reply("❌ Noma'lum amal.");
    }

    // Remove loading state
    await ctx.answerCbQuery();
  } catch (err) {
    console.error("MENU_ACTION_ERROR:", err);
    await ctx.reply("❌ Xatolik yuz berdi.");
  }
});



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
		const sent = await bot.telegram.sendMessage(
    telegramId,
    loginMsg.text,
    loginMsg.options
);

		user.lastSentMessageId = sent.message_id;
		user.lastSentMessageHash = null;
		await user.save();
	} catch (err) {
		console.error(err);
		ctx.reply("❌ Xatolik yuz berdi.");
	}
});


// Notification:
bot.command("notify_all", async (ctx) => {
  const fromId = ctx.from?.id;
  if (fromId !== 1097215587) {
    return ctx.reply("❌ Sizda ruxsat yo‘q.");
  }

  const text = ctx.message.text.replace("/notify_all", "").trim();

  if (!text) return ctx.reply("🔔 Xabar matnini kiriting: /notify_all <matn>");

  await notifyAllUsers(`🔔 *Yangi yangilik!* \n\n${text}`, {
    parse_mode: "Markdown"
  });
	bot

  ctx.reply("✅ Xabar barcha foydalanuvchilarga yuborildi.");
});


// AUTO EXPIRY CHECKER
function startCodeExpiryChecker() {
  setInterval(async () => {
	const expired = await UserModel.find({
		telegramCodeExpiresAt: { $lt: new Date() },
		lastSentMessageId: { $exists: true, $ne: null },
	});

	for (const user of expired) {
		const msg = buildExpiredMessage();
		const newHash = payloadHash(msg.text, msg.options);

		if (user.lastSentMessageHash === newHash) continue;

		await bot.telegram.editMessageText(
			user.telegramId as any,
			user.lastSentMessageId,
			undefined,
			msg.text,
			msg.options as any
		);

		user.lastSentMessageHash = newHash;
		await user.save();
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

	const sent = await bot.telegram.sendMessage(
    telegramId,
    loginMsg.text,
    loginMsg.options
);

		user.lastSentMessageId = sent.message_id;
		user.lastSentMessageHash = null;
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
