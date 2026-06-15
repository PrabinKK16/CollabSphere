import express from 'express';
const router = express.Router();
import { register, login, logout, refreshToken, verifyEmail, forgotPassword, resetPassword, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);

export default router;
