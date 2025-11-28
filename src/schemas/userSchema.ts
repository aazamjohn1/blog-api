import { Schema, model } from "mongoose";
import { IUser } from "../types/userInterface";

const UserSchema = new Schema<IUser>(
	{
		telegramId: {
			type: Number,
			required: true,
			unique: true,
		},

		username: {
			type: String,
			default: null,
		},

		fullName: {
			type: String,
			default: null,
		},

		role: {
			type: String,
			enum: ["admin", "user"],
			default: "user",
		},

		telegramCode: {
			type: String,
			default: null,
		},

		telegramCodeExpiresAt: {
			type: Date,
			default: null,
		},

		lastBotMessageId: {
			type: Number,
			default: null,
		},
    accessToken: {
			type: String,
			default: null
		},
		// JWT refresh token for session
		refreshToken: {
			type: String,
			default: null,
		},

		lastLogin: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

// Cleaner JSON output
UserSchema.methods.toJSON = function () {
	const user = this.toObject();
	delete user.__v;
	// delete user.refreshToken; // Never expose refresh token
	return user;
};

const UserModel = model<IUser>("User", UserSchema);
export default UserModel;
