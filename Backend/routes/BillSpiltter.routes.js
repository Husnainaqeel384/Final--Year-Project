import express from 'express';
const router = express.Router();
import { verifyToken } from "../middlewares/authJwt.js"
import {addMembers,createGroup,AllGroups,deleteGroup,getGroup,
    getMembersList,billSplit,clearBillAmount,deleteMember

} from '../controllers/BillSplitter.js'

router.post('/AddMembers',verifyToken, addMembers);
router.post('/createGroup',verifyToken, createGroup);
router.get('/AllGroups',verifyToken, AllGroups);
router.delete('/deleteGroup/:id',verifyToken, deleteGroup);
// get group by id
 router.get('/getGroup/:id',verifyToken, getGroup);
 router.get('/getMembersList',verifyToken, getMembersList);

 // bill split functionality
 router.post('/billSplit',verifyToken, billSplit);
 // clear bill amount
router.post('/clearBill',verifyToken, clearBillAmount);
// delete member from group
router.delete('/deleteMember/:id',verifyToken, deleteMember);
export default router;