import express  from "express";
const router = express.Router();
import {reminderinfo} from "../controllers/Reminders.js"
import {verifyToken} from "../middlewares/authJwt.js"

router.post('/AddReminder',verifyToken,reminderinfo)



export default router