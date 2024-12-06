import { Schema, model } from 'mongoose'
import { IUserModel } from '../types/local-users'
import { IUser } from '../types/userInterface'

const UserSchema = new Schema<IUser>({
	fullName: { type: String, required: true },
	avatar: {
		type: String,
		default: function () {
			return `https://ui-avatars.com/api/?name=${this.fullName}`
		},
	},
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	lastLogin: {
		type: Date,
		default: Date.now,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	resetPasswordToken: String,
	resetPasswordExpiresAt: Date,
	verificationToken: String,
	verificationTokenExpiresAt: Date,
})

UserSchema.methods.toJSON = function () {
	const userObject = this.toObject()
	delete userObject.__v
	delete userObject.password
	return userObject
}

const UserModel = model<IUser, IUserModel>('User', UserSchema)
export default UserModel
