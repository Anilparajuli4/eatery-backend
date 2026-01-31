import express from 'express';
import { updateOrderStatus, getOrders } from '../controllers/orderController';
import { authenticateToken, isStaff } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);
router.use(isStaff);

// Staff/Kitchen view: All active orders
router.get('/orders', getOrders);

// Update status (Received -> Preparing -> Ready -> Completed)
router.patch('/orders/:id/status', updateOrderStatus);

export default router;
