import db from "../models/db.js";
import ErrorHandler from "../Error/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js"
//import Status Code
import { StatusCodes } from "http-status-codes"
export const budgteinfo = catchAsyncError(async (req, res, next) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const todayDate = date.getDate()
    const monthNumber = date.getMonth() + 1
    const year = date.getFullYear()
    const Budgetdata = [{
        BudgetMonth: month + "-" + year,
        Total_Income: req.body.TotalIncome,
        Saving: req.body.saving,
        // (year + "-" + month + "-" + date);
        createdDate: year + "-" + monthNumber + "-" + todayDate,
        user_id: req.user.id
    }]
    const budgetCheck = await db('budget').where({ BudgetMonth: month + "-" + year }).first('*');
    if (budgetCheck) {
        return next(new ErrorHandler("Current Month Budget Already exist", StatusCodes.BAD_REQUEST))
    }
    const budgetAdd = await db('budget').insert(Budgetdata);
    if (budgetAdd) {
        // return next(new ErrorHandler("Please Try Again",StatusCodes.BAD_REQUEST))
        const UserBudget = await db('budget').where({ budget_id: budgetAdd[0] }).first('*');
        res.json({
            message: "Budget Id generate Now add budget details",
            UserBudget
        })
    }
})
//add daily expense record
export const DailyExpenseRecord = catchAsyncError(async (req, res, nex) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const { ExpensecategoryName, description, currentAmount } = req.body
    const checkcategory = await db('expense').where({ ExpensecategoryName }).andWhere(function () {
        this.where({ currentMonthYear: month + "-" + year })
    })
    if (checkcategory.length > 0) {
        const result = parseFloat(currentAmount) + parseFloat(checkcategory[0].Totalamount)
        await db('expense').update({ currentAmount, Totalamount: result }).where({ ExpensecategoryName })
    }
    else {
        await db('expense').insert({ ExpensecategoryName, description, currentAmount, currentMonthYear: month + "-" + year, Totalamount: currentAmount })
    }
    res.json({ checkcategory })
        // var expense = req.body


        // const { budget_id } = await db('budget').where({ BudgetMonth: month + "-" + year }).first('budget_id');
        // const data = await db('budget_detail').select('categoryName	', 'Amount').where({budget_id});
        // const data = await db('budget_detail').select('categoryName	', 'Amount').where({ categoryName: expense[0].categoryName });

        // const result = expense.map((item,index)=>{
        //     console.log(item.Amount)
        //     return {
        //         categoryName:item.categoryName,

        //         Amount:data[index].Amount-item.Amount
        //     }
        // })
        // const result = data[0].Amount - expense[0].Amount
        ;
    // const user = await db('budget_detail').update({
    //     remainingAmount:result
    // }).where({ categoryName: expense[0].categoryName })
    // res.json({ data })
})


export const AddDailyExpenseintoBudget = catchAsyncError(async (req, res, next) => {



})
//get Expense Category Detail for Update
export const getExpenseCategoryDetail = catchAsyncError(async (req, res, next) => {
    const expenseId = req.params.id
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const categoryDetail = await db('expense').select('ExpensecategoryName', 'currentAmount').where({ expense_id: expenseId }).andWhere(function () {
        this.where({ currentMonthYear: month + "-" + year })
    })
    res.json({ categoryDetail })
})
// update category Expense Detail
export const updateExpenseCategoryDetail = catchAsyncError(async (req, res, next) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const { ExpensecategoryName, previousAmount, NewAmount } = req.body
    const preAmount = parseFloat(previousAmount)
    const newamount = parseFloat(NewAmount)
    const totalamount = await db('expense').where({ ExpensecategoryName }).andWhere(function () {
        this.where({ currentMonthYear: month + "-" + year })
    })
    if (preAmount === newamount) {
        const a = await db('expense').update({ currentAmount: newamount }).where({ ExpensecategoryName })
        if (a === 1) {

            res.json({ message: "Successfull Update" })
        }
    }
    else if (preAmount > newamount) {
        let differnecBtw = preAmount - newamount
        const result = parseFloat(totalamount[0].Totalamount) - differnecBtw
        const a = await db('expense').update({ currentAmount: newamount, Totalamount: result }).where({ ExpensecategoryName })
        if (a === 1) {

            res.json({ message: "Successfull Update" })
        }
    }
    else if (preAmount < newamount) {
        let differnecBtw = newamount - preAmount
        const result = parseFloat(totalamount[0].Totalamount) + differnecBtw
        const a = await db('expense').update({ currentAmount: newamount, Totalamount: result }).where({ ExpensecategoryName })
        if (a === 1) {

            res.json({ message: "Successfull Update" })
        }
    }

})

//delete Expense Category
export const deleteExpenseCategory = catchAsyncError(async (req, res, next) => {
    const expenseId = req.params.id

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const categoryDetail = await db('expense').select('ExpensecategoryName', 'currentAmount').where({ expense_id: expenseId }).andWhere(function () {
        this.where({ currentMonthYear: month + "-" + year })
    })

    if (categoryDetail.length > 0) {
        const result = await db('expense').delete().where({ expense_id: expenseId })
        if (result === 1) {
            res.json({ message: "Successfull Delete" })
        }
    }
})


//get daily Expense Record History

export const dailyExpenseRecordHistory = catchAsyncError(async (req, res, next) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const dailyrecordhistory = await db('expense').select('*').where({ currentMonthYear: month + "-" + year }).orderBy('expense_id', 'desc')
    res.json({ dailyrecordhistory: dailyrecordhistory })
})


export const budgetdetail = catchAsyncError(async (req, res, next) => {

    console.log(req.body)
    const data = req.body
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const { budget_id } = await db('budget').where({ BudgetMonth: month + "-" + year }).first('budget_id');
    const dataWithBudgetId = data.map(obj => ({ budget_id, ...obj }));
    const b = await db('budget_detail').insert(dataWithBudgetId);
    res.json({
        message: "Successfully Create Monthly Expenses"
    })
})

//get Budget Detail
export const getALLBudgets = catchAsyncError(async (req, res, next) => {

    const user_id = req.user.id
    const allBudgetDetail = await db('budget').select('*').where({ user_id }).orderBy('budget_id', 'desc')

    res.json({ allBudgetDetail })

})

export const deleteBudget = catchAsyncError(async (req, res, next) => {

    const user_id = req.user.id
    const budgetId = req.params.id
    const allBudgetDetail = await db('budget').delete().where({ budget_id: budgetId }).andWhere({ user_id })
    if (allBudgetDetail === 1) {
        const deleteBudgetDetail = await db('budget_detail').delete().where({ budget_id: budgetId })

        res.json({ message: "All data is Successfull delete" })
    }
})