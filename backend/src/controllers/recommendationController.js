/**
 * Recommendation Controller
 * 
 * Handles AI-powered recommendations for users.
 * Currently provides placeholder/mock data. AI logic integration in Section 5.
 * All operations are scoped to the authenticated user.
 */

import prisma from '../config/prismaClient.js';

/**
 * Get all recommendations for the authenticated user
 * GET /api/recommendations
 * 
 * Query params:
 * - page (optional, default: 1)
 * - limit (optional, default: 10)
 * - category (optional, filter by category)
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, category } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = { userId };
    if (category) {
      where.category = category;
    }

    // Get recommendations with pagination
    const [recommendations, totalCount] = await Promise.all([
      prisma.recommendation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          category: true,
          title: true,
          description: true,
          createdAt: true,
        },
      }),
      prisma.recommendation.count({ where }),
    ]);

    res.status(200).json({
      recommendations,
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
 * Get a single recommendation by ID
 * GET /api/recommendations/:id
 */
export const getRecommendationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const recommendation = await prisma.recommendation.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found.' });
    }

    res.status(200).json({ recommendation });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate new AI recommendations (placeholder for Section 5)
 * POST /api/recommendations/generate
 * 
 * This endpoint will be enhanced in Section 5 with actual AI logic
 * Currently generates mock recommendations based on user data
 */
export const generateRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // TODO: Section 5 - Integrate actual AI recommendation engine
    // For now, generate placeholder recommendations based on recent user activity

    // Get recent user data
    const [recentMoods, recentJournals, therapyPlans] = await Promise.all([
      prisma.moodLog.findMany({
        where: { userId },
        orderBy: { loggedAt: 'desc' },
        take: 5,
      }),
      prisma.journal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.therapyPlan.findMany({
        where: { userId, progress: { lt: 100 } },
        take: 3,
      }),
    ]);

    // Generate mock recommendations
    const mockRecommendations = [];

    // Mood-based recommendations
    if (recentMoods.length > 0) {
      const avgStress = recentMoods.reduce((sum, log) => sum + log.stressLevel, 0) / recentMoods.length;
      const avgEnergy = recentMoods.reduce((sum, log) => sum + log.energyLevel, 0) / recentMoods.length;

      if (avgStress > 7) {
        mockRecommendations.push({
          category: 'Stress Management',
          title: 'Try Deep Breathing Exercises',
          description: 'Your recent stress levels are elevated. Consider practicing 10 minutes of deep breathing daily to help reduce stress and anxiety.',
        });
      }

      if (avgEnergy < 4) {
        mockRecommendations.push({
          category: 'Energy & Motivation',
          title: 'Establish a Morning Routine',
          description: 'Your energy levels have been low. Creating a consistent morning routine with light exercise and healthy breakfast can boost your energy.',
        });
      }
    }

    // Journal-based recommendations
    if (recentJournals.length < 3) {
      mockRecommendations.push({
        category: 'Self-Reflection',
        title: 'Journal More Regularly',
        description: 'Regular journaling helps process emotions and track personal growth. Try writing for 10 minutes each evening.',
      });
    }

    // Therapy plan recommendations
    if (therapyPlans.length > 0) {
      mockRecommendations.push({
        category: 'Goal Progress',
        title: 'Review Your Therapy Goals',
        description: 'You have active therapy goals. Take time this week to review your progress and adjust your action steps if needed.',
      });
    }

    // Default recommendations if no data
    if (mockRecommendations.length === 0) {
      mockRecommendations.push(
        {
          category: 'Mindfulness',
          title: 'Start a Meditation Practice',
          description: 'Meditation can improve focus, reduce stress, and enhance emotional well-being. Start with just 5 minutes daily.',
        },
        {
          category: 'Physical Wellness',
          title: 'Incorporate Daily Movement',
          description: 'Regular physical activity boosts mood and energy. Aim for at least 30 minutes of movement each day.',
        }
      );
    }

    // Save recommendations to database
    const createdRecommendations = await Promise.all(
      mockRecommendations.map(rec =>
        prisma.recommendation.create({
          data: {
            userId,
            category: rec.category,
            title: rec.title,
            description: rec.description,
          },
        })
      )
    );

    res.status(201).json({
      message: 'Recommendations generated successfully.',
      recommendations: createdRecommendations,
      note: 'These are placeholder recommendations. AI-powered recommendations will be implemented in Section 5.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a recommendation
 * DELETE /api/recommendations/:id
 */
export const deleteRecommendation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if recommendation exists and belongs to user
    const existingRecommendation = await prisma.recommendation.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingRecommendation) {
      return res.status(404).json({ error: 'Recommendation not found.' });
    }

    // Delete recommendation
    await prisma.recommendation.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: 'Recommendation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recommendation statistics
 * GET /api/recommendations/stats
 */
export const getRecommendationStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [totalCount, categoryBreakdown] = await Promise.all([
      prisma.recommendation.count({ where: { userId } }),
      prisma.recommendation.groupBy({
        by: ['category'],
        where: { userId, category: { not: null } },
        _count: { category: true },
      }),
    ]);

    res.status(200).json({
      totalCount,
      categoryBreakdown: categoryBreakdown.map(item => ({
        category: item.category,
        count: item._count.category,
      })),
    });
  } catch (error) {
    next(error);
  }
};
