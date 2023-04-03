import express from 'express'
const router = express.Router();
import cors from 'cors';
import multer from 'multer';
// Set up storage configuration
const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //   cb(null, 'uploads/') // Set the file destination folder
    // },
    destination: 'uploads/',
    filename: (req, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname);
      },
    // filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //   cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop()) // Set the file name with extension
    // }
  })
  
  // Set up upload configuration
  const upload = multer({
    storage: storage,
    // limits: {
    //   fileSize: 1024 * 1024 * 5 
    // },
    // fileFilter: function (req, file, cb) {
    //   const allowedTypes = /jpeg|jpg|png|gif/; 
    //   const mimeType = allowedTypes.test(file.mimetype);
    //   const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    //   if (mimeType && extName) {
    //     return cb(null, true);
    //   }
    //   cb(new Error('Only images are allowed.')); 
    // }
  });
  

import {register,login,userProfile,updateProfile,getuserdata,getAllUsers,uploadImage,
    updateRole,deleteUser
} from "../controllers/user.controller.js"
import {verifyToken} from "../middlewares/authJwt.js"
router.post('/register',register);
router.post('/login',login);
router.get('/profile',verifyToken ,userProfile)
router.post('/update-user-Profile',verifyToken,updateProfile)
// user Profile Route
router.get('/getuserdata',verifyToken,getuserdata)
router.get('/Allusers',verifyToken,getAllUsers) // for admin
router.put('/updateRole/:userId',verifyToken,updateRole)
router.delete('/deleteUser/:userId',verifyToken,deleteUser)
router.post('/upload',verifyToken, upload.single('file'), uploadImage)
router.get('/',(req,res)=>{
    res.send("Hello")
})

export default router