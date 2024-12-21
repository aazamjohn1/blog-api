import mongoose from 'mongoose'

const connectToDatabase = async (env: 'prod' | 'staging'): Promise<void> => {
	console.log(process.env.DB_URI_PROD!)
	const dbUri =
		env === 'prod' ? process.env.DB_URI_PROD : process.env.DB_URI_STAGING

	try {
		await mongoose.connect(dbUri!)
		console.log(
			`Connected to ${env === 'prod' ? 'production' : 'staging'} database.`
		)
	} catch (error) {
		console.error(`Failed to connect to ${env} database`, error)
		process.exit(1) // Exit process on failure
	}
}

export { connectToDatabase }
