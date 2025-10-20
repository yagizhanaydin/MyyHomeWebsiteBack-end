import express from 'express';
import {
  AddOdaYenileme,
  GetOdaYenileme,
  GetOdaYenilemeDetail,
  upload
} from '../controller/OdaYenilemeHizmetleriController.js';
import verifyToken from '../Middleware/AuthMiddleware.js';

const router = express.Router();

router.post('/add-odahizmet', upload.array('fotolar', 9), verifyToken, AddOdaYenileme);
router.get('/get-odahizmet', GetOdaYenileme);
router.get('/odahizmet-detail/:id', GetOdaYenilemeDetail);

export default router;
