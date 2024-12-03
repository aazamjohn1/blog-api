import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			unique: true,
			trim: true,
		},
		author: {
			type: String,
			required: true,
			trim: true,
		},
		content: {
			type: String,
			required: true,
		},
		tags: [
			{
				type: String,
				trim: true,
				default: 'general',
			},
		],
		coverImage: {
			url: String,
			publicId: String,
		},
		status: {
			type: String,
			enum: ['draft', 'published'],
			default: 'draft',
		},
		views: {
			type: Number,
			default: 0,
		},
		comments: [
			{
				author: String,
				content: String,
				postedAt: { type: Date, default: Date.now },
			},
		],
	},
	{
		timestamps: true,
	}
)

export default mongoose.model('asad-talk', blogSchema)
