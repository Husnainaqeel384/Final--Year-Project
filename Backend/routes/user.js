import express from 'express'
const router = express.Router();
import {register,login,userProfile,updateProfile} from "../controllers/user.controller.js"
import {verifyToken} from "../middlewares/authJwt.js"
router.get('/register',register);
router.post('/login',login);
router.get('/profile',verifyToken ,userProfile)
// user Profile Route
router.post('/update-user-Profile',verifyToken,updateProfile)
router.get('/',(req,res)=>{
    res.send("Hello")
})

export default router