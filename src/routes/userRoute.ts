import { Request, Response, Router } from 'express'
import { generateTokenAndSetCookie } from '../utils/jwt'
import UserModel from '../schemas/userSchema'

const userRouter = Router()

// Login via Telegram code
userRouter.post('/telegram-auth', async (req: Request, res: Response) => {
	const { code } = req.body

	if (!code) {
		return res.status(400).json({ success: false, message: 'Code is required' })
	}

	try {
		const user = await UserModel.findOne({
			telegramCode: code,
			telegramCodeExpiresAt: { $gt: Date.now() },
		})

		if (!user) {
			return res.status(400).json({ success: false, message: 'Invalid or expired code' })
		}

		// Clear the code and update login time
		user.telegramCode = undefined
		user.telegramCodeExpiresAt = undefined
		user.lastLogin = new Date()
		await user.save()

		// Set cookie with token
		generateTokenAndSetCookie(res, user._id)

		res.status(200).json({
			success: true,
			message: 'Logged in via Telegram',
			user: {
				...user._doc,
				password: undefined,
			},
		})
	} catch (error) {
		console.error('Telegram auth error:', error)
		res.status(500).json({ success: false, message: 'Server error' })
	}
})

export default userRouter
