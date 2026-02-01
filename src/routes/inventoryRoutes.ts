import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { getLowStockProducts, bulkUpdateStock, getStockHistory } from '../controllers/inventoryController';

const router = express.Router();

// protect all inventory routes with admin check
router.use(authenticateToken, isAdmin);

router.get('/low-stock', getLowStockProducts);
router.post('/bulk-update', bulkUpdateStock);
router.get('/history/:productId', getStockHistory);

export default router;
