import express from 'express';
const router = express.Router();
import {addnotes,getnotes,updatenote,deletenote} from "../controllers/AddNotes.js"
import {verifyToken} from '../middlewares/authJwt.js';

router.post('/addNotes', verifyToken, addnotes);
router.get('/getnotes', verifyToken, getnotes);
router.put('/updatenote/:NoteId', verifyToken, updatenote);
router.delete('/deletenote/:deletNoteId', verifyToken, deletenote);



export default router;