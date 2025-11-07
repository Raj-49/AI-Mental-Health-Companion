/**
 * Mood Controller
 * 
 * Handles mood logging, retrieval, and analytics.
 * All operations are scoped to the authenticated user.
 */

import prisma from '../config/prismaClient.js';

/**
 * Create a new mood log entry
 * POST /api/moods
 * 
 * @param {Object} req.body - { mood, energyLevel, stressLevel, note? }
 */
export const createMoodLog = async (req, res, next) => {
  try {
    const { mood, energyLevel, stressLevel, note } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!mood || energyLevel === undefined || stressLevel === undefined) {
      return res.status(400).json({ 
        error: 'Mood, energy level, and stress level are required.' 
      });
    }

    // Validate ranges
    if (energyLevel < 1 || energyLevel > 10) {
      return res.status(400).json({ error: 'Energy level must be between 1 and 10.' });
    }

    if (stressLevel < 1 || stressLevel > 10) {
      return res.status(400).json({ error: 'Stress level must be between 1 and 10.' });
    }

    // Create mood log
    const moodLog = await prisma.moodLog.create({
      data: {
        userId,
        mood,
        energyLevel: parseInt(energyLevel),
        stressLevel: parseInt(stressLevel),
        note: note || null,
      },
    });

    res.status(201).json({
      message: 'Mood logged successfully.',
      moodLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all mood logs for the authenticated user
 * GET /api/moods
 * 
 * Query params:
 * - page (optional, default: 1)
 * - limit (optional, default: 20)
 * - startDate (optional, ISO string)
 * - endDate (optional, ISO string)
 */
export const getMoodLogs = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = { userId };
    
    if (startDate || endDate) {
      where.loggedAt = {};
      if (startDate) {
        where.loggedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.loggedAt.lte = new Date(endDate);
      }
    }

    // Get mood logs with pagination
    const [moodLogs, totalCount] = await Promise.all([
      prisma.moodLog.findMany({
        where,
        orderBy: { loggedAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          mood: true,
          energyLevel: true,
          stressLevel: true,
          note: true,
          loggedAt: true,
        },
      }),
      prisma.moodLog.count({ where }),
    ]);

    res.status(200).json({
      moodLogs,
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
 * Get mood statistics and analytics
 * GET /api/moods/stats
 * 
 * Query params:
 * - days (optional, default: 7) - number of days to analyze
 */
export const getMoodStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { days = 7 } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get mood logs for the specified period
    const moodLogs = await prisma.moodLog.findMany({
      where: {
        userId,
        loggedAt: { gte: daysAgo },
      },
      orderBy: { loggedAt: 'asc' },
      select: {
        mood: true,
        energyLevel: true,
        stressLevel: true,
        loggedAt: true,
      },
    });

    // Calculate statistics
    const totalLogs = moodLogs.length;
    
    if (totalLogs === 0) {
      return res.status(200).json({
        period: parseInt(days),
        totalLogs: 0,
        moodBreakdown: [],
        averageEnergy: 0,
        averageStress: 0,
        trend: null,
        moodTimeline: [],
      });
    }

    // Mood breakdown
    const moodCount = {};
    let totalEnergy = 0;
    let totalStress = 0;

    moodLogs.forEach(log => {
      moodCount[log.mood] = (moodCount[log.mood] || 0) + 1;
      totalEnergy += log.energyLevel;
      totalStress += log.stressLevel;
    });

    const moodBreakdown = Object.entries(moodCount).map(([mood, count]) => ({
      mood,
      count,
      percentage: ((count / totalLogs) * 100).toFixed(1),
    }));

    // Most common mood
    const mostCommonMood = moodBreakdown.reduce((prev, current) => 
      (current.count > prev.count) ? current : prev
    );

    // Average energy and stress
    const averageEnergy = (totalEnergy / totalLogs).toFixed(1);
    const averageStress = (totalStress / totalLogs).toFixed(1);

    // Mood timeline (for charts)
    const moodTimeline = moodLogs.map(log => ({
      date: log.loggedAt,
      mood: log.mood,
      energyLevel: log.energyLevel,
      stressLevel: log.stressLevel,
    }));

    // Trend analysis (simple: compare first half vs second half)
    const halfPoint = Math.floor(totalLogs / 2);
    const firstHalfAvgEnergy = moodLogs.slice(0, halfPoint)
      .reduce((sum, log) => sum + log.energyLevel, 0) / halfPoint;
    const secondHalfAvgEnergy = moodLogs.slice(halfPoint)
      .reduce((sum, log) => sum + log.energyLevel, 0) / (totalLogs - halfPoint);
    
    let trend = 'stable';
    if (secondHalfAvgEnergy > firstHalfAvgEnergy + 1) {
      trend = 'improving';
    } else if (secondHalfAvgEnergy < firstHalfAvgEnergy - 1) {
      trend = 'declining';
    }

    res.status(200).json({
      period: parseInt(days),
      totalLogs,
      moodBreakdown,
      mostCommonMood: mostCommonMood.mood,
      averageEnergy: parseFloat(averageEnergy),
      averageStress: parseFloat(averageStress),
      trend,
      moodTimeline,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single mood log by ID
 * GET /api/moods/:id
 */
export const getMoodLogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const moodLog = await prisma.moodLog.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!moodLog) {
      return res.status(404).json({ error: 'Mood log not found.' });
    }

    res.status(200).json({ moodLog });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a mood log
 * PUT /api/moods/:id
 * 
 * @param {Object} req.body - { mood?, energyLevel?, stressLevel?, note? }
 */
export const updateMoodLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { mood, energyLevel, stressLevel, note } = req.body;

    // Check if mood log exists and belongs to user
    const existingMoodLog = await prisma.moodLog.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingMoodLog) {
      return res.status(404).json({ error: 'Mood log not found.' });
    }

    // Validate ranges if provided
    if (energyLevel !== undefined && (energyLevel < 1 || energyLevel > 10)) {
      return res.status(400).json({ error: 'Energy level must be between 1 and 10.' });
    }

    if (stressLevel !== undefined && (stressLevel < 1 || stressLevel > 10)) {
      return res.status(400).json({ error: 'Stress level must be between 1 and 10.' });
    }

    // Update mood log
    const updatedMoodLog = await prisma.moodLog.update({
      where: { id: parseInt(id) },
      data: {
        mood: mood !== undefined ? mood : existingMoodLog.mood,
        energyLevel: energyLevel !== undefined ? parseInt(energyLevel) : existingMoodLog.energyLevel,
        stressLevel: stressLevel !== undefined ? parseInt(stressLevel) : existingMoodLog.stressLevel,
        note: note !== undefined ? note : existingMoodLog.note,
      },
    });

    res.status(200).json({
      message: 'Mood log updated successfully.',
      moodLog: updatedMoodLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a mood log
 * DELETE /api/moods/:id
 */
export const deleteMoodLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if mood log exists and belongs to user
    const existingMoodLog = await prisma.moodLog.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingMoodLog) {
      return res.status(404).json({ error: 'Mood log not found.' });
    }

    // Delete mood log
    await prisma.moodLog.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: 'Mood log deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
