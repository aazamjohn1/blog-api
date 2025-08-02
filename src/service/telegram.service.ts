// src/service/telegramBot.ts
import { Telegraf } from 'telegraf'
import UserModel from '../schemas/userSchema'
import crypto from 'crypto'

const bot = new Telegraf(process.env.TELEGRAM_TOKEN!)

bot.start(async (ctx) => {
	try {
		const telegramId = ctx.from?.id
		const fullName = `${ctx.from.first_name ?? ''} ${ctx.from.last_name ?? ''}`.trim()

		const code = crypto.randomBytes(4).toString('hex')
		const expiresAt = Date.now() + 10 * 60 * 1000 // 10 mins

		await UserModel.findOneAndUpdate(
			{ telegramId },
			{
				telegramId,
				telegramCode: code,
				telegramCodeExpiresAt: expiresAt,
				fullName,
			},
			{ upsert: true, new: true }
		)

		await ctx.reply(`Your login code is: ${code}\nEnter it on the website within 10 minutes.`)
	} catch (error) {
		console.error('Error in Telegram bot:', error)
		await ctx.reply('Something went wrong, please try again later.')
	}
})

export const launchTelegramBot = () => {
	bot.launch()
	console.log('🚀 Telegram bot is running...')
}
