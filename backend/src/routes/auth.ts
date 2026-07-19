import express from 'express';
import { signup, login, getMe, completeOnboarding, generateToken } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.patch('/onboard', protect, completeOnboarding);

export default router;
