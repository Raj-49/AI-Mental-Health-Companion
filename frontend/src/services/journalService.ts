/**
 * Journal Service
 * 
 * Contains all API calls related to journals:
 * - Create journal
 * - Get journals
 * - Get journal by ID
 * - Update journal
 * - Delete journal
 * - Get journal statistics
 */

import axiosClient from '../lib/axiosClient';

export interface Journal {
  id: number;
  title: string | null;
  content: string;
  mood: string | null;
  createdAt: string;
}

export interface CreateJournalData {
  title?: string;
  content: string;
  mood?: string;
}

export interface UpdateJournalData {
  title?: string;
  content?: string;
  mood?: string;
}

export interface JournalResponse {
  message?: string;
  journal: Journal;
}

export interface JournalsResponse {
  journals: Journal[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface JournalStatsResponse {
  totalCount: number;
  moodBreakdown: Array<{
    mood: string | null;
    count: number;
  }>;
  recentJournals: Array<{
    id: number;
    title: string | null;
    mood: string | null;
    createdAt: string;
  }>;
}

/**
 * Create a new journal entry
 * POST /api/journals
 */
export const createJournal = async (data: CreateJournalData): Promise<JournalResponse> => {
  const response = await axiosClient.post<JournalResponse>('/journals', data);
  return response.data;
};

/**
 * Get all journals for authenticated user
 * GET /api/journals
 */
export const getJournals = async (
  page: number = 1,
  limit: number = 10,
  mood?: string
): Promise<JournalsResponse> => {
  const params: Record<string, string | number> = { page, limit };
  if (mood) params.mood = mood;
  
  const response = await axiosClient.get<JournalsResponse>('/journals', { params });
  return response.data;
};

/**
 * Get a single journal by ID
 * GET /api/journals/:id
 */
export const getJournalById = async (id: number): Promise<JournalResponse> => {
  const response = await axiosClient.get<JournalResponse>(`/journals/${id}`);
  return response.data;
};

/**
 * Update a journal entry
 * PUT /api/journals/:id
 */
export const updateJournal = async (
  id: number,
  data: UpdateJournalData
): Promise<JournalResponse> => {
  const response = await axiosClient.put<JournalResponse>(`/journals/${id}`, data);
  return response.data;
};

/**
 * Delete a journal entry
 * DELETE /api/journals/:id
 */
export const deleteJournal = async (id: number): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ message: string }>(`/journals/${id}`);
  return response.data;
};

/**
 * Get journal statistics
 * GET /api/journals/stats
 */
export const getJournalStats = async (): Promise<JournalStatsResponse> => {
  const response = await axiosClient.get<JournalStatsResponse>('/journals/stats');
  return response.data;
};
