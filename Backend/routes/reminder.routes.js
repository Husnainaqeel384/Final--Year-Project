import express  from "express";
const router = express.Router();
import {reminderinfo,
    getreminder,
    StatusDone,
    DeleteReminder,
} from "../controllers/Reminders.js"
import {verifyToken} from "../middlewares/authJwt.js"

router.post('/AddReminder',verifyToken,reminderinfo)
router.get('/getReminder',verifyToken,getreminder)
router.post('/statusdone',verifyToken,StatusDone)
router.post('/DeleteReminder',verifyToken,DeleteReminder)



export default router