export interface IUser {
  username: string;
  password: string;
  fullName?: string;
  role?: string;
  accessToken: string;
  refreshToken: string;
  lastLogin: Date;
}

export interface IPayload {
  _id: string;
}
