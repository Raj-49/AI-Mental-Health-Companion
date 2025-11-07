/**
 * Mood Service
 * 
 * Contains all API calls related to mood logging:
 * - Create mood log
 * - Get mood logs
 * - Get mood statistics
 * - Update mood log
 * - Delete mood log
 */

import axiosClient from '../lib/axiosClient';

export interface MoodLog {
  id: number;
  mood: string;
  energyLevel: number;
  stressLevel: number;
  note: string | null;
  loggedAt: string;
}

export interface CreateMoodLogData {
  mood: string;
  energyLevel: number;
  stressLevel: number;
  note?: string;
}

export interface UpdateMoodLogData {
  mood?: string;
  energyLevel?: number;
  stressLevel?: number;
  note?: string;
}

export interface MoodLogResponse {
  message?: string;
  moodLog: MoodLog;
}

export interface MoodLogsResponse {
  moodLogs: MoodLog[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface MoodStatsResponse {
  period: number;
  totalLogs: number;
  moodBreakdown: Array<{
    mood: string;
    count: number;
    percentage: string;
  }>;
  mostCommonMood: string;
  averageEnergy: number;
  averageStress: number;
  trend: 'improving' | 'declining' | 'stable' | null;
  moodTimeline: Array<{
    date: string;
    mood: string;
    energyLevel: number;
    stressLevel: number;
  }>;
}

/**
 * Create a new mood log
 * POST /api/moods
 */
export const createMoodLog = async (data: CreateMoodLogData): Promise<MoodLogResponse> => {
  const response = await axiosClient.post<MoodLogResponse>('/moods', data);
  return response.data;
};

/**
 * Get all mood logs for authenticated user
 * GET /api/moods
 */
export const getMoodLogs = async (
  page: number = 1,
  limit: number = 20,
  startDate?: string,
  endDate?: string
): Promise<MoodLogsResponse> => {
  const params: Record<string, string | number> = { page, limit };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await axiosClient.get<MoodLogsResponse>('/moods', { params });
  return response.data;
};

/**
 * Get mood statistics
 * GET /api/moods/stats
 */
export const getMoodStats = async (days: number = 7): Promise<MoodStatsResponse> => {
  const response = await axiosClient.get<MoodStatsResponse>('/moods/stats', {
    params: { days },
  });
  return response.data;
};

/**
 * Get a single mood log by ID
 * GET /api/moods/:id
 */
export const getMoodLogById = async (id: number): Promise<MoodLogResponse> => {
  const response = await axiosClient.get<MoodLogResponse>(`/moods/${id}`);
  return response.data;
};

/**
 * Update a mood log
 * PUT /api/moods/:id
 */
export const updateMoodLog = async (
  id: number,
  data: UpdateMoodLogData
): Promise<MoodLogResponse> => {
  const response = await axiosClient.put<MoodLogResponse>(`/moods/${id}`, data);
  return response.data;
};

/**
 * Delete a mood log
 * DELETE /api/moods/:id
 */
export const deleteMoodLog = async (id: number): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ message: string }>(`/moods/${id}`);
  return response.data;
};
