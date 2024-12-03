import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import createHttpError from 'http-errors'

import blogSchema from '../schemas/blogSchema'

const blogRouter = Router()

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'uploads', // Folder name in Cloudinary account
		format: async (req: any, file: { mimetype: string }) => {
			const fileTypes = /jpeg|jpg|png|gif/
			const extname = fileTypes.test(file.mimetype)
				? file.mimetype.split('/')[1]
				: 'jpg'
			return extname
		},
		public_id: (req: any, file: any) => Date.now().toString(),
		resource_type: 'auto', // Ensures proper handling for image and gif uploads
	} as any, // Casting to `any` to bypass type errors
})

const upload = multer({ storage })

blogRouter.post(
	'/upload',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { file } = req.body

			if (!file) {
				return next(createHttpError(400, 'No file provided.'))
			}

			let uploadResponse

			if (file.startsWith('data:image')) {
				// Handle base64 image string
				uploadResponse = await cloudinary.uploader.upload(file, {
					folder: 'asad_talks',
					resource_type: 'image',
				})
			} else {
				// Return an error for unsupported formats
				return next(createHttpError(400, 'Unsupported file format.'))
			}

			res.status(200).json({
				url: uploadResponse.secure_url,
				publicId: uploadResponse.public_id,
			})
		} catch (error) {
			console.error('Error uploading image:', error)
			next(error)
		}
	}
)

blogRouter.post(
	'/',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { title, author, content, tags, coverImage, slug } = req.body

			// Validate required fields
			if (!title || !author || !content) {
				throw createHttpError(400, 'Title, author, and content are required')
			}

			// Handle cover image upload
			let imageData = null
			if (coverImage && typeof coverImage === 'string') {
				try {
					const uploadResponse = await cloudinary.uploader.upload(coverImage, {
						folder: 'blog',
					})
					imageData = {
						url: uploadResponse.secure_url,
						publicId: uploadResponse.public_id,
					}
				} catch (error) {
					console.error('Cloudinary upload error:', error)
					throw createHttpError(500, 'Error uploading cover image')
				}
			}

			// Create new blog post
			const post = new blogSchema({
				title,
				author,
				content,
				tags,
				slug,
				coverImage: {
					url: coverImage.url,
					publicId: coverImage.publicId,
				},
			})

			await post.save()
			res.status(201).json(post)
		} catch (error) {
			next(error)
		}
	}
)

// GetById
blogRouter.get(
	'/:id',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const post = await blogSchema.findById(req.params.id)
			if (!post) {
				throw createHttpError(404, 'Post not found')
			}
			res.json(post)
		} catch (error) {
			next(error)
		}
	}
)

//GetByslug
blogRouter.get(
	'/slug/:slug',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const post = await blogSchema.findOne({ slug: req.params.slug })
			if (!post) {
				throw createHttpError(404, 'Post not found')
			}
			res.json(post)
		} catch (error) {
			next(error)
		}
	}
)

export default blogRouter
