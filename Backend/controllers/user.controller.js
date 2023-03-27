import db from "../models/db.js";
import cryptoRandomString from 'crypto-random-string';
import ErrorHandler from "../Error/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js"
//import Status Code
import { StatusCodes } from "http-status-codes"
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"


export const register = catchAsyncError(async (req, res, next) => {
    const uniqueUserId = cryptoRandomString({ length: 6, type: 'numeric' })
    const registerData = [{
        user_id: uniqueUserId,
        FirstName: req.body.fname,
        LastName: req.body.lname,
        email: req.body.Email,
        UserName: req.body.username,
        //psassword bcrypt
        password: await bcrypt.hash(req.body.Password, 10),
    }]
    //check user exist or not
    const Existuser = await db('register').select('email').where({ email: req.body.Email });
    if (Existuser.length > 0) {
        return next(new ErrorHandler("User Already Exits", StatusCodes.CONFLICT))
    }
    const AddUser = await db('register').insert(registerData);
    if (!AddUser) {
        return next(new ErrorHandler("Data Not Added", StatusCodes.CONFLICT))
    }
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: "User Register Successfully"
    })

});

// Login api 

export const login = catchAsyncError(async (req, res, next) => {

    const user = await db('register').where({ email: req.body.Email }).first('*');
    if (!user) {
        return next(new ErrorHandler("No such user exists", StatusCodes.BAD_REQUEST))
    }
    const checkPassword = await bcrypt.compare(req.body.Password, user.password);
    //check password is correct
    if (!checkPassword) {
        return next(new ErrorHandler("Invalid Credentials", StatusCodes.UNAUTHORIZED))
    }
    const useremail = user.email;
    const userRole = user.role;
    const token = jwt.sign({ id: user.user_id, useremail, userRole }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRED
    })
    res.status(StatusCodes.ACCEPTED).json({
        success: true,
        message: "Login Succssfully",
        user,
        token,
    })
})

export const userProfile = catchAsyncError(async (req, res, next) => {
    const Email = req.user.useremail;
    const UserId = req.user.id
    const user = await db('register').where({ email: Email }).andWhere(function () {
        this.where({ user_id: UserId })
    }).first('*');
    if (!user) {
        return next(new ErrorHandler("No such user exists", StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.ACCEPTED).json({
        success: true,
        user: {
            user_id: user.user_id,
            Firstname: user.FirstName,
            Lastname: user.LastName,
            Username: user.UserName,
            role: user.role,
            email: user.email
        }
    })

})

// update User Profile

export const updateProfile = catchAsyncError(async (req, res, next) => {
    const UserId = req.user.id
    const updateData = [{
        FirstName: req.body.fname,
        LastName: req.body.lname,
        UserName: req.body.username,
        email: req.body.Email,
    }]
    const user = await db('register').update({
        FirstName: req.body.fname, LastName: req.body.lname, UserName: req.body.username,
        email: req.body.Email
    }).where({ user_id: UserId })
    if (!user) {
        return next(new ErrorHandler('User Not Update Successfully', StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.ACCEPTED).json({ message: "User Update Successfully" })
})

export const getuserdata = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id
    const user = await db('register').select('*').where({ user_id: user_id });
    if (!user) {
        return next(new ErrorHandler('User Not Update Successfully', StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.ACCEPTED).json({ user })
})

export const getAllUsers = catchAsyncError(async (req, res, next) => {
    
    if (req.user.userRole !== 'Admin') {
        return next(new ErrorHandler('You are not allowed to access this route', StatusCodes.UNAUTHORIZED))
    }
    const user = await db('register').select('*');
    if (!user) {
        return next(new ErrorHandler('User Not Update Successfully', StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.ACCEPTED).json({ user })
})

export const updateRole = catchAsyncError(async (req, res, next) => {

    const userId = req.params.userId;
    const userRole = req.body.role;
    const user = await db('register').update({ role: userRole }).where({ user_id: userId })
    if (!user) {
        return next(new ErrorHandler('User Not Update Successfully', StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.ACCEPTED).json({ message: "User Update Successfully" })
}
)