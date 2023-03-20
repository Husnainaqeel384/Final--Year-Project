import jwt from "jsonwebtoken";
import ErrorHandler from "../Error/errorHandler.js"
import { StatusCodes } from "http-status-codes";

export const verifyToken = (req, res, next) => {
    // let token = req.header["Authorization"]; 
    let authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return next(new ErrorHandler("No token provided!", StatusCodes.FORBIDDEN))
    }
    let token = authHeader.split(' ')[1]
   
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decode) => {
        if (err) {
            return next(new ErrorHandler("Unauthorized", StatusCodes.UNAUTHORIZED))
        }
        req.user = decode
        next()
    })
}