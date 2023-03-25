import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/authJwt.js";
import { getReport ,getMonths} from '../controllers/Report.js'

router.get("/report", 
// verifyToken,
 getReport);
 router.get("/report/month",verifyToken, getMonths);

export default router;