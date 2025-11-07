/**
 * Therapy Plan Controller
 * 
 * Handles therapy plan CRUD operations and progress tracking.
 * All operations are scoped to the authenticated user.
 */

import prisma from '../config/prismaClient.js';

/**
 * Create a new therapy plan
 * POST /api/therapy
 * 
 * @param {Object} req.body - { goalTitle, goalDescription?, progress? }
 */
export const createTherapyPlan = async (req, res, next) => {
  try {
    const { goalTitle, goalDescription, progress } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!goalTitle || goalTitle.trim() === '') {
      return res.status(400).json({ error: 'Goal title is required.' });
    }

    // Validate progress range
    const progressValue = progress !== undefined ? parseInt(progress) : 0;
    if (progressValue < 0 || progressValue > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100.' });
    }

    // Create therapy plan
    const therapyPlan = await prisma.therapyPlan.create({
      data: {
        userId,
        goalTitle,
        goalDescription: goalDescription || null,
        progress: progressValue,
      },
    });

    res.status(201).json({
      message: 'Therapy plan created successfully.',
      therapyPlan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all therapy plans for the authenticated user
 * GET /api/therapy
 * 
 * Query params:
 * - page (optional, default: 1)
 * - limit (optional, default: 10)
 * - completed (optional, true/false - filters by progress 100%)
 */
export const getTherapyPlans = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, completed } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = { userId };
    
    if (completed === 'true') {
      where.progress = 100;
    } else if (completed === 'false') {
      where.progress = { lt: 100 };
    }

    // Get therapy plans with pagination
    const [therapyPlans, totalCount] = await Promise.all([
      prisma.therapyPlan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          goalTitle: true,
          goalDescription: true,
          progress: true,
          createdAt: true,
        },
      }),
      prisma.therapyPlan.count({ where }),
    ]);

    res.status(200).json({
      therapyPlans,
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
 * Get a single therapy plan by ID
 * GET /api/therapy/:id
 */
export const getTherapyPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const therapyPlan = await prisma.therapyPlan.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!therapyPlan) {
      return res.status(404).json({ error: 'Therapy plan not found.' });
    }

    res.status(200).json({ therapyPlan });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a therapy plan
 * PUT /api/therapy/:id
 * 
 * @param {Object} req.body - { goalTitle?, goalDescription?, progress? }
 */
export const updateTherapyPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { goalTitle, goalDescription, progress } = req.body;

    // Check if therapy plan exists and belongs to user
    const existingPlan = await prisma.therapyPlan.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingPlan) {
      return res.status(404).json({ error: 'Therapy plan not found.' });
    }

    // Validate progress range if provided
    if (progress !== undefined) {
      const progressValue = parseInt(progress);
      if (progressValue < 0 || progressValue > 100) {
        return res.status(400).json({ error: 'Progress must be between 0 and 100.' });
      }
    }

    // Update therapy plan
    const updatedPlan = await prisma.therapyPlan.update({
      where: { id: parseInt(id) },
      data: {
        goalTitle: goalTitle !== undefined ? goalTitle : existingPlan.goalTitle,
        goalDescription: goalDescription !== undefined ? goalDescription : existingPlan.goalDescription,
        progress: progress !== undefined ? parseInt(progress) : existingPlan.progress,
      },
    });

    res.status(200).json({
      message: 'Therapy plan updated successfully.',
      therapyPlan: updatedPlan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a therapy plan
 * DELETE /api/therapy/:id
 */
export const deleteTherapyPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if therapy plan exists and belongs to user
    const existingPlan = await prisma.therapyPlan.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingPlan) {
      return res.status(404).json({ error: 'Therapy plan not found.' });
    }

    // Delete therapy plan
    await prisma.therapyPlan.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: 'Therapy plan deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get therapy plan statistics
 * GET /api/therapy/stats
 */
export const getTherapyStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [totalPlans, completedPlans, activePlans, avgProgress] = await Promise.all([
      prisma.therapyPlan.count({ where: { userId } }),
      prisma.therapyPlan.count({ where: { userId, progress: 100 } }),
      prisma.therapyPlan.count({ where: { userId, progress: { lt: 100 } } }),
      prisma.therapyPlan.aggregate({
        where: { userId },
        _avg: { progress: true },
      }),
    ]);

    // Get recent plans
    const recentPlans = await prisma.therapyPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        goalTitle: true,
        progress: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      totalPlans,
      completedPlans,
      activePlans,
      averageProgress: avgProgress._avg.progress 
        ? parseFloat(avgProgress._avg.progress.toFixed(1)) 
        : 0,
      recentPlans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update therapy plan progress
 * PATCH /api/therapy/:id/progress
 * 
 * @param {Object} req.body - { progress }
 */
export const updateTherapyProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { progress } = req.body;

    // Validate progress
    if (progress === undefined) {
      return res.status(400).json({ error: 'Progress value is required.' });
    }

    const progressValue = parseInt(progress);
    if (progressValue < 0 || progressValue > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100.' });
    }

    // Check if therapy plan exists and belongs to user
    const existingPlan = await prisma.therapyPlan.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingPlan) {
      return res.status(404).json({ error: 'Therapy plan not found.' });
    }

    // Update progress
    const updatedPlan = await prisma.therapyPlan.update({
      where: { id: parseInt(id) },
      data: { progress: progressValue },
    });

    res.status(200).json({
      message: 'Progress updated successfully.',
      therapyPlan: updatedPlan,
    });
  } catch (error) {
    next(error);
  }
};
