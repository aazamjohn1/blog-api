import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './routes/userRoute'
import axRouter from './routes/axRoute'
import axGameRoute from './routes/axGameRoute'
import blogRouter from './routes/blogRoute'
import bookRouter from './routes/bookRoute'

const server = express()

const whitelist = [
	'http://localhost:3000',
	'https://azamjonov.com',
	'https://www.azamjonov.com',
	'https://asmoul-husna.azamjonov.com',
]

// CORS options
const corsOptions = {
	origin: function (origin: any, callback: any) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true)
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	},
	credentials: true,
}

// Middlewares
server.use(express.json({ limit: '10mb' })) // Increase limit for JSON payloads
server.use(express.urlencoded({ limit: '10mb', extended: true })) // Increase for URL-encoded

server.use(cors(corsOptions))
server.use(cookieParser())

// Routes
server.use('/user', userRouter)
server.use('/blogs', blogRouter)
server.use('/ax', axRouter)
server.use('/ax', axGameRoute)
server.use('/api/book', bookRouter)

export { server }
