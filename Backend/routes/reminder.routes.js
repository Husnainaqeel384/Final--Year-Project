import express  from "express";
const router = express.Router();
import {reminderinfo,
    getreminder,
} from "../controllers/Reminders.js"
import {verifyToken} from "../middlewares/authJwt.js"

router.post('/AddReminder',verifyToken,reminderinfo)
router.get('/getReminder',verifyToken,getreminder)



export default router