import expres from 'express';
const router = expres.Router();
import {getCategories,getsubCategories,subCategories,AddCategory,
    updateCategory,deleteCategory,AddSubCategory,updateSubCategory,deleteSubCategory
} from '../controllers/Categories.js'
import { verifyToken } from '../middlewares/authJwt.js';
router.get('/getCategories',verifyToken,getCategories);
router.get('/subCategories',verifyToken,getsubCategories);
router.get('/getsubCategories',verifyToken,subCategories);
router.post('/addCategory',verifyToken,AddCategory);
router.put('/updateCategory/:id',verifyToken,updateCategory);
router.delete('/deleteCategory/:id',verifyToken,deleteCategory);
router.post('/addSubCategory',verifyToken,AddSubCategory);
router.put('/updateSubCategory/:id',verifyToken,updateSubCategory);
router.delete('/deleteSubCategory/:id',verifyToken,deleteSubCategory);
export default router;