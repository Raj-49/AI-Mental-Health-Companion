// -----------------------------
// AI CHAT ROUTES
// -----------------------------
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  sendMessage,
  getChatHistory,
  getChatSessions,
  updateChatTitle,
  deleteChatSession,
  getChatThread
} from "../controllers/aiChatController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/ai/chat
 * @desc    Send message to AI and get response
 * @access  Private
 */
router.post("/chat", sendMessage);

/**
 * @route   GET /api/ai/history
 * @desc    Get chat history for user
 * @access  Private
 */
router.get("/history", getChatHistory);

/**
 * @route   GET /api/ai/sessions
 * @desc    Get all chat sessions (grouped by title)
 * @access  Private
 */
router.get("/sessions", getChatSessions);

/**
 * @route   GET /api/ai/thread/:chatTitle
 * @desc    Get specific chat thread by title
 * @access  Private
 */
router.get("/thread/:chatTitle", getChatThread);

/**
 * @route   PATCH /api/ai/:id/title
 * @desc    Update chat title
 * @access  Private
 */
router.patch("/:id/title", updateChatTitle);

/**
 * @route   DELETE /api/ai/session/:chatTitle
 * @desc    Delete entire chat session
 * @access  Private
 */
router.delete("/session/:chatTitle", deleteChatSession);

export default router;
