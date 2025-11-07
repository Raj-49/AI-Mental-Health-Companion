/**
 * User Routes
 * 
 * Defines routes for user-related operations.
 * All routes are protected and require authentication.
 * Routes: GET /users, GET /users/me, PUT /users/me, GET /users/me/stats
 */

import express from 'express';
import { 
  getAllUsers, 
  getCurrentUser, 
  updateCurrentUser,
  getUserStats,
  getEmailPreferences,
  updateEmailPreferences
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateProfileUpdate } from '../validators/userValidator.js';

const router = express.Router();

/**
 * GET /api/users
 * Get list of all users (limited fields)
 * Protected route
 */
router.get('/', authMiddleware, getAllUsers);

/**
 * GET /api/users/me
 * Get current authenticated user profile
 * Protected route
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * PUT /api/users/me
 * Update current authenticated user profile
 * Body: { fullName?, age?, gender?, profileImageUrl? }
 * Protected route
 */
router.put('/me', authMiddleware, validateProfileUpdate, updateCurrentUser);

/**
 * GET /api/users/me/stats
 * Get user statistics (journals, mood logs, sessions)
 * Protected route
 */
router.get('/me/stats', authMiddleware, getUserStats);

/**
 * GET /api/users/me/email-preferences
 * Get email preferences for current user
 * Protected route
 */
router.get('/me/email-preferences', authMiddleware, getEmailPreferences);

/**
 * PUT /api/users/me/email-preferences
 * Update email preferences for current user
 * Body: { weeklyEmailEnabled?, therapyPlanInEmail?, emailScheduleTime?, emailScheduleDays? }
 * Protected route
 */
router.put('/me/email-preferences', authMiddleware, updateEmailPreferences);

export default router;
