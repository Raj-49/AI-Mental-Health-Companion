// -----------------------------
// AI CHAT CONTROLLER
// -----------------------------
import prisma from "../config/prismaClient.js";
import { 
  generateChatResponse, 
  generateChatTitle 
} from "../services/geminiService.js";

/**
 * Send a message to AI and get response
 * POST /api/ai/chat
 */
export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { message, context, chatTitle, chatId } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Message is required" 
      });
    }

    // Get user preferences for AI tone
    const userPreference = await prisma.userPreference.findUnique({
      where: { userId }
    });

    // Get chat history if chatId provided (for context continuation)
    let history = [];
    if (chatId) {
      const previousChats = await prisma.aIChatHistory.findMany({
        where: { 
          userId,
          chatTitle: chatTitle || null
        },
        orderBy: { createdAt: 'asc' },
        take: 10
      });

      history = previousChats.flatMap(chat => [
        { sender: 'user', message: chat.userMessage },
        { sender: 'ai', message: chat.aiResponse }
      ]);
    }

    // Build context with user preferences
    const aiContext = context || `User prefers ${userPreference?.aiTone || 'empathetic'} tone. Provide supportive mental health guidance.`;

    // Generate AI response
    const aiResponse = await generateChatResponse(message, aiContext, history);

    // Auto-generate title for first message in new chat
    let finalTitle = chatTitle;
    if (!chatTitle || chatTitle === "New Conversation") {
      finalTitle = await generateChatTitle(message);
    }

    // Save chat to history
    const chatHistory = await prisma.aIChatHistory.create({
      data: {
        userId,
        chatTitle: finalTitle,
        userMessage: message,
        aiResponse,
        context: aiContext
      }
    });

    res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      data: {
        id: chatHistory.id,
        chatTitle: finalTitle,
        userMessage: message,
        aiResponse,
        createdAt: chatHistory.createdAt
      }
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    next(error);
  }
};

/**
 * Get chat history for user
 * GET /api/ai/history
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { chatTitle, limit = 50, offset = 0 } = req.query;

    const where = { userId };
    if (chatTitle) {
      where.chatTitle = chatTitle;
    }

    // Get total count
    const totalCount = await prisma.aIChatHistory.count({ where });

    // Get chat history
    const history = await prisma.aIChatHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      select: {
        id: true,
        chatTitle: true,
        userMessage: true,
        aiResponse: true,
        createdAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Chat history retrieved successfully",
      data: {
        history,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    console.error("Get Chat History Error:", error);
    next(error);
  }
};

/**
 * Get unique chat sessions (grouped by title)
 * GET /api/ai/sessions
 */
export const getChatSessions = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get distinct chat titles with latest message
    const sessions = await prisma.aIChatHistory.groupBy({
      by: ['chatTitle'],
      where: { userId },
      _max: {
        createdAt: true,
        id: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _max: {
          createdAt: 'desc'
        }
      }
    });

    // Get the first message for each session
    const sessionsWithDetails = await Promise.all(
      sessions.map(async (session) => {
        const firstMessage = await prisma.aIChatHistory.findFirst({
          where: {
            userId,
            chatTitle: session.chatTitle
          },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            userMessage: true,
            createdAt: true
          }
        });

        return {
          chatTitle: session.chatTitle,
          messageCount: session._count.id,
          lastMessageAt: session._max.createdAt,
          firstMessage: firstMessage?.userMessage.substring(0, 100),
          sessionId: session._max.id
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Chat sessions retrieved successfully",
      data: sessionsWithDetails
    });
  } catch (error) {
    console.error("Get Chat Sessions Error:", error);
    next(error);
  }
};

/**
 * Update chat title
 * PATCH /api/ai/:id/title
 */
export const updateChatTitle = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { newTitle } = req.body;

    if (!newTitle || newTitle.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "New title is required" 
      });
    }

    // Verify chat belongs to user
    const chat = await prisma.aIChatHistory.findFirst({
      where: { 
        id: parseInt(id),
        userId 
      }
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: "Chat not found" 
      });
    }

    // Update all messages with the same title
    const oldTitle = chat.chatTitle;
    await prisma.aIChatHistory.updateMany({
      where: {
        userId,
        chatTitle: oldTitle
      },
      data: {
        chatTitle: newTitle.trim()
      }
    });

    res.status(200).json({
      success: true,
      message: "Chat title updated successfully",
      data: {
        oldTitle,
        newTitle: newTitle.trim()
      }
    });
  } catch (error) {
    console.error("Update Chat Title Error:", error);
    next(error);
  }
};

/**
 * Delete a chat session
 * DELETE /api/ai/session/:chatTitle
 */
export const deleteChatSession = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { chatTitle } = req.params;

    // Delete all messages in this chat session
    const result = await prisma.aIChatHistory.deleteMany({
      where: {
        userId,
        chatTitle: decodeURIComponent(chatTitle)
      }
    });

    if (result.count === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Chat session not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Chat session deleted successfully",
      data: {
        deletedCount: result.count
      }
    });
  } catch (error) {
    console.error("Delete Chat Session Error:", error);
    next(error);
  }
};

/**
 * Get a specific chat thread by title
 * GET /api/ai/thread/:chatTitle
 */
export const getChatThread = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { chatTitle } = req.params;

    const messages = await prisma.aIChatHistory.findMany({
      where: {
        userId,
        chatTitle: decodeURIComponent(chatTitle)
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        userMessage: true,
        aiResponse: true,
        createdAt: true
      }
    });

    if (messages.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Chat thread not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Chat thread retrieved successfully",
      data: {
        chatTitle: decodeURIComponent(chatTitle),
        messages
      }
    });
  } catch (error) {
    console.error("Get Chat Thread Error:", error);
    next(error);
  }
};

export default {
  sendMessage,
  getChatHistory,
  getChatSessions,
  updateChatTitle,
  deleteChatSession,
  getChatThread
};
