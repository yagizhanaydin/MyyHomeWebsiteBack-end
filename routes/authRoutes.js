import express from 'express';
import { Clientlogin, register, verify } from '../controller/clientController.js';

const router = express.Router();

router.post('/register', register);
router.get('/verify', verify);
router.post('/login',Clientlogin);
export default router;
