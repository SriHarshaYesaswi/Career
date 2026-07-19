import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
import passport from 'passport';
import './config/passport';

const app = express();

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://career-high.vercel.app';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    ok: true,
    service: 'express-auth',
    status: isMongoConnected ? 'connected' : 'disconnected',
    database: isMongoConnected ? mongoose.connection.name : null,
  });
});

export default app;
