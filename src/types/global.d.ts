declare module 'express-serve-static' {
    interface Request {
        user: IPayload
    }
} 

declare module "express-validator"