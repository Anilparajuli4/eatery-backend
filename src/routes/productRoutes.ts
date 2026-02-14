import express from 'express';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.post('/', authenticateToken, isAdmin, createProduct);
router.put('/:id', authenticateToken, isAdmin, updateProduct);
router.delete('/:id', authenticateToken, isAdmin, deleteProduct);

export default router;
