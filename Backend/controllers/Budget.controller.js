import db from "../models/db.js";
import ErrorHandler from "../Error/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js"
//import Status Code
import { StatusCodes } from "http-status-codes"
export const budgteinfo = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
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
    const budgetCheck = await db('budget').where({ BudgetMonth: month + "-" + year, user_id }).first('*');
    if (budgetCheck) {
        return next(new ErrorHandler("Current Month Budget Already exist", StatusCodes.BAD_REQUEST))
    }
    const budgetAdd = await db('budget').insert(Budgetdata).where({ user_id });
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
    const user_id = req.user.id;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    //
    const { ExpensecategoryName, description, currentAmount } = req.body
    const checkcategory = await db('expense').where({ ExpensecategoryName, user_id }).andWhere(function () {
        this.where({ currentMonthYear: month + "-" + year })
    })

    if (checkcategory.length > 0) {
        const result = parseFloat(currentAmount) + parseFloat(checkcategory[0].Totalamount)
        await db('expense').update({ currentAmount, Totalamount: result }).where({ ExpensecategoryName })
        // now we subtract the daily expense from budget detail and calaculate the remaining amount
        const budget = await db('budget').select('*').where({ BudgetMonth: month + "-" + year, user_id }).first('budget_id');
        const addexpense = await db('budget_detail').select('Amount').where({ categoryName: ExpensecategoryName, budget_id: budget.budget_id, user_id })
        // const totalamount = await db('expense').where({ ExpensecategoryName, user_id }).select('Totalamount').first('Totalamount')
        const Remainingamount = parseFloat(addexpense[0].Amount) - parseFloat(result)
        const percentage = (parseFloat(result) / parseFloat(addexpense[0].Amount)) * 100
        const updatebudget = await db('budget_detail').update({ remainingAmount: Remainingamount, percentofUsingAmount: percentage }).where({ categoryName: ExpensecategoryName, budget_id: budget.budget_id, user_id })
        res.status(200).json({ message: "Expense Category Updated" })
    }
    else {
        const a = await db('expense').insert({ ExpensecategoryName, description, currentAmount, currentMonthYear: month + "-" + year, Totalamount: currentAmount, user_id })
        const budget = await db('budget').select('*').where({ BudgetMonth: month + "-" + year, user_id }).first('budget_id');
        const addexpense = await db('budget_detail').select('Amount').where({ categoryName: ExpensecategoryName, budget_id: budget.budget_id, user_id })
        const totalamount = await db('expense').where({ ExpensecategoryName, user_id }).select('Totalamount').first('Totalamount')
        const Remainingamount = parseFloat(addexpense[0].Amount) - parseFloat(totalamount.Totalamount)
        const percentage = (parseFloat(totalamount.Totalamount) / parseFloat(addexpense[0].Amount)) * 100
        const updatebudget = await db('budget_detail').update({ remainingAmount: Remainingamount, percentofUsingAmount: percentage }).where({ categoryName: ExpensecategoryName, budget_id: budget.budget_id, user_id })
        res.status(200).json({ message: "Expense Category Added" })
    }



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


//get Expense Category Detail for Update
export const getExpenseCategoryDetail = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const expenseId = req.params.id
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const categoryDetail = await db('expense').select('ExpensecategoryName', 'currentAmount').where({ expense_id: expenseId, user_id }).andWhere(function () {
        this.where({ currentMonthYear: month + "-" + year })
    })
    res.json({ categoryDetail })
})
// update category Expense Detail
export const updateExpenseCategoryDetail = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const { ExpensecategoryName, previousAmount, NewAmount } = req.body
    const preAmount = parseFloat(previousAmount)
    const newamount = parseFloat(NewAmount)
    const totalamount = await db('expense').where({ ExpensecategoryName, user_id }).andWhere(function () {
        this.where({ currentMonthYear: month + "-" + year })
    })
    if (preAmount === newamount) {
        const a = await db('expense').update({ currentAmount: newamount }).where({ ExpensecategoryName, user_id })
        if (a === 1) {

            res.json({ message: "Successfull Update" })
        }
    }
    // previous amount is greater than new amount
    else if (preAmount > newamount) {
        let differnecBtw = preAmount - newamount
        const result = parseFloat(totalamount[0].Totalamount) - differnecBtw
        const a1 = await db('expense').update({ currentAmount: newamount, Totalamount: result }).where({ ExpensecategoryName, user_id })
        if (a1 > 0) {
            const budget = await db('budget').select('*').where({ BudgetMonth: month + "-" + year, user_id }).first('budget_id');
            const addexpense = await db('budget_detail').select('Amount').where({ categoryName: ExpensecategoryName, budget_id: budget.budget_id, user_id })
            // const totalamount = await db('expense').where({ ExpensecategoryName, user_id }).select('Totalamount').first('Totalamount')
            const Remainingamount = parseFloat(addexpense[0].Amount) - parseFloat(result)
            const percentage = (parseFloat(result) / parseFloat(addexpense[0].Amount)) * 100
            const updatebudget = await db('budget_detail').update({ remainingAmount: Remainingamount, percentofUsingAmount: percentage }).where({ categoryName: ExpensecategoryName, budget_id: budget.budget_id, user_id })
            res.json({ message: "Successfull Update" })
        }
    }
    //preamount is less than new amount
    else if (preAmount < newamount) {
        let differnecBtw = newamount - preAmount
        const result = parseFloat(totalamount[0].Totalamount) + differnecBtw
        const a = await db('expense').update({ currentAmount: newamount, Totalamount: result }).where({ ExpensecategoryName, user_id })
        if (a > 0) {
            const budget = await db('budget').select('*').where({ BudgetMonth: month + "-" + year, user_id }).first('budget_id');
            const addexpense = await db('budget_detail').select('Amount').where({ categoryName: ExpensecategoryName, budget_id: budget.budget_id, user_id })
            // const totalamount = await db('expense').where({ ExpensecategoryName, user_id }).select('Totalamount').first('Totalamount')
            const Remainingamount = parseFloat(addexpense[0].Amount) - parseFloat(result)
            const percentage = (parseFloat(result) / parseFloat(addexpense[0].Amount)) * 100
            const updatebudget = await db('budget_detail').update({ remainingAmount: Remainingamount, percentofUsingAmount: percentage }).where({ categoryName: ExpensecategoryName, budget_id: budget.budget_id, user_id })
            res.json({ message: "Successfull Update" })
        }
    }

})

//delete Expense Category
export const deleteExpenseCategory = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id;
    const expenseId = req.params.id

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const categoryDetail = await db('expense').select('ExpensecategoryName', 'currentAmount').where({ expense_id: expenseId, user_id }).andWhere(function () {
        this.where({ currentMonthYear: month + "-" + year })
    })

    if (categoryDetail.length > 0) {
        const result = await db('expense').delete().where({ expense_id: expenseId, user_id })

        if (result === 1) {
            const getCategoryValue = await db('budget_detail').select('Amount').where({ categoryName: categoryDetail[0].ExpensecategoryName, user_id }).first('Amount')
            const updatevalue = await db('budget_detail').update({ remainingAmount: getCategoryValue.Amount, percentofUsingAmount: 0 }).where({ categoryName: categoryDetail[0].ExpensecategoryName, user_id })
            res.json({ message: "Successfull Delete" })
        }
    }
})


//get daily Expense Record History

export const dailyExpenseRecordHistory = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const dailyrecordhistory = await db('expense').select('*').where({ currentMonthYear: month + "-" + year, user_id }).orderBy('expense_id', 'desc')

    res.json({ dailyrecordhistory: dailyrecordhistory })
})
// add budget detail

export const budgetdetail = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id
    const data = req.body
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const { budget_id } = await db('budget').where({ BudgetMonth: month + "-" + year, user_id }).first('budget_id');

    const dataWithBudgetId = data.map(obj => ({ budget_id, user_id, remainingAmount: obj.Amount, ...obj }));
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

// get Monthly Budget Detail of specific month

export const getMonthlyBudgetDetail = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id
    const budget_id = req.params.id
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const allBudgetDetailOfSpecificMonth = await db('budget_detail').select('*').where({ budget_id, user_id })
    if (allBudgetDetailOfSpecificMonth.length > 0) {
        res.json({ allBudgetDetailOfSpecificMonth })
    }

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

export const GetMonthlyExpenseCategoryvalue = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id
    const budget_id = req.params.id
    const budgetDetail_id = req.params.mid
    const categoryName = req.params.name


    const check = await db('budget_detail').select('*').where({ budgetDetail_id, user_id }).andWhere({ budget_id })

    if (check[0].categoryName === categoryName) {

        res.json({ check })
    }
})

// delete Monthly Expense Category
export const deleteMonthlyExpenseCategory = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id
    const budget_id = req.params.id
    const budgetDetail_id = req.params.mid


    const deleteBudgetDetail = await db('budget_detail').delete().where({ budgetDetail_id, user_id }).andWhere(
        function () {
            this.where({ budget_id })
        })
    if (deleteBudgetDetail === 1) {
        res.json({ message: "Successfull Delete" })
    }
})

//update Monthly Expense Category
export const updateMonthlyExpenseCategory = catchAsyncError(async (req, res, next) => {

    const budget_id = req.params.id
    const budgetDetail_id = req.params.budgetid
    const { categoryName, Amount } = req.body
    // console.log(req.params.id)
    // console.log(req.params.budgetid)
    // console.log(req.body)
    const checkcategory = await db('budget_detail').select('*').where({ budgetDetail_id }).andWhere({ budget_id })
    if (checkcategory[0].categoryName === categoryName) {
        const updatecategory = await db('budget_detail').update({ Amount }).where({ budgetDetail_id }).andWhere({ budget_id })
        if (updatecategory === 1) {
            res.json({ message: "Successfull Update" })
        }
    }
})

// Get Monthly Expense // show in current budget page
export const MonthlybudgetData = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const budget = await db('budget').select('*').where({ BudgetMonth: month + "-" + year, user_id }).first('budget_id');
    const monthExpenseData = await db('budget_detail').select('*').where({ budget_id: budget.budget_id, user_id })
    let totalAmount = monthExpenseData.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.Amount;
    }, 0);
    

    if (monthExpenseData.length > 0) {
        res.json({
            monthExpenseData,
            Income: budget.Total_Income,
            TotalBudgetAmount: totalAmount,
            saving: budget.Saving
        })
    }

})

// get budget total income
export const getBudgetIncomeAmount = catchAsyncError(async (req, res, next) => {
    const user_id = req.user.id
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date = new Date();
    let month = months[date.getMonth()];
    const year = date.getFullYear()
    const budgetincome = await db('budget').select('Total_Income').where({ BudgetMonth: month + "-" + year, user_id })
    res.json({ budgetincome })
    // if (monthExpenseData.length > 0) {
    //     let totalIncome = 0;
    //     monthExpenseData.forEach((item) => {
    //         if (item.categoryName === "Income") {
    //             totalIncome = totalIncome + item.Amount
    //         }
    //     })
    //     res.json({ totalIncome })
    // }

})

