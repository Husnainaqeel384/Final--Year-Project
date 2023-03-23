import express from 'express';
const router = express.Router();
import {verifyToken} from "../middlewares/authJwt.js"
import {
    Transactioninfo,
    getTransaction,
} from '../controllers/Transaction.js';
router.post('/addTransaction',verifyToken,Transactioninfo);
router.get('/getTransaction',verifyToken,getTransaction);


export default router;