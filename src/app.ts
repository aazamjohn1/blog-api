import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './routes/userRoute'
import axRouter from './routes/axRoute'
import axGameRoute from './routes/axGameRoute'
import blogRouter from './routes/blogRoute'
const server = express()

const whitelist = ['http://localhost:3000']

// const corsOptions = {
//   origin: function (origin: any, callback: any) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }},
//     credentials: true
// }

// Middlewares
server.use(express.json())
server.use(cors({ origin: 'https://azamjonov.com', credentials: true }))
// server.use(cors())
server.use(cookieParser())

// Routes
server.use('/user', userRouter)
server.use('/blogs', blogRouter)
server.use('/ax', axRouter)
server.use('/ax', axGameRoute)

export { server }
