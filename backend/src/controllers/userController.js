/**
 * User Controller
 * 
 * Handles user-related operations including profile retrieval and updates.
 * All routes in this controller are protected and require authentication.
 */

import prisma from '../config/prismaClient.js';

/**
 * Get list of all users (limited fields)
 * GET /api/users
 * Protected route
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImageUrl: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      message: 'Users retrieved successfully.',
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/users/me
 * Protected route
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached by authMiddleware
    const userId = req.user.userId;

    // Fetch user with preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        age: true,
        gender: true,
        profileImageUrl: true,
        googleId: true,
        createdAt: true,
        updatedAt: true,
        preferences: {
          select: {
            theme: true,
            aiTone: true,
            dailyReminder: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    res.status(200).json({
      message: 'User profile retrieved successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current authenticated user profile
 * PUT /api/users/me
 * Protected route
 * 
 * @param {Object} req.body - { fullName?, age?, gender?, profileImageUrl? }
 */
export const updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { fullName, age, gender, profileImageUrl } = req.body;

    // Build update data object (only include provided fields)
    const updateData = {};
    
    if (fullName !== undefined) {
      updateData.fullName = fullName;
    }
    
    if (age !== undefined) {
      updateData.age = parseInt(age);
    }
    
    if (gender !== undefined) {
      updateData.gender = gender;
    }
    
    if (profileImageUrl !== undefined) {
      updateData.profileImageUrl = profileImageUrl;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        error: 'No valid fields provided for update.' 
      });
    }

    // Update user in database (updatedAt is automatically updated by Prisma)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        age: true,
        gender: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: 'User profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics (journals, mood logs, sessions count)
 * GET /api/users/me/stats
 * Protected route
 */
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get counts for various user activities
    const [journalCount, moodLogCount, sessionCount, therapyPlanCount] = await Promise.all([
      prisma.journal.count({ where: { userId } }),
      prisma.moodLog.count({ where: { userId } }),
      prisma.aiSession.count({ where: { userId } }),
      prisma.therapyPlan.count({ where: { userId } }),
    ]);

    res.status(200).json({
      message: 'User statistics retrieved successfully.',
      stats: {
        journalCount,
        moodLogCount,
        sessionCount,
        therapyPlanCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get email preferences for current user
 * GET /api/users/me/email-preferences
 * Protected route
 */
export const getEmailPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        weeklyEmailEnabled: true,
        therapyPlanInEmail: true,
        emailScheduleTime: true,
        emailScheduleDays: true,
      },
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    res.status(200).json({
      message: 'Email preferences retrieved successfully.',
      preferences: {
        weeklyEmailEnabled: user.weeklyEmailEnabled,
        therapyPlanInEmail: user.therapyPlanInEmail,
        emailScheduleTime: user.emailScheduleTime,
        emailScheduleDays: user.emailScheduleDays ? user.emailScheduleDays.split(',').map(d => parseInt(d)) : [0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update email preferences for current user
 * PUT /api/users/me/email-preferences
 * Protected route
 * 
 * @param {Object} req.body - { weeklyEmailEnabled?, therapyPlanInEmail?, emailScheduleTime?, emailScheduleDays? }
 */
export const updateEmailPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { 
      weeklyEmailEnabled, 
      therapyPlanInEmail, 
      emailScheduleTime, 
      emailScheduleDays 
    } = req.body;

    const updateData = {};
    
    if (weeklyEmailEnabled !== undefined) {
      updateData.weeklyEmailEnabled = Boolean(weeklyEmailEnabled);
    }
    
    if (therapyPlanInEmail !== undefined) {
      updateData.therapyPlanInEmail = Boolean(therapyPlanInEmail);
    }
    
    if (emailScheduleTime !== undefined) {
      // Validate time format (HH:mm)
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(emailScheduleTime)) {
        return res.status(400).json({ 
          error: 'Invalid time format. Use HH:mm (e.g., 08:00)' 
        });
      }
      updateData.emailScheduleTime = emailScheduleTime;
    }
    
    if (emailScheduleDays !== undefined) {
      // Convert array to comma-separated string
      // Days: 0=Sunday, 1=Monday, ... 6=Saturday
      if (Array.isArray(emailScheduleDays)) {
        const validDays = emailScheduleDays.filter(day => day >= 0 && day <= 6);
        if (validDays.length === 0) {
          return res.status(400).json({ 
            error: 'At least one valid day (0-6) must be selected' 
          });
        }
        updateData.emailScheduleDays = validDays.join(',');
      } else {
        return res.status(400).json({ 
          error: 'emailScheduleDays must be an array' 
        });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        error: 'No valid fields provided for update.' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        weeklyEmailEnabled: true,
        therapyPlanInEmail: true,
        emailScheduleTime: true,
        emailScheduleDays: true,
      },
    });

    res.status(200).json({
      message: 'Email preferences updated successfully.',
      preferences: {
        weeklyEmailEnabled: updatedUser.weeklyEmailEnabled,
        therapyPlanInEmail: updatedUser.therapyPlanInEmail,
        emailScheduleTime: updatedUser.emailScheduleTime,
        emailScheduleDays: updatedUser.emailScheduleDays ? updatedUser.emailScheduleDays.split(',').map(d => parseInt(d)) : [0],
      },
    });
  } catch (error) {
    next(error);
  }
};
