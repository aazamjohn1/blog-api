export interface IUser {
	telegramId: { type: String, unique: true, sparse: true },
telegramCode: String,
telegramCodeExpiresAt: Date,
lastBotMessageId: Number,
	username?: string,
	phone?: string,
	fullName?: string,
	role?: string
	accessToken: string
	refreshToken: string
	lastLogin: Date,
	lastSentMessageId: number,
lastSentMessageHash: String | null, 

}

export interface IPayload {
	_id: string
}
