import expres from 'express';
const router = expres.Router();
import {getCategories,getsubCategories} from '../controllers/Categories.js'
import { verifyToken } from '../middlewares/authJwt.js';
router.get('/getCategories',verifyToken,getCategories);
router.get('/subCategories',verifyToken,getsubCategories);

export default router;