import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/authJwt.js";
import { getReport } from '../controllers/Report.js'

router.get("/report", 
// verifyToken,
 getReport);

export default router;