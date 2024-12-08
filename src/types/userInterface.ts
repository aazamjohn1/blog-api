export interface IUser {
	_id: string
	fullName: string
	avatar: string
	email: string
	password: string
	lastLogin: Date
	isVerified: boolean
	role: string
	verificationToken: string
	verificationTokenExpiresAt: Date
	resetPasswordToken: string
	resetPasswordExpiresAt: Date
}

export interface IPayload {
	_id: string
}
