/**
 * Recommendation Routes
 * 
 * Defines routes for AI-powered recommendations.
 * All routes are protected and require authentication.
 * AI logic will be enhanced in Section 5.
 */

import express from 'express';
import {
  getRecommendations,
  getRecommendationById,
  generateRecommendations,
  deleteRecommendation,
  getRecommendationStats,
} from '../controllers/recommendationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/recommendations
 * Get all recommendations for the authenticated user
 * Query: page?, limit?, category?
 * Protected route
 */
router.get('/', authMiddleware, getRecommendations);

/**
 * POST /api/recommendations/generate
 * Generate new AI recommendations (placeholder - AI logic in Section 5)
 * Protected route
 */
router.post('/generate', authMiddleware, generateRecommendations);

/**
 * GET /api/recommendations/stats
 * Get recommendation statistics
 * Protected route
 */
router.get('/stats', authMiddleware, getRecommendationStats);

/**
 * GET /api/recommendations/:id
 * Get a single recommendation by ID
 * Protected route
 */
router.get('/:id', authMiddleware, getRecommendationById);

/**
 * DELETE /api/recommendations/:id
 * Delete a recommendation
 * Protected route
 */
router.delete('/:id', authMiddleware, deleteRecommendation);

export default router;
