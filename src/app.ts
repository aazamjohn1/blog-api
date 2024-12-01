import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './routes/userRoute'
import { errorHandlers } from './middlewares/errorHandler'
import fileRouter from './routes/fileRoute'
import axRouter from './routes/axRoute'
import axGameRoute from './routes/axGameRoute'
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
server.use(cors())
server.use(cookieParser())

server.use(errorHandlers)

// Routes
server.use('/user', userRouter)
server.use('/file', fileRouter)
server.use('/ax', axRouter)
server.use('/ax', axGameRoute)

export { server }
