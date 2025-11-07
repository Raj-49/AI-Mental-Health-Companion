/**
 * Therapy Plan Routes
 * 
 * Defines routes for therapy plan management and progress tracking.
 * All routes are protected and require authentication.
 */

import express from 'express';
import {
  createTherapyPlan,
  getTherapyPlans,
  getTherapyPlanById,
  updateTherapyPlan,
  deleteTherapyPlan,
  getTherapyStats,
  updateTherapyProgress,
} from '../controllers/therapyController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/therapy
 * Create a new therapy plan
 * Body: { goalTitle, goalDescription?, progress? }
 * Protected route
 */
router.post('/', authMiddleware, createTherapyPlan);

/**
 * GET /api/therapy
 * Get all therapy plans for the authenticated user
 * Query: page?, limit?, completed?
 * Protected route
 */
router.get('/', authMiddleware, getTherapyPlans);

/**
 * GET /api/therapy/stats
 * Get therapy plan statistics
 * Protected route
 */
router.get('/stats', authMiddleware, getTherapyStats);

/**
 * GET /api/therapy/:id
 * Get a single therapy plan by ID
 * Protected route
 */
router.get('/:id', authMiddleware, getTherapyPlanById);

/**
 * PUT /api/therapy/:id
 * Update a therapy plan
 * Body: { goalTitle?, goalDescription?, progress? }
 * Protected route
 */
router.put('/:id', authMiddleware, updateTherapyPlan);

/**
 * PATCH /api/therapy/:id/progress
 * Update only the progress of a therapy plan
 * Body: { progress }
 * Protected route
 */
router.patch('/:id/progress', authMiddleware, updateTherapyProgress);

/**
 * DELETE /api/therapy/:id
 * Delete a therapy plan
 * Protected route
 */
router.delete('/:id', authMiddleware, deleteTherapyPlan);

export default router;
