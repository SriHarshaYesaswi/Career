import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export const generateToken = (id: string, email: string, role: string) => {
  const secret = process.env.JWT_SECRET || 'fallback_dev_secret_change_in_prod';
  return jwt.sign({ id, email, role }, secret, { expiresIn: '7d' });
};

/**
 * Maps a Mongoose User document to the UserProfile shape expected by the frontend.
 */
const toUserProfile = (user: IUser) => ({
  uid: user._id.toString(),
  name: user.name,
  email: user.email,
  photoUrl: user.photoUrl || '',
  profession: user.profession || 'Software Engineer Intern & CS Student',
  currentEducation: user.currentEducation || 'B.Tech in Computer Science',
  onboarded: user.onboarded || false,
  streakCount: user.streakCount || 1,
  lastActiveDate: user.lastActiveDate || new Date().toISOString().split('T')[0],
  productivityScore: user.productivityScore || 50,
  level: user.level || 1,
  xp: user.xp || 0,
  authProvider: user.authProvider || 'email',
  skills: [],
  careerInterests: [],
  role: user.role || 'user',
});

/**
 * POST /api/auth/signup
 * Create a new user with email and password.
 */
export const signup = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password, profession, currentEducation } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, error: 'Name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters.' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ ok: false, error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      profession: profession || 'Software Engineer Intern & CS Student',
      currentEducation: currentEducation || 'B.Tech in Computer Science',
      authProvider: 'email',
      role: 'user',
      xp: 0,
      level: 1,
      streakCount: 0,
      productivityScore: 50,
      onboarded: false,
      lastLogin: new Date(),
    });

    const token = generateToken(user._id.toString(), user.email, user.role);

    return res.status(201).json({
      ok: true,
      user: toUserProfile(user),
      token,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ ok: false, error: 'Server error during registration.' });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user with email and password.
 */
export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id.toString(), user.email, user.role);

    return res.status(200).json({
      ok: true,
      user: toUserProfile(user),
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ ok: false, error: 'Server error during login.' });
  }
};

/**
 * GET /api/auth/me
 * Return the authenticated user's profile from the JWT.
 */
export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -__v');
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found.' });
    }
    return res.status(200).json({ ok: true, user: toUserProfile(user) });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ ok: false, error: 'Server error.' });
  }
};

/**
 * PATCH /api/auth/onboard
 * Mark user as onboarded (called after completing the onboarding flow).
 */
export const completeOnboarding = async (req: Request, res: Response): Promise<any> => {
  try {
    const { profession, currentEducation, skills, careerInterests } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        onboarded: true,
        ...(profession && { profession }),
        ...(currentEducation && { currentEducation }),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found.' });
    }

    return res.status(200).json({ ok: true, user: toUserProfile(user) });
  } catch (error) {
    console.error('Onboarding error:', error);
    return res.status(500).json({ ok: false, error: 'Server error.' });
  }
};
