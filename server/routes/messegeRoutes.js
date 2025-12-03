import express from 'express';
import { getChatMesseges, sendMessage, sseController } from '../controllers/messegeController.js';
import { upload } from '../configs/multer.js';
import { protect } from '../middlewares/auth.js';

const messegeRouter = express.Router();

messegeRouter.get('/:userId/sse', sseController)
messegeRouter.post('/send', upload.single('image'), protect, sendMessage)
messegeRouter.post('/get', protect, getChatMesseges)

export default messegeRouter