import { Request } from 'express'

declare global {
	namespace Express {
		interface Request {
			userId?: string // Optional or required based on your needs
		}
	}
}
