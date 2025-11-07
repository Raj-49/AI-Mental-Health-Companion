/**
 * Therapy Service
 * 
 * Contains all API calls related to therapy plans:
 * - Create therapy plan
 * - Get therapy plans
 * - Update therapy plan
 * - Update progress
 * - Delete therapy plan
 * - Get statistics
 */

import axiosClient from '../lib/axiosClient';

export interface TherapyPlan {
  id: number;
  goalTitle: string;
  goalDescription: string | null;
  progress: number;
  createdAt: string;
}

export interface CreateTherapyPlanData {
  goalTitle: string;
  goalDescription?: string;
  progress?: number;
}

export interface UpdateTherapyPlanData {
  goalTitle?: string;
  goalDescription?: string;
  progress?: number;
}

export interface TherapyPlanResponse {
  message?: string;
  therapyPlan: TherapyPlan;
}

export interface TherapyPlansResponse {
  therapyPlans: TherapyPlan[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface TherapyStatsResponse {
  totalPlans: number;
  completedPlans: number;
  activePlans: number;
  averageProgress: number;
  recentPlans: Array<{
    id: number;
    goalTitle: string;
    progress: number;
    createdAt: string;
  }>;
}

/**
 * Create a new therapy plan
 * POST /api/therapy
 */
export const createTherapyPlan = async (
  data: CreateTherapyPlanData
): Promise<TherapyPlanResponse> => {
  const response = await axiosClient.post<TherapyPlanResponse>('/therapy', data);
  return response.data;
};

/**
 * Get all therapy plans for authenticated user
 * GET /api/therapy
 */
export const getTherapyPlans = async (
  page: number = 1,
  limit: number = 10,
  completed?: boolean
): Promise<TherapyPlansResponse> => {
  const params: Record<string, string | number | boolean> = { page, limit };
  if (completed !== undefined) params.completed = completed;
  
  const response = await axiosClient.get<TherapyPlansResponse>('/therapy', { params });
  return response.data;
};

/**
 * Get a single therapy plan by ID
 * GET /api/therapy/:id
 */
export const getTherapyPlanById = async (id: number): Promise<TherapyPlanResponse> => {
  const response = await axiosClient.get<TherapyPlanResponse>(`/therapy/${id}`);
  return response.data;
};

/**
 * Update a therapy plan
 * PUT /api/therapy/:id
 */
export const updateTherapyPlan = async (
  id: number,
  data: UpdateTherapyPlanData
): Promise<TherapyPlanResponse> => {
  const response = await axiosClient.put<TherapyPlanResponse>(`/therapy/${id}`, data);
  return response.data;
};

/**
 * Update therapy plan progress
 * PATCH /api/therapy/:id/progress
 */
export const updateTherapyProgress = async (
  id: number,
  progress: number
): Promise<TherapyPlanResponse> => {
  const response = await axiosClient.patch<TherapyPlanResponse>(
    `/therapy/${id}/progress`,
    { progress }
  );
  return response.data;
};

/**
 * Delete a therapy plan
 * DELETE /api/therapy/:id
 */
export const deleteTherapyPlan = async (id: number): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ message: string }>(`/therapy/${id}`);
  return response.data;
};

/**
 * Get therapy plan statistics
 * GET /api/therapy/stats
 */
export const getTherapyStats = async (): Promise<TherapyStatsResponse> => {
  const response = await axiosClient.get<TherapyStatsResponse>('/therapy/stats');
  return response.data;
};
