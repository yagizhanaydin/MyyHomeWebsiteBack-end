import express from 'express';
import { AddHome, GetHomes, GetDetailHomes, upload } from '../controller/HomeController.js';
import verifyToken from '../Middleware/AuthMiddleware.js';

const router = express.Router();

router.post('/addilan', upload.array('images', 9), verifyToken, AddHome);

router.get('/getilan', GetHomes);

router.get('/ilandetail/:id', GetDetailHomes);

export default router;
