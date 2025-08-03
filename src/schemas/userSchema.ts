import { Schema, model } from 'mongoose'
import { IUserModel } from '../types/local-users'
import { IUser } from '../types/userInterface'

const UserSchema = new Schema<IUser>({
telegramId: {
	type: Number,
	required: true,
	unique: true,
},
telegramCode: String,
telegramCodeExpiresAt: Date,
lastBotMessageId: Number, // make sure this is present


})

UserSchema.methods.toJSON = function () {
	const userObject = this.toObject()
	delete userObject.__v
	delete userObject.password
	return userObject
}

const UserModel = model<IUser, IUserModel>('User', UserSchema)
export default UserModel
