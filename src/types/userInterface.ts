export interface IUser {
    _id: string
    firstName: string
    lastName: string
    avatar: string
    email: string
    password: string
    websites: string[]
    refreshToken?: string
}

export interface IPayload {
    _id: string
}