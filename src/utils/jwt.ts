import jwt from 'jsonwebtoken'
import { Response } from 'express'
import dotenv from 'dotenv'
dotenv.config()
export const generateTokenAndSetCookie = (
	res: Response,
	userId: string
): string => {
	const { JWT_SECRET, NODE_ENV } = process.env

	if (!JWT_SECRET) {
		throw new Error('Missing JWT_SECRET environment variable')
	}

	// Generate JWT token
	const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1min' })

	// Set token as HTTP-only cookie
	res.cookie('token', token, {
		httpOnly: true,
		secure: NODE_ENV === 'production', // Use secure cookies in production
		sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
		maxAge: 30 * 60 * 1000,
	})

	return token
}
