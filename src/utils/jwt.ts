import jwt from 'jsonwebtoken'
import { Response } from 'express'

export const generateTokenAndSetCookie = (
	res: Response,
	userId: string
): string => {
	const { JWT_SECRET, NODE_ENV } = process.env

	if (!JWT_SECRET) {
		throw new Error('Missing JWT_SECRET environment variable')
	}

	// Generate JWT token
	const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

	// Set token as HTTP-only cookie
	res.cookie('token', token, {
		httpOnly: true,
		secure: NODE_ENV === 'production', // Use secure cookies in production
		sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
	})

	return token
}
