/**
 * Express Application Configuration
 * 
 * This module sets up the Express application with middleware, routes,
 * and error handling. It does NOT start the server (see server.js for that).
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import moodRoutes from './routes/moodRoutes.js';
import therapyRoutes from './routes/therapyRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiChatRoutes from './routes/aiChatRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

// Initialize Express app
const app = express();

// Track server start time for uptime calculation
const startTime = Date.now();

// CORS configuration - Use environment variables for allowed origins
console.log('Environment:', process.env.NODE_ENV);
console.log('Vercel:', process.env.VERCEL);

// Get allowed origins from environment variables
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_FRONTEND_URL,
  process.env.LOCAL_FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean); // Remove undefined values

console.log('Allowed CORS Origins:', allowedOrigins);

// CORS middleware with environment-based origins
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Check if origin is allowed
  const isAllowed = !origin ||
    allowedOrigins.includes(origin) ||
    origin.includes('.vercel.app') || // Allow Vercel preview deployments
    origin.includes('localhost');

  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  } else {
    console.warn(`CORS: Blocked origin: ${origin}`);
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Cookie parser middleware (for refresh tokens)
app.use(cookieParser());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.status(200).json({
    status: 'ok',
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/therapy', therapyRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiChatRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'AI Mental Health Companion API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      journals: '/api/journals',
      moods: '/api/moods',
      therapy: '/api/therapy',
      recommendations: '/api/recommendations',
      insights: '/api/insights',
      preferences: '/api/preferences',
      notifications: '/api/notifications',
      ai: '/api/ai',
    },
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
