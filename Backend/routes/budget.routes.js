import express from 'express'
const router = express.Router();
import {verifyToken} from "../middlewares/authJwt.js"
import {budgetdetail,
    budgteinfo,DailyExpenseRecord,
    dailyExpenseRecordHistory,
    getExpenseCategoryDetail,
    updateExpenseCategoryDetail,
} from '../controllers/Budget.controller.js '

router.post('/budget',verifyToken,budgteinfo)
router.post('/dailyExpenseRecord',DailyExpenseRecord)
router.post('/budget-detail',budgetdetail)
router.get('/GetDailyRecordHistory',dailyExpenseRecordHistory)
router.get('/GetExpenseCategory/:id',getExpenseCategoryDetail)
router.post('/updateExpenseCategory',updateExpenseCategoryDetail)

export default router