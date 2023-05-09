import db from "../models/db.js";
import ErrorHandler from "../Error/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js"
//import Status Code
import { StatusCodes } from "http-status-codes"

export const addnotes = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const { Notes } = req.body;
    const addnotes = await db('AddNotes').insert({ Notes, user_id });
    if (!addnotes) {
        return next(new ErrorHandler("AddNotes not added", StatusCodes.INTERNAL_SERVER_ERROR))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Notes Added Successfully",
    });
})

export const getnotes = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const getnotes = await db('AddNotes').where({ user_id });
    if (!getnotes) {
        return next(new ErrorHandler("AddNotes not found", StatusCodes.INTERNAL_SERVER_ERROR))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Notes get Successfully",
        getnotes
    });
})

export const updatenote = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const Noteid  = req.params.NoteId;
    const { Notes } = req.body;
    const updatenotes = await db('AddNotes').where({ user_id,id:Noteid }).update({ Notes });
    if (!updatenotes) {
        return next(new ErrorHandler("AddNotes not updated", StatusCodes.INTERNAL_SERVER_ERROR))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Notes updated Successfully",
    });
}
)

export const deletenote = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const  deletNoteid  = req.params.deletNoteId;
    const deletenotes = await db('AddNotes').where({
        user_id,
        id: deletNoteid
    }).del();
    if (!deletenotes) {
        return next(new ErrorHandler("AddNotes not deleted", StatusCodes.INTERNAL_SERVER_ERROR))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Notes deleted Successfully",
    });
})