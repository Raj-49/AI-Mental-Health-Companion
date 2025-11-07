/**
 * Journal Controller
 * 
 * Handles CRUD operations for user journal entries.
 * All operations are scoped to the authenticated user.
 */

import prisma from '../config/prismaClient.js';

/**
 * Create a new journal entry
 * POST /api/journals
 * 
 * @param {Object} req.body - { title?, content?, mood? }
 * @param {Object} req.user - authenticated user from middleware
 */
export const createJournal = async (req, res, next) => {
  try {
    const { title, content, mood } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Journal content is required.' });
    }

    // Create journal entry
    const journal = await prisma.journal.create({
      data: {
        userId,
        title: title || null,
        content,
        mood: mood || null,
      },
    });

    res.status(201).json({
      message: 'Journal entry created successfully.',
      journal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all journal entries for the authenticated user
 * GET /api/journals
 * 
 * Query params:
 * - page (optional, default: 1)
 * - limit (optional, default: 10)
 * - mood (optional, filter by mood)
 */
export const getJournals = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, mood } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = { userId };
    if (mood) {
      where.mood = mood;
    }

    // Get journals with pagination
    const [journals, totalCount] = await Promise.all([
      prisma.journal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          title: true,
          content: true,
          mood: true,
          createdAt: true,
        },
      }),
      prisma.journal.count({ where }),
    ]);

    res.status(200).json({
      journals,
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
 * Get a single journal entry by ID
 * GET /api/journals/:id
 */
export const getJournalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const journal = await prisma.journal.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        mood: true,
        createdAt: true,
      },
    });

    if (!journal) {
      return res.status(404).json({ error: 'Journal entry not found.' });
    }

    res.status(200).json({ journal });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a journal entry
 * PUT /api/journals/:id
 * 
 * @param {Object} req.body - { title?, content?, mood? }
 */
export const updateJournal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, content, mood } = req.body;

    // Check if journal exists and belongs to user
    const existingJournal = await prisma.journal.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingJournal) {
      return res.status(404).json({ error: 'Journal entry not found.' });
    }

    // Update journal
    const updatedJournal = await prisma.journal.update({
      where: { id: parseInt(id) },
      data: {
        title: title !== undefined ? title : existingJournal.title,
        content: content !== undefined ? content : existingJournal.content,
        mood: mood !== undefined ? mood : existingJournal.mood,
      },
    });

    res.status(200).json({
      message: 'Journal entry updated successfully.',
      journal: updatedJournal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a journal entry
 * DELETE /api/journals/:id
 */
export const deleteJournal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if journal exists and belongs to user
    const existingJournal = await prisma.journal.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!existingJournal) {
      return res.status(404).json({ error: 'Journal entry not found.' });
    }

    // Delete journal
    await prisma.journal.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: 'Journal entry deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get journal statistics for the authenticated user
 * GET /api/journals/stats
 */
export const getJournalStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [totalCount, moodBreakdown, recentJournals] = await Promise.all([
      prisma.journal.count({ where: { userId } }),
      prisma.journal.groupBy({
        by: ['mood'],
        where: { userId, mood: { not: null } },
        _count: { mood: true },
      }),
      prisma.journal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          mood: true,
          createdAt: true,
        },
      }),
    ]);

    res.status(200).json({
      totalCount,
      moodBreakdown: moodBreakdown.map(item => ({
        mood: item.mood,
        count: item._count.mood,
      })),
      recentJournals,
    });
  } catch (error) {
    next(error);
  }
};
