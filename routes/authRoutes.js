import express from 'express';
import { register, verify } from '../controller/clientController.js';

const router = express.Router();

router.post('/register', register);
router.get('/verify', verify);

export default router;
