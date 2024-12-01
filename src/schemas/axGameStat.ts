import { Schema, model } from 'mongoose'
import { IAxGameInterface } from '../types/IaxGamestat'

const IAxGameSchema = new Schema<IAxGameInterface>({
	userId: String,
	userName: String,
	gamesPlayed: Number,
	totalScore: Number,
	lastGameDate: Date,
})

IAxGameSchema.methods.toJSON = function () {
	const postObject = this.toObject()
	delete postObject.__v

	return postObject
}

const IaxGameModel = model('stats', IAxGameSchema)
export default IaxGameModel
