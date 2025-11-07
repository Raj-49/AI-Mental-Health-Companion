/**
 * Insight Service
 * 
 * Contains all API calls related to insights and dashboard data:
 * - Get insights
 * - Generate insights
 * - Get dashboard overview
 */

import axiosClient from '../lib/axiosClient';

export interface Insight {
  id: number;
  moodSummary: string | null;
  journalingPattern: string | null;
  aiSummary: string | null;
  generatedAt: string;
}

export interface InsightResponse {
  message?: string;
  insight: Insight;
  note?: string;
}

export interface InsightsResponse {
  insights: Insight[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface DashboardOverview {
  summary: {
    totalJournals: number;
    totalMoodLogs: number;
    totalTherapyPlans: number;
    totalRecommendations: number;
  };
  recentActivity: {
    journals: Array<{
      id: number;
      title: string | null;
      mood: string | null;
      createdAt: string;
    }>;
    moods: Array<{
      mood: string;
      energyLevel: number;
      stressLevel: number;
      loggedAt: string;
    }>;
    therapyPlans: Array<{
      id: number;
      goalTitle: string;
      progress: number;
    }>;
    recommendations: Array<{
      id: number;
      category: string | null;
      title: string | null;
      description: string | null;
    }>;
  };
  moodTrend: 'improving' | 'declining' | 'stable' | null;
}

/**
 * Get all insights for authenticated user
 * GET /api/insights
 */
export const getInsights = async (
  page: number = 1,
  limit: number = 10
): Promise<InsightsResponse> => {
  const response = await axiosClient.get<InsightsResponse>('/insights', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Get the latest insight
 * GET /api/insights/latest
 */
export const getLatestInsight = async (): Promise<InsightResponse> => {
  const response = await axiosClient.get<InsightResponse>('/insights/latest');
  return response.data;
};

/**
 * Generate new insights
 * POST /api/insights/generate
 */
export const generateInsights = async (): Promise<InsightResponse> => {
  const response = await axiosClient.post<InsightResponse>('/insights/generate');
  return response.data;
};

/**
 * Get dashboard overview data
 * GET /api/insights/dashboard
 */
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await axiosClient.get<DashboardOverview>('/insights/dashboard');
  return response.data;
};

/**
 * Delete an insight
 * DELETE /api/insights/:id
 */
export const deleteInsight = async (id: number): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ message: string }>(`/insights/${id}`);
  return response.data;
};
