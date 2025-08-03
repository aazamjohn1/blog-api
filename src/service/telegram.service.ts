// src/service/telegramBot.ts
import { Markup, Telegraf } from 'telegraf'
import UserModel from '../schemas/userSchema'


const bot = new Telegraf(process.env.TELEGRAM_TOKEN!)

function generateNumericCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString()
}

bot.command('login', async (ctx) => {
	try {
		const telegramId = ctx.from?.id
		const fullName = `${ctx.from.first_name ?? ''} ${ctx.from.last_name ?? ''}`.trim()
		const username = ctx.from?.username || ''  // <-- get the username from Telegram

		let user = await UserModel.findOne({ telegramId })

		if (!user) {
			// New user, generate code and save
			const newCode = generateNumericCode()
			const expiresAt = new Date(Date.now() + 60 * 1000) // 60 seconds

			user = await UserModel.create({
				telegramId,
				fullName,
				username, // <-- Save username
				role: telegramId === 1097215587 ? 'admin' : 'user', // Example role assignment
				telegramCode: newCode,
				telegramCodeExpiresAt: expiresAt,
			})
		} else {
			// Optional: update username if changed
			if (user.username !== username) {
				user.username = username
				await user.save()
			}
		}

		const now = Date.now()
		const isExpired = !user.telegramCodeExpiresAt || user.telegramCodeExpiresAt.getTime() < now

		if (isExpired) {
			const newCode = generateNumericCode()
			const expiresAt = new Date(Date.now() + 60 * 1000) // 10 seconds

			user.telegramCode = newCode
			user.telegramCodeExpiresAt = expiresAt
			await user.save()

			const loginURL = 'https://azamjonov.com/login'
			const sent = await ctx.reply(
				`🔐 <b>New Code</b>: <b>${newCode}</b>\n🔗 <a href="${loginURL}">Click and Login</a>`,
				{
					parse_mode: 'HTML',
					reply_markup: Markup.inlineKeyboard([
						Markup.button.callback('🔁 Renew Code', 'RENEW_CODE'),
					]).reply_markup,
				}
			)

			user.lastBotMessageId = sent.message_id
			await user.save()
			return
		}

		const loginURL = 'https://azamjonov.com/login'
		const sent = await ctx.reply(
			`🔐 Code: <b>${user.telegramCode}</b>\n🔗 <a href="${loginURL}">Click and Login</a>`,
			{
				parse_mode: 'HTML',
				reply_markup: Markup.inlineKeyboard([
					Markup.button.callback('🔁 Yangilash / Renew', 'RENEW_CODE'),
				]).reply_markup,
			}
		)
		user.lastBotMessageId = sent.message_id
		await user.save()
	} catch (error) {
		console.error('Error in /login:', error)
		await ctx.reply('❌ Something went wrong.')
	}
})

// call this after bot.launch()
function startCodeExpiryChecker() {
	setInterval(async () => {
		const expiredUsers = await UserModel.find({
			telegramCodeExpiresAt: { $lt: new Date() },
			lastBotMessageId: { $exists: true },
		})

		for (const user of expiredUsers) {
			try {
				await bot.telegram.editMessageText(
					user.telegramId,
					user.lastBotMessageId,
					undefined,
					'🔒 Kod muddati tugadi. <b>yangilash</b> tugmasini bosib, yangi kod oling.',
					{
						parse_mode: 'HTML',
						reply_markup: Markup.inlineKeyboard([
							Markup.button.callback('🔁 Yangilash', 'RENEW_CODE'),
						]).reply_markup,
					}
				)

				// To prevent editing same message again
				user.lastBotMessageId = undefined
				await user.save()
			} catch (err) {
				console.error('Failed to update expired code message', err)
			}
		}
	}, 3000) // Every 3 seconds
}



bot.action('RENEW_CODE', async (ctx) => {
	try {
		const telegramId = ctx.from?.id
		const user = await UserModel.findOne({ telegramId })

		if (!user) return ctx.reply('❌ User not found.')

		const now = Date.now()
		const isExpired = !user.telegramCodeExpiresAt || user.telegramCodeExpiresAt.getTime() < now

		if (!isExpired) {
			const remaining = Math.ceil(
				(user.telegramCodeExpiresAt.getTime() - now) / 1000
			)
			return ctx.answerCbQuery(
				`🟡 Current code is still valid for ${remaining} seconds.`,
				{ show_alert: true }
			)
		}

		const newCode = generateNumericCode()
		const expiresAt = new Date(Date.now() + 10 * 1000)
		user.telegramCode = newCode
		user.telegramCodeExpiresAt = expiresAt
		await user.save()

		const loginURL = 'https://azamjonov.com/login'
		const sent = await ctx.reply(
			`🔐 Code: <b>${newCode}</b>\n🔗 <a href="${loginURL}">Click and Login</a>`,
			{
				parse_mode: 'HTML',
				reply_markup: Markup.inlineKeyboard([
					Markup.button.callback('🔁 Renew Code', 'RENEW_CODE'),
				]).reply_markup,
			}
		)
		user.lastBotMessageId = sent.message_id
		await user.save()
	} catch (error) {
		console.error('Error in RENEW_CODE:', error)
		await ctx.reply('❌ Could not renew code.')
	}
})





export const launchTelegramBot = () => {
	bot.launch()
	console.log('🚀 Telegram bot is running...')
	startCodeExpiryChecker()
}
