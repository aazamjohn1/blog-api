import { Schema, model } from 'mongoose'
import { IBook } from '../types/IaxGamestat'
const BookSchema = new Schema<IBook>(
	{
		title: { type: String, required: true },
		author: { type: String, required: true },
		highlight: { type: Boolean, required: true, default: false },
		status: { type: String, required: true },
		year: { type: Number, required: true },
		content: { type: String },
	},
	{
		timestamps: true,
	}
)

BookSchema.methods.toJSON = function () {
	const postObject = this.toObject()
	delete postObject.__v

	return postObject
}

const BookModel = model('books', BookSchema)
export default BookModel
