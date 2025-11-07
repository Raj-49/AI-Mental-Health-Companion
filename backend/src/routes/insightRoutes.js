/**
 * Insight Routes
 * 
 * Defines routes for insights and dashboard overview.
 * All routes are protected and require authentication.
 */

import express from 'express';
import {
  getInsights,
  getLatestInsight,
  generateInsights,
  getDashboardOverview,
  deleteInsight,
} from '../controllers/insightController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/insights
 * Get all insights for the authenticated user
 * Query: page?, limit?
 * Protected route
 */
router.get('/', authMiddleware, getInsights);

/**
 * GET /api/insights/dashboard
 * Get dashboard overview data
 * Protected route
 */
router.get('/dashboard', authMiddleware, getDashboardOverview);

/**
 * GET /api/insights/latest
 * Get the most recent insight
 * Protected route
 */
router.get('/latest', authMiddleware, getLatestInsight);

/**
 * POST /api/insights/generate
 * Generate new insights based on user data
 * Protected route
 */
router.post('/generate', authMiddleware, generateInsights);

/**
 * DELETE /api/insights/:id
 * Delete an insight
 * Protected route
 */
router.delete('/:id', authMiddleware, deleteInsight);

export default router;
