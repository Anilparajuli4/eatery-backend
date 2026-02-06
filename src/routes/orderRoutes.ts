import express from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController';
import { authenticateToken, optionalAuthenticate, isAdmin, isStaff } from '../middleware/auth';

const router = express.Router();

router.post('/', optionalAuthenticate, createOrder);
router.get('/', optionalAuthenticate, getOrders);
router.patch('/:id/status', authenticateToken, isStaff, updateOrderStatus);
import { verifyPayment, updatePaymentStatus } from '../controllers/orderController';
router.post('/:id/verify-payment', optionalAuthenticate, verifyPayment);
router.patch('/:id/payment-status', authenticateToken, isStaff, updatePaymentStatus);

export default router;
