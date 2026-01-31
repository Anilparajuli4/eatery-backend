import express from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userController';
// import { protect, admin } from '../middleware/auth'; // Assuming middleware exists

const router = express.Router();

// Ideally protect with middleware
// router.use(protect);
// router.use(admin);

router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
