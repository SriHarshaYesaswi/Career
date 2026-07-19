import express from 'express';
import passport from 'passport';
import { signup, login, getMe, completeOnboarding, generateToken } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// OAuth Routes
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }), (req: any, res) => {
  const token = generateToken(req.user._id, req.user.email, req.user.role);
  res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }), (req: any, res) => {
  const token = generateToken(req.user._id, req.user.email, req.user.role);
  res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
});

// Protected routes
router.get('/me', protect, getMe);
router.patch('/onboard', protect, completeOnboarding);

export default router;
