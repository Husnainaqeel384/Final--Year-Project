import db from "../models/db.js";
import ErrorHandler from "../Error/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js"
//import Status Code
import { StatusCodes } from "http-status-codes"

export const getCategories = catchAsyncError(async (req, res, next) => {
    const categories = await db('categories').select('*');
    if (!categories) {
        return next(new ErrorHandler("No Categories Found", StatusCodes.NOT_FOUND))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        categories
    })
})

export const getsubCategories = catchAsyncError(async (req, res, next) => {
    console.log(req.query.categoryId)
    const subCategories = await db('subcategory').select('*').where({category_id:req.query.categoryId});
    if (!subCategories) {
        return next(new ErrorHandler("No SubCategories Found", StatusCodes.NOT_FOUND))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        subCategories
    })
})
export const subCategories = catchAsyncError(async (req, res, next) => {
  
    const subCategories = await db('subcategory').select('*');
    if (!subCategories) {
        return next(new ErrorHandler("No SubCategories Found", StatusCodes.NOT_FOUND))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        subCategories
    })
})
