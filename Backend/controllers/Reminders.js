import db from "../models/db.js";
import ErrorHandler from "../Error/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js"
//import Status Code
import { StatusCodes } from "http-status-codes"


export const reminderinfo = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const {Reminder_title,ReminderDate}= req.body;
    console.log(Reminder_title,ReminderDate)
    const reminder = await db('reminders').insert({user_id,Reminder_title,ReminderDate})
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Reminder added successfully"
    })
})
export const getreminder = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const reminder = await db('reminders').where({user_id})
    res.status(StatusCodes.OK).json({
        success: true,
        data: reminder
    })
})