import expres from 'express';
const router = expres.Router();
import {getCategories,getsubCategories,subCategories} from '../controllers/Categories.js'
import { verifyToken } from '../middlewares/authJwt.js';
router.get('/getCategories',verifyToken,getCategories);
router.get('/subCategories',verifyToken,getsubCategories);
router.get('/getsubCategories',verifyToken,subCategories);
export default router;