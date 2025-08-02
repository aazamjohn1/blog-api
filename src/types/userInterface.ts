export interface IUser {
	telegramId: { type: String, unique: true, sparse: true },
telegramCode: String,
telegramCodeExpiresAt: Date,

}

export interface IPayload {
	_id: string
}
