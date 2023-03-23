import express from 'express'
const router = express.Router();
import {verifyToken} from "../middlewares/authJwt.js"
import {budgetdetail,
    budgteinfo,DailyExpenseRecord,
    dailyExpenseRecordHistory,
    getExpenseCategoryDetail,
    updateExpenseCategoryDetail,
    deleteExpenseCategory,
    getALLBudgets,
    deleteBudget,
    getMonthlyBudgetDetail,
    GetMonthlyExpenseCategoryvalue,
    deleteMonthlyExpenseCategory,
    updateMonthlyExpenseCategory,
    MonthlybudgetData,
    getBudgetIncomeAmount
} from '../controllers/Budget.controller.js '


router.post('/budget',verifyToken,budgteinfo)
router.post('/dailyExpenseRecord',verifyToken,DailyExpenseRecord)
router.post('/budget-detail',verifyToken,budgetdetail)
router.get('/GetDailyRecordHistory',verifyToken,dailyExpenseRecordHistory)
router.get('/GetExpenseCategory/:id',verifyToken,getExpenseCategoryDetail)
router.post('/updateExpenseCategory',verifyToken,updateExpenseCategoryDetail)
router.delete('/deleteDailyExpense/:id',verifyToken,deleteExpenseCategory)
router.get('/getAllBudget',verifyToken,getALLBudgets)

// delete monthly budget
router.delete('/deleteBudget/:id',verifyToken,deleteBudget)
//get monthly budget
router.get('/getMonthlyExpense/:id',verifyToken,getMonthlyBudgetDetail)
// get GetMonthlyExpenseCategoryvalue
router.get('/GetMonthlyExpenseCategoryvalue/:id/:mid/:name',verifyToken,GetMonthlyExpenseCategoryvalue)
//detete monthly budget category
router.delete('/deleteMonthlyExpenseCategory/:id/:mid',verifyToken,deleteMonthlyExpenseCategory)
// update monthly budget category
router.post('/updateMonthlyExpenseCategory/:id/:budgetid',verifyToken,updateMonthlyExpenseCategory)
// Get Monthly Expense
router.get('/getMonthlyExpensedata',verifyToken,MonthlybudgetData)

// get budget income amount
router.get('/getTotalAmount',verifyToken,getBudgetIncomeAmount)

export default router