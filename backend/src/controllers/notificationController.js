/**
 * Notification Controller
 * 
 * Handles user notifications and reminders.
 * All operations are scoped to the authenticated user.
 */

import prisma from '../config/prismaClient.js';

/**
 * Get all notifications for the authenticated user
 * GET /api/notifications
 * 
 * Query params:
 * - page (optional, default: 1)
 * - limit (optional, default: 20)
 * - isRead (optional, filter by read status)
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, isRead } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    // Get notifications with pagination
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          title: true,
          message: true,
          isRead: true,
          type: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single notification by ID
 * GET /api/notifications/:id
 */
export const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.status(200).json({ notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new notification
 * POST /api/notifications
 * 
 * @param {Object} req.body - { title, message, type? }
 */
export const createNotification = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;
    const userId = req.user.userId;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || null,
      },
    });

    res.status(201).json({
      message: 'Notification created successfully.',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingNotification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    // Update notification
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });

    res.status(200).json({
      message: 'Notification marked as read.',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingNotification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: 'Notification deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all read notifications
 * DELETE /api/notifications/clear-read
 */
export const clearReadNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });

    res.status(200).json({
      message: 'Read notifications cleared successfully.',
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification statistics
 * GET /api/notifications/stats
 */
export const getNotificationStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [totalCount, unreadCount, readCount, typeBreakdown] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.count({ where: { userId, isRead: true } }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId, type: { not: null } },
        _count: { type: true },
      }),
    ]);

    res.status(200).json({
      totalCount,
      unreadCount,
      readCount,
      typeBreakdown: typeBreakdown.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
    });
  } catch (error) {
    next(error);
  }
};
