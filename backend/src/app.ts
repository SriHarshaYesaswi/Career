import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';

const app = express();

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const isAllowedOrigin = (origin: string) => {
  if (!origin) return true;

  if (origin === FRONTEND_URL) return true;
  if (origin === 'http://localhost:5173') return true;
  if (origin.startsWith('https://') && origin.endsWith('.vercel.app')) return true;
  if (origin.startsWith('https://') && origin.endsWith('.netlify.app')) return true;

  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin || '')) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

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
