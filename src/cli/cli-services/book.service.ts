// services/bookService.ts
import BookModel from '../../schemas/bookSchema'
import dotenv from 'dotenv'
dotenv.config()
interface IBook {
	_id: string
	title: string
	author: string
	content: string
	slug?: string
}

const fetchBooksFromDB = async (): Promise<any[]> => {
	try {
		const books = await BookModel.find()
		return books
	} catch (error) {
		console.error('Error fetching books from DB:', error)
		throw error
	}
}

// Update a book in the database
const updateBookInDB = async (
	bookId: string,
	updatedData: any
): Promise<void> => {
	try {
		const updatedBook = await BookModel.findByIdAndUpdate(bookId, updatedData, {
			new: true,
		})
		if (!updatedBook) {
			console.error(`Book with id ${bookId} not found!`)
		} else {
			console.log(`Successfully updated book with id: ${bookId}`)
		}
	} catch (error) {
		console.error('Error updating book in DB:', error)
		throw error
	}
}

export { fetchBooksFromDB, updateBookInDB }
