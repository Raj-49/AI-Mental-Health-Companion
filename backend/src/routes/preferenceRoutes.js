/**
 * Preference Routes
 * 
 * Defines routes for user preferences and notification settings.
 * All routes are protected and require authentication.
 */

import express from 'express';
import {
  getUserPreferences,
  updateUserPreferences,
  updateReminderSetting,
  updateTheme,
  updateAiTone,
} from '../controllers/preferenceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/preferences
 * Get user preferences
 * Protected route
 */
router.get('/', authMiddleware, getUserPreferences);

/**
 * PUT /api/preferences
 * Update user preferences
 * Body: { theme?, aiTone?, dailyReminder? }
 * Protected route
 */
router.put('/', authMiddleware, updateUserPreferences);

/**
 * PATCH /api/preferences/reminder
 * Update daily reminder setting
 * Body: { dailyReminder: boolean }
 * Protected route
 */
router.patch('/reminder', authMiddleware, updateReminderSetting);

/**
 * PATCH /api/preferences/theme
 * Update theme preference
 * Body: { theme: 'light' | 'dark' }
 * Protected route
 */
router.patch('/theme', authMiddleware, updateTheme);

/**
 * PATCH /api/preferences/ai-tone
 * Update AI tone preference
 * Body: { aiTone: 'empathetic' | 'neutral' | 'motivational' }
 * Protected route
 */
router.patch('/ai-tone', authMiddleware, updateAiTone);

export default router;
