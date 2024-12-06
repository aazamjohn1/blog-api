import { NextFunction, Request, Response, Router } from 'express'
import { generateTokenAndSetCookie } from '../utils/jwt'
import UserModel from '../schemas/userSchema'
import bcryptjs from 'bcryptjs'
import crypto from 'crypto'
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from '../mailtrap/emails'
import { verifyToken } from '../middlewares/authentication'
const userRouter = Router()

const { NODE_ENV } = process.env

// User registration route
userRouter.post(
	'/register',
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password, fullName } = req.body

		try {
			if (!email || !password || !fullName) {
				throw new Error('All fields are required')
			}

			const userAlreadyExists = await UserModel.findOne({ email })
			console.log('userAlreadyExists', userAlreadyExists)

			if (userAlreadyExists) {
				return res
					.status(400)
					.json({ success: false, message: 'User already exists' })
			}

			const hashedPassword = await bcryptjs.hash(password, 10)
			const verificationToken = Math.floor(
				100000 + Math.random() * 900000
			).toString()

			const user = new UserModel({
				email,
				password: hashedPassword,
				fullName,
				verificationToken,
				verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
			})

			await user.save()

			// jwt
			generateTokenAndSetCookie(res, user._id)

			await sendVerificationEmail(user.email, verificationToken)

			res.status(201).json({
				success: true,
				message: 'User created successfully',
				user: {
					...user._doc,
					password: undefined,
				},
			})
		} catch (error) {
			res.status(400).json({ success: false, message: error })
		}
	}
)

// User verification route
userRouter.post(
	'/verify-email',
	async (req: Request, res: Response, next: NextFunction) => {
		const { code } = req.body
		try {
			const user = await UserModel.findOne({
				verificationToken: code,
				verificationTokenExpiresAt: { $gt: Date.now() },
			})

			if (!user) {
				return res.status(400).json({
					success: false,
					message: 'Invalid or expired verification code',
				})
			}

			user.isVerified = true
			user.verificationToken = undefined
			user.verificationTokenExpiresAt = undefined
			await user.save()

			// await sendWelcomeEmail(user.email, user.name)

			res.status(200).json({
				success: true,
				message: 'Email verified successfully',
				user: {
					...user._doc,
					password: undefined,
				},
			})
		} catch (error) {
			console.log('error in verifyEmail ', error)
			res.status(500).json({ success: false, message: 'Server error' })
		}
	}
)

// User login route
userRouter.post(
	'/login',
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password } = req.body
		try {
			const user = await UserModel.findOne({ email })
			if (!user) {
				return res
					.status(400)
					.json({ success: false, message: 'Invalid credentials' })
			}
			const isPasswordValid = await bcryptjs.compare(password, user.password)
			if (!isPasswordValid) {
				return res
					.status(400)
					.json({ success: false, message: 'Invalid credentials' })
			}

			generateTokenAndSetCookie(res, user._id)

			user.lastLogin = new Date()
			await user.save()

			res.status(200).json({
				success: true,
				message: 'Logged in successfully',
				user: {
					...user._doc,
					password: undefined,
				},
			})
		} catch (error) {
			console.log('Error in login ', error)
			res.status(400).json({ success: false, message: error })
		}
	}
)

userRouter.post(
	'/forgot-password',
	async (req: Request, res: Response): Promise<void> => {
		const { email } = req.body

		try {
			const user = await UserModel.findOne({ email })

			if (!user) {
				res.status(400).json({ success: false, message: 'User not found' })
				return
			}

			// Generate reset token
			const resetToken = crypto.randomBytes(20).toString('hex')
			const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 // 1 hour

			user.resetPasswordToken = resetToken
			user.resetPasswordExpiresAt = resetTokenExpiresAt

			await user.save()

			// Send password reset email
			const resetLink = `https://azamjonov.com/reset-password/${resetToken}`
			// const resetLink = `http://localhost:3000/reset-password/${resetToken}`
			await sendPasswordResetEmail(user.email, resetLink)

			res.status(200).json({
				success: true,
				message: 'Password reset link sent to your email',
			})
		} catch (error: any) {
			console.error('Error in forgotPassword:', error)
			res.status(500).json({
				success: false,
				message: 'An error occurred. Please try again later.',
			})
		}
	}
)

userRouter.post(
	'/reset-password/:token',
	async (req: Request, res: Response): Promise<void> => {
		const { token } = req.params
		const { password } = req.body

		try {
			const user = await UserModel.findOne({
				resetPasswordToken: token,
				resetPasswordExpiresAt: { $gt: Date.now() },
			})

			if (!user) {
				res
					.status(400)
					.json({ success: false, message: 'Invalid or expired reset token' })
				return
			}

			// Update password
			const hashedPassword = await bcryptjs.hash(password, 10)
			user.password = hashedPassword
			console.log(user.password)
			await user.save()
			console.log('Password updated successfully:', hashedPassword)
			// Send success email
			await sendResetSuccessEmail(user.email)

			res
				.status(200)
				.json({ success: true, message: 'Password reset successful' })
		} catch (error: any) {
			console.error('Error in resetPassword:', error)
			res.status(500).json({
				success: false,
				message: 'An error occurred. Please try again later.',
			})
		}
	}
)

userRouter.post(
	'/logout',
	async (req: Request, res: Response): Promise<void> => {
		res.clearCookie('token')
		res.status(200).json({ success: true, message: 'Logged out successfully' })
	}
)

// checkAuth-+
userRouter.get('/check-auth', verifyToken, async (req, res) => {
	try {
		const user = await UserModel.findById(req.userId).select('-password')
		if (!user) {
			return res.status(400).json({ success: false, message: 'User not found' })
		}

		res.status(200).json({ success: true, user })
	} catch (error) {
		console.log('Error in checkAuth ', error)
		res.status(400).json({ success: false, message: error })
	}
})

export default userRouter
