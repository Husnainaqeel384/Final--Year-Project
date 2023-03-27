import express from 'express'
const router = express.Router();
import {register,login,userProfile,updateProfile,getuserdata,getAllUsers,
    updateRole,deleteUser
} from "../controllers/user.controller.js"
import {verifyToken} from "../middlewares/authJwt.js"
router.post('/register',register);
router.post('/login',login);
router.get('/profile',verifyToken ,userProfile)
router.get('/update-user-Profile',verifyToken,updateProfile)
// user Profile Route
router.get('/getuserdata',verifyToken,getuserdata)
router.get('/Allusers',verifyToken,getAllUsers) // for admin
router.put('/updateRole/:userId',verifyToken,updateRole)
router.delete('/deleteUser/:userId',verifyToken,deleteUser)
router.get('/',(req,res)=>{
    res.send("Hello")
})

export default router