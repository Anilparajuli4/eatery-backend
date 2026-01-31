import express from 'express';
import { createPaymentIntent } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/create-intent', authenticateToken, createPaymentIntent);

export default router;
