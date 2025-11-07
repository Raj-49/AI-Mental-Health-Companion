/**
 * Journal Routes
 * 
 * Defines routes for journal CRUD operations.
 * All routes are protected and require authentication.
 */

import express from 'express';
import {
  createJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
  getJournalStats,
} from '../controllers/journalController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/journals
 * Create a new journal entry
 * Body: { title?, content, mood? }
 * Protected route
 */
router.post('/', authMiddleware, createJournal);

/**
 * GET /api/journals
 * Get all journal entries for the authenticated user
 * Query: page?, limit?, mood?
 * Protected route
 */
router.get('/', authMiddleware, getJournals);

/**
 * GET /api/journals/stats
 * Get journal statistics
 * Protected route
 */
router.get('/stats', authMiddleware, getJournalStats);

/**
 * GET /api/journals/:id
 * Get a single journal entry by ID
 * Protected route
 */
router.get('/:id', authMiddleware, getJournalById);

/**
 * PUT /api/journals/:id
 * Update a journal entry
 * Body: { title?, content?, mood? }
 * Protected route
 */
router.put('/:id', authMiddleware, updateJournal);

/**
 * DELETE /api/journals/:id
 * Delete a journal entry
 * Protected route
 */
router.delete('/:id', authMiddleware, deleteJournal);

export default router;
