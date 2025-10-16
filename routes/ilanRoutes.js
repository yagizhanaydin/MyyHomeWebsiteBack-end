import express from 'express';
import { AddHome, upload } from '../controller/HomeController.js';
import verifyToken from '../Middleware/AuthMiddleware.js';

const router = express.Router();

router.post('/addilan', upload.array('images', 9), verifyToken, AddHome);

export default router;
