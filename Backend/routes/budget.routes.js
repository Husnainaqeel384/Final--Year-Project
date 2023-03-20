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
    deleteBudget
} from '../controllers/Budget.controller.js '

router.post('/budget',verifyToken,budgteinfo)
router.post('/dailyExpenseRecord',DailyExpenseRecord)
router.post('/budget-detail',budgetdetail)
router.get('/GetDailyRecordHistory',dailyExpenseRecordHistory)
router.get('/GetExpenseCategory/:id',getExpenseCategoryDetail)
router.post('/updateExpenseCategory',updateExpenseCategoryDetail)
router.delete('/deleteDailyExpense/:id',deleteExpenseCategory)
router.get('/getAllBudget',verifyToken,getALLBudgets)

// delete monthly budget
router.delete('/deleteBudget/:id',verifyToken,deleteBudget)

export default router