/**
 * Recommendation Service
 * 
 * Contains all API calls related to AI recommendations:
 * - Get recommendations
 * - Generate recommendations
 * - Delete recommendation
 */

import axiosClient from '../lib/axiosClient';

export interface Recommendation {
  id: number;
  category: string | null;
  title: string | null;
  description: string | null;
  createdAt: string;
}

export interface RecommendationResponse {
  message?: string;
  recommendation: Recommendation;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface GenerateRecommendationsResponse {
  message: string;
  recommendations: Recommendation[];
  note?: string;
}

export interface RecommendationStatsResponse {
  totalCount: number;
  categoryBreakdown: Array<{
    category: string | null;
    count: number;
  }>;
}

/**
 * Get all recommendations for authenticated user
 * GET /api/recommendations
 */
export const getRecommendations = async (
  page: number = 1,
  limit: number = 10,
  category?: string
): Promise<RecommendationsResponse> => {
  const params: Record<string, string | number> = { page, limit };
  if (category) params.category = category;
  
  const response = await axiosClient.get<RecommendationsResponse>('/recommendations', { params });
  return response.data;
};

/**
 * Get a single recommendation by ID
 * GET /api/recommendations/:id
 */
export const getRecommendationById = async (id: number): Promise<RecommendationResponse> => {
  const response = await axiosClient.get<RecommendationResponse>(`/recommendations/${id}`);
  return response.data;
};

/**
 * Generate new AI recommendations
 * POST /api/recommendations/generate
 */
export const generateRecommendations = async (): Promise<GenerateRecommendationsResponse> => {
  const response = await axiosClient.post<GenerateRecommendationsResponse>(
    '/recommendations/generate'
  );
  return response.data;
};

/**
 * Delete a recommendation
 * DELETE /api/recommendations/:id
 */
export const deleteRecommendation = async (id: number): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ message: string }>(`/recommendations/${id}`);
  return response.data;
};

/**
 * Get recommendation statistics
 * GET /api/recommendations/stats
 */
export const getRecommendationStats = async (): Promise<RecommendationStatsResponse> => {
  const response = await axiosClient.get<RecommendationStatsResponse>('/recommendations/stats');
  return response.data;
};
