/**
 * Notification & Preferences Controller
 * 
 * Handles user preferences and notification settings.
 * All operations are scoped to the authenticated user.
 */

import prisma from '../config/prismaClient.js';

/**
 * Get user preferences
 * GET /api/preferences
 */
export const getUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: {
          userId,
          theme: 'light',
          aiTone: 'empathetic',
          dailyReminder: true,
        },
      });
    }

    res.status(200).json({ preferences });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user preferences
 * PUT /api/preferences
 * 
 * @param {Object} req.body - { theme?, aiTone?, dailyReminder? }
 */
export const updateUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { theme, aiTone, dailyReminder } = req.body;

    // Validate theme
    if (theme && !['light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme. Must be "light" or "dark".' });
    }

    // Validate aiTone
    if (aiTone && !['empathetic', 'neutral', 'motivational'].includes(aiTone)) {
      return res.status(400).json({ 
        error: 'Invalid AI tone. Must be "empathetic", "neutral", or "motivational".' 
      });
    }

    // Check if preferences exist
    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    // Create or update preferences
    if (preferences) {
      preferences = await prisma.userPreference.update({
        where: { userId },
        data: {
          theme: theme !== undefined ? theme : preferences.theme,
          aiTone: aiTone !== undefined ? aiTone : preferences.aiTone,
          dailyReminder: dailyReminder !== undefined ? dailyReminder : preferences.dailyReminder,
        },
      });
    } else {
      preferences = await prisma.userPreference.create({
        data: {
          userId,
          theme: theme || 'light',
          aiTone: aiTone || 'empathetic',
          dailyReminder: dailyReminder !== undefined ? dailyReminder : true,
        },
      });
    }

    res.status(200).json({
      message: 'Preferences updated successfully.',
      preferences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update daily reminder setting
 * PATCH /api/preferences/reminder
 * 
 * @param {Object} req.body - { dailyReminder: boolean }
 */
export const updateReminderSetting = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { dailyReminder } = req.body;

    if (dailyReminder === undefined) {
      return res.status(400).json({ error: 'dailyReminder field is required.' });
    }

    // Get or create preferences
    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (preferences) {
      preferences = await prisma.userPreference.update({
        where: { userId },
        data: { dailyReminder },
      });
    } else {
      preferences = await prisma.userPreference.create({
        data: {
          userId,
          theme: 'light',
          aiTone: 'empathetic',
          dailyReminder,
        },
      });
    }

    res.status(200).json({
      message: 'Reminder setting updated successfully.',
      dailyReminder: preferences.dailyReminder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update theme preference
 * PATCH /api/preferences/theme
 * 
 * @param {Object} req.body - { theme: 'light' | 'dark' }
 */
export const updateTheme = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { theme } = req.body;

    if (!theme || !['light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme. Must be "light" or "dark".' });
    }

    // Get or create preferences
    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (preferences) {
      preferences = await prisma.userPreference.update({
        where: { userId },
        data: { theme },
      });
    } else {
      preferences = await prisma.userPreference.create({
        data: {
          userId,
          theme,
          aiTone: 'empathetic',
          dailyReminder: true,
        },
      });
    }

    res.status(200).json({
      message: 'Theme updated successfully.',
      theme: preferences.theme,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update AI tone preference
 * PATCH /api/preferences/ai-tone
 * 
 * @param {Object} req.body - { aiTone: 'empathetic' | 'neutral' | 'motivational' }
 */
export const updateAiTone = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { aiTone } = req.body;

    if (!aiTone || !['empathetic', 'neutral', 'motivational'].includes(aiTone)) {
      return res.status(400).json({ 
        error: 'Invalid AI tone. Must be "empathetic", "neutral", or "motivational".' 
      });
    }

    // Get or create preferences
    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (preferences) {
      preferences = await prisma.userPreference.update({
        where: { userId },
        data: { aiTone },
      });
    } else {
      preferences = await prisma.userPreference.create({
        data: {
          userId,
          theme: 'light',
          aiTone,
          dailyReminder: true,
        },
      });
    }

    res.status(200).json({
      message: 'AI tone updated successfully.',
      aiTone: preferences.aiTone,
    });
  } catch (error) {
    next(error);
  }
};
