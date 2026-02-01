import express from 'express';
import { getStats } from '../controllers/statsController';
import { getAnalytics } from '../controllers/analyticsController';
import { getUsers, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

router.use(authenticateToken);
router.use(isAdmin);

// Stats
// Stats
router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Products (Management)
router.post('/products', async (req, res) => {
    try {
        const product = await prisma.product.create({ data: req.body });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error deleting product', error });
    }
});

// Settings
router.get('/settings', async (req, res) => {
    const settings = await prisma.setting.findMany();
    res.json(settings);
});

router.put('/settings', async (req, res) => {
    const { settings } = req.body; // Array of { key, value }
    try {
        for (const s of settings) {
            await prisma.setting.upsert({
                where: { key: s.key },
                update: { value: s.value },
                create: { key: s.key, value: s.value }
            });
        }
        res.json({ message: 'Settings updated' });
    } catch (error) {
        res.status(400).json({ message: 'Error updating settings', error });
    }
});

export default router;
