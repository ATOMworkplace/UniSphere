import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import clubRoutes from './routes/clubs.js';
import eventRoutes from './routes/events.js';
import communityRoutes from './routes/community.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const createApp = () => {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "res.cloudinary.com"],
      },
    },
  }));

  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
  const emailLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['https://uni-sphere-umber.vercel.app', 'https://uni-sphere-admin.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200
  };

  app.use(compression());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  app.use('/api/auth', authLimiter);
  app.use('/api/email', emailLimiter);
  app.use('/api', limiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/clubs', clubRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/chat', chatRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
  });

  app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' && status === 500
      ? 'An unexpected error occurred.'
      : err.message;
    res.status(status).json({ success: false, message });
  });

  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  return app;
};

export default createApp;
