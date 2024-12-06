import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export const verifyToken = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies?.token

	if (!token) {
		return res.status(401).json({ message: 'Authentication token is missing' })
	}

	const JWT_SECRET = process.env.JWT_SECRET
	if (!JWT_SECRET) {
		console.error('JWT_SECRET is not defined.')
		throw new Error('JWT_SECRET is not defined in the environment')
	}

	try {
		console.log('Token for verification:', token)
		const decoded = jwt.verify(token, JWT_SECRET)
		console.log('Verified Token Payload:', decoded)
		req.userId = (decoded as { userId: string }).userId
		next()
	} catch (error: any) {
		console.error('Token verification failed with error:', error.message)
		res.status(401).json({ message: 'Invalid or expired token' })
	}
}
