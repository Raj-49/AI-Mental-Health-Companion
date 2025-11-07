// -----------------------------
// AI CHAT SERVICE
// -----------------------------
import axios from '../lib/axiosClient';

export interface ChatMessage {
  id: number;
  chatTitle: string;
  userMessage: string;
  aiResponse: string;
  createdAt: string;
}

export interface ChatSession {
  chatTitle: string;
  messageCount: number;
  lastMessageAt: string;
  firstMessage: string;
  sessionId: number;
}

export interface SendMessageData {
  message: string;
  context?: string;
  chatTitle?: string;
  chatId?: number;
}

export interface SendMessageResponse {
  id: number;
  chatTitle: string;
  userMessage: string;
  aiResponse: string;
  createdAt: string;
}

/**
 * Send a message to AI and get response
 */
export const sendMessage = async (data: SendMessageData): Promise<SendMessageResponse> => {
  const response = await axios.post('/ai/chat', data);
  return response.data.data;
};

/**
 * Get chat history for current user
 */
export const getChatHistory = async (params?: {
  chatTitle?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  history: ChatMessage[];
  pagination: { total: number; limit: number; offset: number };
}> => {
  const response = await axios.get('/ai/history', { params });
  return response.data.data;
};

/**
 * Get all chat sessions (grouped by title)
 */
export const getChatSessions = async (): Promise<ChatSession[]> => {
  const response = await axios.get('/ai/sessions');
  return response.data.data;
};

/**
 * Get a specific chat thread by title
 */
export const getChatThread = async (chatTitle: string): Promise<{
  chatTitle: string;
  messages: Array<{
    id: number;
    userMessage: string;
    aiResponse: string;
    createdAt: string;
  }>;
}> => {
  const response = await axios.get(`/ai/thread/${encodeURIComponent(chatTitle)}`);
  return response.data.data;
};

/**
 * Update chat title
 */
export const updateChatTitle = async (
  chatId: number,
  newTitle: string
): Promise<{ oldTitle: string; newTitle: string }> => {
  const response = await axios.patch(`/ai/${chatId}/title`, { newTitle });
  return response.data.data;
};

/**
 * Delete a chat session
 */
export const deleteChatSession = async (chatTitle: string): Promise<{ deletedCount: number }> => {
  const response = await axios.delete(`/ai/session/${encodeURIComponent(chatTitle)}`);
  return response.data.data;
};

/**
 * Get email preferences
 */
export const getEmailPreferences = async (): Promise<{
  weeklyEmailEnabled: boolean;
  therapyPlanInEmail: boolean;
  emailScheduleTime: string;
  emailScheduleDays: number[];
}> => {
  const response = await axios.get('/users/me/email-preferences');
  return response.data.preferences;
};

/**
 * Update email preferences
 */
export const updateEmailPreferences = async (preferences: {
  weeklyEmailEnabled?: boolean;
  therapyPlanInEmail?: boolean;
  emailScheduleTime?: string;
  emailScheduleDays?: number[];
}): Promise<{
  weeklyEmailEnabled: boolean;
  therapyPlanInEmail: boolean;
  emailScheduleTime: string;
  emailScheduleDays: number[];
}> => {
  const response = await axios.put('/users/me/email-preferences', preferences);
  return response.data.preferences;
};

export default {
  sendMessage,
  getChatHistory,
  getChatSessions,
  getChatThread,
  updateChatTitle,
  deleteChatSession,
  getEmailPreferences,
  updateEmailPreferences,
};
