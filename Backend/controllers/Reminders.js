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
    const reminder = await db('reminders').where({user_id}).orderBy('Reminder_id','desc')
    res.status(StatusCodes.OK).json({
        success: true,
        data: reminder
    })
})

export const StatusDone = catchAsyncError(async (req, res, next) => {
    const {Reminder_id}= req.body;
    const reminder = await db('reminders').where({Reminder_id}).update({Status:'Done'})
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Reminder Status updated successfully"
    })
}
)
export const  DeleteReminder = catchAsyncError(async (req, res, next) => {
    const {Reminder_id} = req.body
    const reminder = await db('reminders').where({Reminder_id}).del()
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Reminder deleted successfully"
    })
})