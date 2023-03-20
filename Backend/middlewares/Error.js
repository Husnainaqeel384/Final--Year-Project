import {StatusCodes}  from "http-status-codes"
// error custom middleware
const ErrorMiddleware  = (err,req,res,next)=>{

    err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    err.message = err.message || "Internal Server Error"

    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })


} 

export default ErrorMiddleware;