import { Schema, model } from 'mongoose'
import { IUserModel } from '../types/local-users'
import { IUser } from '../types/userInterface'

const UserSchema = new Schema<IUser>({
	telegramId: { type: String, unique: true, sparse: true },
telegramCode: String,
telegramCodeExpiresAt: Date,

})

UserSchema.methods.toJSON = function () {
	const userObject = this.toObject()
	delete userObject.__v
	delete userObject.password
	return userObject
}

const UserModel = model<IUser, IUserModel>('User', UserSchema)
export default UserModel
