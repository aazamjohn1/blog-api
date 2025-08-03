export interface IUser {
	telegramId: { type: String, unique: true, sparse: true },
telegramCode: String,
telegramCodeExpiresAt: Date,
lastBotMessageId: Number,



}

export interface IPayload {
	_id: string
}
