/**
 * Notification Routes
 * 
 * Defines routes for notification management.
 * All routes are protected and require authentication.
 */

import express from 'express';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  getNotificationStats,
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 * Query: page?, limit?, isRead?
 * Protected route
 */
router.get('/', authMiddleware, getNotifications);

/**
 * GET /api/notifications/stats
 * Get notification statistics
 * Protected route
 */
router.get('/stats', authMiddleware, getNotificationStats);

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 * Protected route
 */
router.patch('/read-all', authMiddleware, markAllAsRead);

/**
 * DELETE /api/notifications/clear-read
 * Delete all read notifications
 * Protected route
 */
router.delete('/clear-read', authMiddleware, clearReadNotifications);

/**
 * GET /api/notifications/:id
 * Get a single notification by ID
 * Protected route
 */
router.get('/:id', authMiddleware, getNotificationById);

/**
 * POST /api/notifications
 * Create a new notification
 * Body: { title, message, type? }
 * Protected route
 */
router.post('/', authMiddleware, createNotification);

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 * Protected route
 */
router.patch('/:id/read', authMiddleware, markAsRead);

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 * Protected route
 */
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
