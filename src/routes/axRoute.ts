import { Router, Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import IaxModel from '../schemas/axSchema'

const axRouter = Router()

// Utility: Async Wrapper for Error Handling
const asyncHandler =
	(fn: Function) => (req: Request, res: Response, next: NextFunction) =>
		fn(req, res, next).catch(next)

// Define Request Interfaces
interface IRequestWithBody<T> extends Request {
	body: T
}

interface ICreateAxBody {
	arabicName: string
	[otherKey: string]: any // Allow additional fields
}

// Get All Names
axRouter.get(
	'/post',
	asyncHandler(async (req: Request, res: Response) => {
		const names = await IaxModel.find()
		if (!names.length) throw createHttpError(404, 'No names found')
		res.status(200).json(names)
	})
)

// Add New Name
axRouter.post(
	'/post',
	asyncHandler(async (req: IRequestWithBody<ICreateAxBody>, res: Response) => {
		const { arabicName } = req.body
		if (!arabicName) throw createHttpError(400, 'Name is required')
		const newAx = new IaxModel(req.body)
		const savedAx = await newAx.save()
		res.status(201).json({ id: savedAx._id })
	})
)

// Update Name
axRouter.put(
	'/post/:id',
	asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params
		const updatedAx = await IaxModel.findByIdAndUpdate(id, req.body, {
			new: true,
		})
		if (!updatedAx) throw createHttpError(404, 'Name not found')
		res.json(updatedAx)
	})
)

// Get Name by ID
axRouter.get(
	'/post/:id',
	asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params
		const ax = await IaxModel.findById(id)
		if (!ax) throw createHttpError(404, 'Name not found')
		res.json(ax)
	})
)

// Delete Name
axRouter.delete(
	'/post/:id',
	asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params
		const deletedAx = await IaxModel.findByIdAndDelete(id)
		if (!deletedAx) throw createHttpError(404, 'Name not found')
		res.json(deletedAx)
	})
)

export default axRouter

// should be done 
