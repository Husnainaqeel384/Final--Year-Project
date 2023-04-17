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
  const tableHeaders = ['Name', 'Age'];
  const tableData = [
    ['John Doe', 30],
    ['Jane Smith', 25]
  ];

  // Set up the table
  // const table = {
  //   headers: tableHeaders,
  //   rows: tableData
  // };
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

  doc.moveDown();
  // doc.table(table);
  const data = [
    { label: 'Apple', value: 50 },
    { label: 'Banana', value: 20 },
    { label: 'Cherry', value: 30 },

  ];
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const chartX = 100;
  const chartY = 100;
  const chartWidth = 100;
  const chartHeight = 100;
  const centerX = chartX + chartWidth / 2;
  const centerY = chartY + chartHeight / 2;
  const radius = chartWidth / 2;

  let currentAngle = -Math.PI / 2;

  data.forEach((item) => {
    const angle = (item.value / total) * 2 * Math.PI;
    doc
      .moveTo(centerX, centerY)
      .lineTo(centerX + Math.cos(currentAngle) * radius, centerY + Math.sin(currentAngle) * radius)
      .arc(centerX, centerY, radius, currentAngle, currentAngle + angle)
      .fill(item.color || '#ccc');

    currentAngle += angle;
  });
  let legendX = chartX + chartWidth + 50;
  let legendY = chartY;

  data.forEach((item) => {
    doc
      .rect(legendX, legendY, 20, 20)
      .fill(item.color || '#ccc');

    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#000')
      .text(item.label, legendX + 30, legendY + 10);

    legendY += 30;
  });



  doc.end();
});

// get months
export const getMonths = catchAsyncError(async (req, res, next) => {
  const user_id = req.user.id;
  const months = await db('budget').select('BudgetMonth').where({ user_id }).distinct();
  res.status(StatusCodes.OK).json({
    success: true,
    months
  })
});

//generate report
export const generateReport = catchAsyncError(async (req, res, next) => {
  const user_id = req.user.id;
  const month = req.params.month;
  // split month and year
  const monthName = month.split("-")[0];
  const year = month.split("-")[1]
  //get month number
  const date = new Date(`${monthName},${year}`);
  const monthNumber = date.getMonth() + 1
  //get previous month number
  const prevMonth1 = monthNumber === 1 ? 12 : monthNumber - 1;
  // get previous month name
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const prevMonthName = months[prevMonth1 - 1];
  const prevMonth = `${prevMonthName}-${year}`;

  const previousMonth = await db('budget').select('*').where({ user_id }).where('BudgetMonth', prevMonth);

  const budget = await db('budget').select('*').where({ user_id }).where('BudgetMonth', month)

  if (budget[0].BudgetMonth === month) {
    // return next(new ErrorHandler(`No Budget for ${month}`, StatusCodes.NOT_FOUND));
    console.log(budget[0].budget_id)
    const budgetdetail = await db('budget_detail').select('*').where({ user_id, budget_id: budget[0].budget_id });
    let totalbudgetAmount = budgetdetail.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.Amount;
    }, 0);
    let totalRemianingAmount = budgetdetail.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.remainingAmount;
    }, 0);
    const totalSpentAmount = totalbudgetAmount - totalRemianingAmount;
    // this is the total saving amount subtract total budget amount from total spent amount
    const totalSavingAmount = totalbudgetAmount - totalSpentAmount;
    res.status(StatusCodes.OK).json({
      success: true,
      previousMonth,
      budget,
      budgetdetail,
      totalbudgetAmount,
      totalSpentAmount,totalSavingAmount
    })
  }

});
