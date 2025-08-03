export interface IUser {
	telegramId: { type: String, unique: true, sparse: true },
telegramCode: String,
telegramCodeExpiresAt: Date,
lastBotMessageId: Number,
	username?: string,
	phone?: string,
	fullName?: string,

}

export interface IPayload {
	_id: string
}
