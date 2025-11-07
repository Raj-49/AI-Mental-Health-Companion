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
import errorHandler from './middlewares/errorHandler.js';

// Initialize Express app
const app = express();

// Track server start time for uptime calculation
const startTime = Date.now();

// CORS configuration - Allow all origins in production for now (will restrict later)
console.log('Environment:', process.env.NODE_ENV);
console.log('Vercel:', process.env.VERCEL);

// Simple CORS for debugging - allow all Vercel domains
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow all Vercel domains and localhost
  if (!origin || origin.includes('.vercel.app') || origin.includes('localhost')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
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
