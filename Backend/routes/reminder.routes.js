import express  from "express";
const router = express.Router();
import {reminderinfo,
    getreminder,
    StatusDone,
    DeleteReminder,
    UpdateReminder
} from "../controllers/Reminders.js"
import {verifyToken} from "../middlewares/authJwt.js"

router.post('/AddReminder',verifyToken,reminderinfo)
router.get('/getReminder',verifyToken,getreminder)
router.post('/DeleteReminder',verifyToken,DeleteReminder)
router.post('/statusdone',verifyToken,StatusDone)
router.post('/EditReminder',verifyToken,UpdateReminder)



export default router