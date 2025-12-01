import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from "dotenv"
import express from 'express'
import blogRouter from './routes/blogRoute'
import bookRouter from './routes/bookRoute'
import userRouter from './routes/userRoute'
dotenv.config();

const server = express()

const whitelist = [
	'http://localhost:3000',
	'https://blog.azamjonov.io',
	'https://www.blog.azamjonov.io',
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
server.use(express.json({ limit: '10mb' }))
server.use(express.urlencoded({ limit: '10mb', extended: true }))

server.use(cors(corsOptions))
server.use(cookieParser())

// Routes
server.use('/user', userRouter)
server.use('/blogs', blogRouter)
server.use('/api/book', bookRouter)

export { server }
