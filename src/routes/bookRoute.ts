import { Request, Response, Router } from 'express'
import BookModel from '../schemas/bookSchema'

const bookRouter = Router()

// get all books
bookRouter.get('/all', async (req: Request, res: Response) => {
	try {
		const books = await BookModel.find({})
		res.json(books)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server Error' })
	}
})

// get by id
bookRouter.get('/:id', async (req: Request, res: Response) => {
	const { id } = req.params

	try {
		const book = await BookModel.findById(id)
		if (!book) return res.status(404).json({ message: 'Book not found' })
		res.json(book)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server Error' })
	}
})

// add a new book
bookRouter.post('/add', async (req: Request, res: Response) => {
	const { title, author, status, highlight, year } = req.body

	try {
		const newBook = new BookModel({
			title,
			author,
			year,
			highlight,
			status,
		})
		await newBook.save()
		res.json(newBook)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server Error' })
	}
})

// update a book
bookRouter.put('/update/:id', async (req: Request, res: Response) => {
	const { id } = req.params
	const { title, author, status, highlight, year } = req.body

	try {
		const updatedBook = await BookModel.findByIdAndUpdate(
			id,
			{ title, author, year, highlight, status },
			{ new: true }
		)
		if (!updatedBook) return res.status(404).json({ message: 'Book not found' })
		res.json(updatedBook)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server Error' })
	}
})

// delete a book
bookRouter.delete('/delete/:id', async (req: Request, res: Response) => {
	const { id } = req.params

	try {
		const deletedBook = await BookModel.findByIdAndDelete(id)
		if (!deletedBook) return res.status(404).json({ message: 'Book not found' })
		res.json({ message: 'Book deleted successfully' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server Error' })
	}
})

// get by slug
bookRouter.get('/slug/:slug', async (req: Request, res: Response) => {
	const { slug } = req.params

	try {
		const book = await BookModel.findOne({ slug })
		if (!book) return res.status(404).json({ message: 'Book not found' })
		res.json(book)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server Error' })
	}
})
export default bookRouter
