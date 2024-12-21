// utils/slugify.ts
import slugify from 'slugify'

const generateSlug = (title: string): string => {
	return slugify(title, { lower: true, strict: true })
}

export { generateSlug }
