import db from "../models/db.js";
import ErrorHandler from "../Error/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js"
//import Status Code
import { StatusCodes } from "http-status-codes"

export const Transactioninfo = catchAsyncError(async (req, res, next) => {

    const user_id = req.user.id;
    const {
        Transaction_type,
        Transaction_date,
        Transaction_amount,
        Transaction_senderName,
        Transaction_receiverName,
        Transaction_method,
        Transaction_description,
    }=req.body;
    const Transaction = await db("transactions").insert({
        user_id,
        Transaction_type,
        Transaction_date,
        Transaction_amount,
        Transaction_senderName,
        Transaction_receiverName,
        Transaction_method,
        Transaction_description,
    });
    if (!Transaction) {
        return next(new ErrorHandler("Transaction not added", StatusCodes.NOT_FOUND));
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Transaction added",
        Transaction,
    });
});

export const getTransaction = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const Transaction = await db("transactions").select('*').where({ user_id });
    if (!Transaction) {
        return next(new ErrorHandler("Transaction not found", StatusCodes.NOT_FOUND));
    }
    res.status(StatusCodes.OK).json({
        success: true,
        Transaction,
    });
});

export const deleteTransaction = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const  Transaction_id  = req.params.id;
    const Transaction = await db("transactions").where({ user_id, Transaction_id }).del();
    if (!Transaction) {
        return next(new ErrorHandler("Transaction not deleted", StatusCodes.NOT_FOUND));
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Transaction deleted",

    });
});
export const updateTransaction = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const Transaction_id  = req.params.id;
    const {
      
        Transaction_type,
        Transaction_date,
        Transaction_amount,
        Transaction_senderName,
        Transaction_receiverName,
        Transaction_method,
        Transaction_description,
    } = req.body;
    const Transaction = await db("transactions").where({ user_id, Transaction_id }).update({
        Transaction_type,
        Transaction_date,
        Transaction_amount,
        Transaction_senderName,
        Transaction_receiverName,
        Transaction_method,
        Transaction_description,
    }); 
    if (!Transaction) {
        return next(new ErrorHandler("Transaction not updated", StatusCodes.NOT_FOUND));
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Transaction updated",
    });
});
// export const getTransactionById = catchAsyncError(async (req, res, next) => {
//     const user_id = req.user.id;
//     const { Transaction_id } = req.body;
//     const Transaction = await db("transactions").select('*').where({ user_id, Transaction_id });
//     if (!Transaction) {
//         return next(new ErrorHandler("Transaction not found", StatusCodes.NOT_FOUND));
//     }
//     res.status(StatusCodes.OK).json({
//         success: true,
//         Transaction,
//     });
// }   );
