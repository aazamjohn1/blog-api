import { Schema, model } from 'mongoose'
import { IAxInterface } from '../types/IaxInterface'

const IAxSchema = new Schema<IAxInterface>(
	{
		number: { type: Number, required: true },
		arabicName: { type: String, required: true },
		translation: { type: String, required: true },
		transliteration: { type: String, required: true, unique: true },
		explanation: { type: String, required: true },
		quranChapter: { type: String, required: true },
		benefit: { type: String, required: true },
	},
	{
		timestamps: true,
	}
)

IAxSchema.methods.toJSON = function () {
	const postObject = this.toObject()
	delete postObject.__v

	return postObject
}

const IaxModel = model('names', IAxSchema)
export default IaxModel
