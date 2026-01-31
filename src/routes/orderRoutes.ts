import express from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController';
import { authenticateToken, isAdmin, isStaff } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, createOrder); // Requiring auth for now
router.get('/', authenticateToken, getOrders);
router.patch('/:id/status', authenticateToken, isStaff, updateOrderStatus);
import { verifyPayment } from '../controllers/orderController';
router.post('/:id/verify-payment', authenticateToken, verifyPayment);

export default router;
