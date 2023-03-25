import db from '../models/db.js';
import ErrorHandler from '../Error/errorHandler.js';
import { catchAsyncError } from '../middlewares/catchAsyncError.js';
//import Status Code
import { StatusCodes } from 'http-status-codes';
import pdfDoucment from 'pdfkit';
function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
  
    return year + "/" + month + "/" + day;
  }
export const getReport = catchAsyncError(async (req, res, next) => {

    // const user_id = req.user.id;
    const budgetdetail = await db('budget_detail').select('*');
    const doc = new pdfDoucment();
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);
    doc.fontSize(20).text('Budget Report', {
        underline: true,
        align: 'center',
    });
    doc.moveDown();
    doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, 100)
    .lineTo(550, 100)
    .stroke();
    doc
    .fillColor('#0000ff')
    .fontSize(20)
    .text('Budget Book', 50, 65)
    .fontSize(10)
    .text('Date', 200, 55, { align: 'right' })
    .text(formatDate(new Date()), 200, 65, { align: 'right' })
    




doc.end();
});