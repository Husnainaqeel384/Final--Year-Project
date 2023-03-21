import db from "../models/db.js";
import ErrorHandler from "../Error/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js"
//import Status Code
import { StatusCodes } from "http-status-codes"

export const reminderinfo = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const {Reminder_title,ReminderDate}= req.body;
    const reminder = await db('Reminder').insert({user_id,Reminder_title,ReminderDate})
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Reminder added successfully"
    })
})