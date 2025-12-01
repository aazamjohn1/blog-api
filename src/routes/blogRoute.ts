import { v2 as cloudinary } from 'cloudinary'
import { NextFunction, Request, Response, Router } from 'express'
import createHttpError from 'http-errors'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

import blogSchema from '../schemas/blogSchema'
import { notifyAllUsers } from '../service/telegram.service'

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

// getAllPosts
blogRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const posts = await blogSchema.find({})
		res.json(posts)
	} catch (error) {
		next(error)
	}
})

// GetById
blogRouter.get(
	'/:id',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const post = await blogSchema.findByIdAndUpdate(
				req.params.id,
				{ $inc: { views: 1 } },
				{ new: true }
			)
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

			post.requestCount += 1

			if (post.requestCount % 10 === 0) {
				post.views += 1
			}

			await post.save()

			res.json(post)
		} catch (error) {
			next(error)
		}
	}
)

// UpdateById
blogRouter.put(
	'/:id',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			const { title, author, content, tags, coverImage, slug, status } =
				req.body

			// Find the post by ID
			const post = await blogSchema.findById(id)
			if (!post) {
				throw createHttpError(404, 'Post not found')
			}

			// Handle cover image update if a new image is provided
			if (coverImage && typeof coverImage === 'string') {
				try {
					// Delete the old image if it exists
					if (post.coverImage?.publicId) {
						await cloudinary.uploader.destroy(post.coverImage.publicId)
					}

					// Upload the new image
					const uploadResponse = await cloudinary.uploader.upload(coverImage, {
						folder: 'blog',
					})

					// Update the image data
					post.coverImage = {
						url: uploadResponse.secure_url,
						publicId: uploadResponse.public_id,
					}
				} catch (error) {
					console.error('Cloudinary upload error:', error)
					throw createHttpError(500, 'Error uploading cover image')
				}
			}

			// Update other fields
			post.title = title
			post.author = author
			post.content = content
			post.tags = tags || post.tags
			post.slug = slug || post.slug
			post.updatedAt = new Date()
			post.coverImage = coverImage
			post.status = status || post.status

			// Save the updated post
			const updatedPost = await post.save()
			res.status(200).json(updatedPost)
		} catch (error) {
			next(error)
		}
	}
)

// delete by id
blogRouter.delete(
	'/:id',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			const post = await blogSchema.findByIdAndDelete(id)
			if (!post) {
				throw createHttpError(404, 'Post not found')
			}

			// Delete the cover image if it exists
			if (post.coverImage?.publicId) {
				await cloudinary.uploader.destroy(post.coverImage.publicId)
			}

			res.status(204).send()
		} catch (error) {
			next(error)
		}
	}
)
// patch by id and update status
blogRouter.patch(
	'/status/:id',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params
			const { status } = req.body

			const post = await blogSchema.findByIdAndUpdate(
				id,
				{ status },
				{ new: true }
			)
			if (!post) {
				throw createHttpError(404, 'Post not found')
			}
			if (status === 'Published') {
						await notifyAllUsers(
				`<img src="${post.coverImage?.url}" /> \n\n📌 <b>${post.title}</b>\n\n🔗 <a href="https://blog.azamjonov.io/blog/${post.slug}">blog.azamjonov.io/blog/${post.slug}</a>`,
				{ parse_mode: "HTML" }
			);
			}
			res.status(200).json(post)
		} catch (error) {
			next(error)
		}
	}
)

export default blogRouter
