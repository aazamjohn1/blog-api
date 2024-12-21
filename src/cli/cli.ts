#!/usr/bin/env node

import { program } from 'commander'
import {
	fetchBooksFromDB,
	updateBookInDB,
} from '../cli/cli-services/book.service'
import { connectToDatabase } from './connect-db'
import { generateSlug } from './cli-services/utils.service'

const checkEnvironment = (env: 'prod' | 'staging') => {
	const isValidEnv = ['prod', 'staging'].includes(env)
	if (!isValidEnv) {
		console.error(
			`Invalid environment specified. Please choose either 'prod' or 'staging'.`
		)
		process.exit(1)
	}
}

// Define the CLI commands
program
	.option('-e, --env <env>', 'environment to connect to (prod/staging)', 'prod') // Default to 'prod'

	.command('update-slugs')
	.description('Update slugs for books without slugs')
	.action(async () => {
		const { env } = program.opts() as { env: 'prod' | 'staging' }

		// Check if the environment is valid before proceeding
		checkEnvironment(env)

		console.log(
			`Connecting to the ${
				env === 'prod' ? 'production' : 'staging'
			} database...`
		)

		// Connect to the database
		await connectToDatabase(env)

		// Fetch books that need slug updates
		const books = await fetchBooksFromDB()

		const booksToUpdate = books.filter(book => !book.slug)

		if (booksToUpdate.length === 0) {
			console.log('No books without slugs found.')
			return
		}

		console.log(
			`Found ${booksToUpdate.length} books without slugs. Updating...`
		)

		// Update the slugs for each book
		for (const book of booksToUpdate) {
			const newSlug = generateSlug(book.title)
			book.slug = newSlug
			await updateBookInDB(book._id, book) // Update book in the backend
			console.log(`Updated slug for book: ${book.title} to ${newSlug}`)
		}

		console.log('Slugs updated successfully!')
	})

// Parse the command-line arguments
program.parse(process.argv)
