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
    // console.log(req.query.categoryId)
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

export const AddCategory = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    if (req.user.userRole !== 'Admin') {
        return next(new ErrorHandler('You are not allowed to access this route', StatusCodes.UNAUTHORIZED))
    }
    if(user_id != 1){
        return next(new ErrorHandler("You are not authorized to add category", StatusCodes.UNAUTHORIZED))
    }
    const category_name = req.body.name
    const category = await db('categories').select('*').where({category_name});
    if(category.length > 0){
        return next(new ErrorHandler("Category already exists", StatusCodes.BAD_REQUEST))
    }
    const addcategory = await db('categories').insert({category_name});
    if (!addcategory) {
        return next(new ErrorHandler("Category not added", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message:"Category added successfully"
    })
})

export const updateCategory = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    if (req.user.userRole !== 'Admin') {
        return next(new ErrorHandler('You are not allowed to access this route', StatusCodes.UNAUTHORIZED))
    }
    if(user_id != 1){
        return next(new ErrorHandler("You are not authorized to add category", StatusCodes.UNAUTHORIZED))
    }
    const category_name = req.body.name
    const category_id = req.params.id
    const categoryUpdate = await db('categories').update({category_name}).where({category_id});
    if (!categoryUpdate) {
        return next(new ErrorHandler("Category not updated", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message:"Category updated successfully"
    })
})

export const deleteCategory = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    if (req.user.userRole !== 'Admin') {
        return next(new ErrorHandler('You are not allowed to access this route', StatusCodes.UNAUTHORIZED))
    }
    if(user_id != 1){
        return next(new ErrorHandler("You are not authorized to add category", StatusCodes.UNAUTHORIZED))
    }
    const category_id = req.params.id
    const categoryDelete = await db('categories').delete().where({category_id});
    if (!categoryDelete) {
        return next(new ErrorHandler("Category not deleted", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message:"Category deleted successfully"
    })
})
export const AddSubCategory = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    if (req.user.userRole !== 'Admin') {
        return next(new ErrorHandler('You are not allowed to access this route', StatusCodes.UNAUTHORIZED))
    }
    if(user_id != 1){
        return next(new ErrorHandler("You are not authorized to add category", StatusCodes.UNAUTHORIZED))
    }
    const subCategoryName = req.body.name
    const category_id = req.body.category_id
    const subcategory = await db('subcategory').select('*').where({subCategoryName});
    if(subcategory.length > 0){
        return next(new ErrorHandler("SubCategory already exists", StatusCodes.BAD_REQUEST))
    }
    const addsubcategory = await db('subcategory').insert({subCategoryName,category_id});
    if (!addsubcategory) {
        return next(new ErrorHandler("SubCategory not added", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message:"SubCategory added successfully"
    })
})
export const updateSubCategory = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    if (req.user.userRole !== 'Admin') {
        return next(new ErrorHandler('You are not allowed to access this route', StatusCodes.UNAUTHORIZED))
    }
    if(user_id != 1){
        return next(new ErrorHandler("You are not authorized to add category", StatusCodes.UNAUTHORIZED))
    }
    const subCategoryName = req.body.name
    const category_id = req.body.category_id
    const subCategory_id = req.params.id
    const subcategoryUpdate = await db('subcategory').update({subCategoryName,category_id}).where({subCategory_id});
    if (!subcategoryUpdate) {
        return next(new ErrorHandler("SubCategory not updated", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message:"SubCategory updated successfully"
    })
}
)
export const deleteSubCategory = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    if (req.user.userRole !== 'Admin') {
        return next(new ErrorHandler('You are not allowed to access this route', StatusCodes.UNAUTHORIZED))
    }
    if(user_id != 1){
        return next(new ErrorHandler("You are not authorized to add category", StatusCodes.UNAUTHORIZED))
    }
    const subCategory_id = req.params.id
    const subcategoryDelete = await db('subcategory').delete().where({subCategory_id});
    if (!subcategoryDelete) {
        return next(new ErrorHandler("SubCategory not deleted", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message:"SubCategory deleted successfully"
    })
}
)