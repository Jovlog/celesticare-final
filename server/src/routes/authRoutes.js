import express from 'express';
import { register, login, showVerificationPrompt, verifyEmail, checkDefaultPassword, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/verify-email', showVerificationPrompt);
router.post('/verify-email', verifyEmail);
router.post('/check-default', checkDefaultPassword);
router.get('/me', verifyToken, getMe);
router.post('/logout', (req, res) => res.json({ success: true }));

export default router;