import express from 'express';
import { login, register, googleLogin } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/google-login', googleLogin); // Keeping for legacy reference

export default router;
