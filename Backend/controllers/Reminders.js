import db from "../models/db.js";
import ErrorHandler from "../Error/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js"
//import Status Code
import { StatusCodes } from "http-status-codes"


export const reminderinfo = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const {Reminder_title,ReminderDate}= req.body;
    
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
    const user_id = req.user.id;
    const {Reminder_id}= req.body;
    const reminder = await db('reminders').where({Reminder_id,user_id}).update({Status:'Done'})
    if(!reminder){
        return next(new ErrorHandler("Reminder not updated", StatusCodes.NOT_FOUND));
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Reminder Status updated successfully"
        
    })
}
)
export const  DeleteReminder = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const {Reminder_id} = req.body
    const reminder = await db('reminders').where({Reminder_id,user_id}).del()
    if(!reminder){
        return next(new ErrorHandler("Reminder not deleted", StatusCodes.NOT_FOUND));
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Reminder deleted successfully"
    })
})
export const  UpdateReminder = catchAsyncError(async (req, res, next) => {
   const user_id = req.user.id;
    const {Reminder_id,Reminder_title,ReminderDate} = req.body
    const reminder = await db('reminders').where({Reminder_id,user_id}).update({Reminder_title,ReminderDate})
  if(!reminder){
        return next(new ErrorHandler("Reminder not updated", StatusCodes.NOT_FOUND));
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Reminder updated successfully"
    })
})