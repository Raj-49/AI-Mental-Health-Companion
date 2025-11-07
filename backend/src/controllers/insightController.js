/**
 * Insight Controller
 * 
 * Handles insight generation and retrieval.
 * Aggregates data from journals, mood logs, and AI sessions.
 * AI-powered analysis will be enhanced in Section 5.
 */

import prisma from '../config/prismaClient.js';

/**
 * Get all insights for the authenticated user
 * GET /api/insights
 * 
 * Query params:
 * - page (optional, default: 1)
 * - limit (optional, default: 10)
 */
export const getInsights = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get insights with pagination
    const [insights, totalCount] = await Promise.all([
      prisma.insight.findMany({
        where: { userId },
        orderBy: { generatedAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          moodSummary: true,
          journalingPattern: true,
          aiSummary: true,
          generatedAt: true,
        },
      }),
      prisma.insight.count({ where: { userId } }),
    ]);

    res.status(200).json({
      insights,
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
 * Get the latest insight
 * GET /api/insights/latest
 */
export const getLatestInsight = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const insight = await prisma.insight.findFirst({
      where: { userId },
      orderBy: { generatedAt: 'desc' },
    });

    if (!insight) {
      return res.status(404).json({ 
        error: 'No insights found. Generate insights to see your progress.' 
      });
    }

    res.status(200).json({ insight });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate new insights based on user data
 * POST /api/insights/generate
 * 
 * Analyzes recent journals, mood logs, and generates summary insights
 * AI-powered analysis will be enhanced in Section 5
 */
export const generateInsights = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get recent user data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [moodLogs, journals, aiSessions] = await Promise.all([
      prisma.moodLog.findMany({
        where: {
          userId,
          loggedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { loggedAt: 'desc' },
      }),
      prisma.journal.findMany({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aiSession.findMany({
        where: {
          userId,
          startedAt: { gte: thirtyDaysAgo },
        },
        include: {
          messages: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
    ]);

    // Generate mood summary
    let moodSummary = 'No mood data available for the past 30 days.';
    if (moodLogs.length > 0) {
      const avgEnergy = moodLogs.reduce((sum, log) => sum + log.energyLevel, 0) / moodLogs.length;
      const avgStress = moodLogs.reduce((sum, log) => sum + log.stressLevel, 0) / moodLogs.length;

      // Count mood frequencies
      const moodCount = {};
      moodLogs.forEach(log => {
        moodCount[log.mood] = (moodCount[log.mood] || 0) + 1;
      });
      const dominantMood = Object.entries(moodCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];

      moodSummary = `Over the past 30 days, you've logged ${moodLogs.length} mood entries. ` +
        `Your dominant mood was "${dominantMood}". ` +
        `Average energy level: ${avgEnergy.toFixed(1)}/10, ` +
        `average stress level: ${avgStress.toFixed(1)}/10. `;

      if (avgStress > 7) {
        moodSummary += 'Your stress levels have been high. Consider stress management techniques.';
      } else if (avgEnergy < 4) {
        moodSummary += 'Your energy levels have been low. Focus on rest and self-care.';
      } else {
        moodSummary += 'Your overall mood balance looks healthy.';
      }
    }

    // Generate journaling pattern
    let journalingPattern = 'No journal entries in the past 30 days.';
    if (journals.length > 0) {
      const avgPerWeek = (journals.length / 30) * 7;
      const moods = journals.filter(j => j.mood).map(j => j.mood);
      const uniqueMoods = [...new Set(moods)];

      journalingPattern = `You've written ${journals.length} journal entries in the past 30 days ` +
        `(average: ${avgPerWeek.toFixed(1)} per week). `;

      if (uniqueMoods.length > 0) {
        journalingPattern += `Common themes in your journaling include moods like: ${uniqueMoods.slice(0, 3).join(', ')}. `;
      }

      if (avgPerWeek < 2) {
        journalingPattern += 'Consider journaling more frequently to track your progress better.';
      } else {
        journalingPattern += 'Great consistency with your journaling practice!';
      }
    }

    // Generate AI summary
    let aiSummary = 'No AI chat sessions in the past 30 days.';
    if (aiSessions.length > 0) {
      const totalMessages = aiSessions.reduce((sum, session) => sum + session.messages.length, 0);
      aiSummary = `You've had ${aiSessions.length} AI chat sessions in the past 30 days ` +
        `with ${totalMessages} total messages exchanged. ` +
        'Continue engaging with AI therapy for personalized support and guidance.';
    }

    // Create insight record
    const insight = await prisma.insight.create({
      data: {
        userId,
        moodSummary,
        journalingPattern,
        aiSummary,
      },
    });

    res.status(201).json({
      message: 'Insights generated successfully.',
      insight,
      note: 'AI-powered analysis will be enhanced in Section 5.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard overview data
 * GET /api/insights/dashboard
 * 
 * Returns aggregated data for dashboard display
 */
export const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get counts and recent data
    const [
      journalCount,
      moodLogCount,
      therapyPlanCount,
      recommendationCount,
      recentJournals,
      recentMoods,
      activeTherapyPlans,
      recentRecommendations,
    ] = await Promise.all([
      prisma.journal.count({ where: { userId } }),
      prisma.moodLog.count({ where: { userId } }),
      prisma.therapyPlan.count({ where: { userId } }),
      prisma.recommendation.count({ where: { userId } }),
      prisma.journal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, title: true, mood: true, createdAt: true },
      }),
      prisma.moodLog.findMany({
        where: { userId },
        orderBy: { loggedAt: 'desc' },
        take: 7,
        select: { mood: true, energyLevel: true, stressLevel: true, loggedAt: true },
      }),
      prisma.therapyPlan.findMany({
        where: { userId, progress: { lt: 100 } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, goalTitle: true, progress: true },
      }),
      prisma.recommendation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, category: true, title: true, description: true },
      }),
    ]);

    // Calculate mood trend
    let moodTrend = null;
    if (recentMoods.length >= 4) {
      const halfPoint = Math.floor(recentMoods.length / 2);
      const recentAvgEnergy = recentMoods.slice(0, halfPoint)
        .reduce((sum, log) => sum + log.energyLevel, 0) / halfPoint;
      const olderAvgEnergy = recentMoods.slice(halfPoint)
        .reduce((sum, log) => sum + log.energyLevel, 0) / (recentMoods.length - halfPoint);

      if (recentAvgEnergy > olderAvgEnergy + 1) {
        moodTrend = 'improving';
      } else if (recentAvgEnergy < olderAvgEnergy - 1) {
        moodTrend = 'declining';
      } else {
        moodTrend = 'stable';
      }
    }

    res.status(200).json({
      summary: {
        totalJournals: journalCount,
        totalMoodLogs: moodLogCount,
        totalTherapyPlans: therapyPlanCount,
        totalRecommendations: recommendationCount,
      },
      recentActivity: {
        journals: recentJournals,
        moods: recentMoods,
        therapyPlans: activeTherapyPlans,
        recommendations: recentRecommendations,
      },
      moodTrend,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an insight
 * DELETE /api/insights/:id
 */
export const deleteInsight = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if insight exists and belongs to user
    const existingInsight = await prisma.insight.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingInsight) {
      return res.status(404).json({ error: 'Insight not found.' });
    }

    // Delete insight
    await prisma.insight.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: 'Insight deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
