import { Router, Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import IaxGameModel from '../schemas/axGameStat'

const axGameRoute = Router()

axGameRoute.post('/api/update-stats', async (req, res) => {
	const { userId, userName, score } = req.body

	const stat = await IaxGameModel.findOne({ userId })
	if (stat) {
		stat.gamesPlayed += 1
		stat.totalScore += score
		stat.lastGameDate = new Date()
		await stat.save()
	} else {
		await IaxGameModel.create({
			userId,
			userName,
			gamesPlayed: 1,
			totalScore: score,
			lastGameDate: new Date(),
		})
	}

	res.json({ message: 'Stats updated successfully' })
})

axGameRoute.get('/api/get-leaderboard', async (req, res) => {
	const leaderboard = await IaxGameModel.find()
		.sort({ totalScore: -1 })
		.limit(10)
	res.json(leaderboard)
})
