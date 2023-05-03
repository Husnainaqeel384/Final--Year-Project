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
        image:'1682786345349-feature6.png'
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
    // const imagepath =path.join(__dirname, '..', 'uploads', user.image);
    // console.log(imagepath)
    res.status(StatusCodes.ACCEPTED).json({
        success: true,
        user: {
            user_id: user.user_id,
            Firstname: user.FirstName,
            Lastname: user.LastName,
            Username: user.UserName,
            role: user.role,
            email: user.email,
            imagepath: user.image
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
        return next(new ErrorHandler('User Not Found', StatusCodes.BAD_REQUEST))
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

export const deleteUser = catchAsyncError(async (req, res, next) => {
    const userId = req.params.userId;
    const user = await db('register').delete().where({ user_id: userId })
    if (!user) {
        return next(new ErrorHandler('User Not Found', StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.ACCEPTED).json({ message: "User Delete Successfully" })
}
)

export const uploadImage = catchAsyncError(async (req, res, next) => {
    const userId = req.user.id;
    const user = await db('register').update({ image: req.file.filename }).where({ user_id: userId })
    if (!user) {
        return next(new ErrorHandler('User Not Found', StatusCodes.BAD_REQUEST))
    }
    res.status(StatusCodes.ACCEPTED).json({ message: "User Image Upload Successfully" })
}
)

export const forgotPassword = catchAsyncError(async (req, res, next) => {

    const user = await db('register').where({ email: req.body.Email }).first('*');
    if (!user) {
        return next(new ErrorHandler("No such user exists", StatusCodes.BAD_REQUEST))
    }
    const token = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false })
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${token}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Shopit Password Recovery',
            message
        })
        res.status(StatusCodes.ACCEPTED).json({ success: true, message: `Email sent to: ${user.email}` })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false })
        return next(new ErrorHandler(error.message, StatusCodes.BAD_REQUEST))
    }
})

export const resetPassword = catchAsyncError(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await db('register').where({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } }).first('*');
    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', StatusCodes.BAD_REQUEST))
    }
    if (req.body.Password !== req.body.ConfirmPassword) {
        return next(new ErrorHandler('Password does not match', StatusCodes.BAD_REQUEST))
    }
    user.password = req.body.Password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, StatusCodes.ACCEPTED, res)
}
)

export const mainpagedata = catchAsyncError(async (req, res, next) => {

    const user_id = req.user.id
    const totalCount = await db('budget').count('* as total').where({ user_id: user_id }).first();

    const username = await db('register').select('UserName').where({user_id})
    const totalbillSpilterGroups = await db('billSplitter_detail').count('* as total').where({ MemberName: username[0].UserName }).first();
    const totalTransaction = await db('transactions').count('* as total').where({ user_id: user_id }).first();
    const totalPendingReminders = await db('reminders').count('* as total').where({ user_id: user_id, status: 'Pending' }).first();
    const totaldoneReminders = await db('reminders').count('* as total').where({ user_id: user_id, status: 'Done' }).first();
    const totalUser = await db('register').count('* as total').first();
res.status(StatusCodes.ACCEPTED).json({ totalBudgets: totalCount.total
    , totalbillSpilterGroups: totalbillSpilterGroups.total,
    totalTransaction: totalTransaction.total,
    totalPendingReminders: totalPendingReminders.total,
    totaldoneReminders: totaldoneReminders.total,
    totalUser: totalUser.total

})
}
)
