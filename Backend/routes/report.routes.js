import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/authJwt.js";
import { getReport ,getMonths,generateReport} from '../controllers/Report.js'

router.get("/report", 
// verifyToken,
 getReport);
 router.get("/report/month",verifyToken, getMonths);

 router.get("/report/:month",verifyToken, generateReport);
export default router;