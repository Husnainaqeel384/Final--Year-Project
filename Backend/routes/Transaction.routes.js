import express from 'express';
const router = express.Router();
import {verifyToken} from "../middlewares/authJwt.js"
import {
    Transactioninfo,
    getTransaction,
    deleteTransaction,  
    updateTransaction
} from '../controllers/Transaction.js';
router.post('/addTransaction',verifyToken,Transactioninfo);
router.get('/getTransaction',verifyToken,getTransaction);
router.delete('/deleteTransaction/:id',verifyToken,deleteTransaction)
router.put('/updateTransaction/:id',verifyToken,updateTransaction)
export default router;