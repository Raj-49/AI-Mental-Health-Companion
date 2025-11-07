/**
 * Mood Routes
 * 
 * Defines routes for mood logging and analytics.
 * All routes are protected and require authentication.
 */

import express from 'express';
import {
  createMoodLog,
  getMoodLogs,
  getMoodStats,
  getMoodLogById,
  updateMoodLog,
  deleteMoodLog,
} from '../controllers/moodController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/moods
 * Create a new mood log
 * Body: { mood, energyLevel, stressLevel, note? }
 * Protected route
 */
router.post('/', authMiddleware, createMoodLog);

/**
 * GET /api/moods
 * Get all mood logs for the authenticated user
 * Query: page?, limit?, startDate?, endDate?
 * Protected route
 */
router.get('/', authMiddleware, getMoodLogs);

/**
 * GET /api/moods/stats
 * Get mood statistics and analytics
 * Query: days? (default: 7)
 * Protected route
 */
router.get('/stats', authMiddleware, getMoodStats);

/**
 * GET /api/moods/:id
 * Get a single mood log by ID
 * Protected route
 */
router.get('/:id', authMiddleware, getMoodLogById);

/**
 * PUT /api/moods/:id
 * Update a mood log
 * Body: { mood?, energyLevel?, stressLevel?, note? }
 * Protected route
 */
router.put('/:id', authMiddleware, updateMoodLog);

/**
 * DELETE /api/moods/:id
 * Delete a mood log
 * Protected route
 */
router.delete('/:id', authMiddleware, deleteMoodLog);

export default router;
