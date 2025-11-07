/**
 * Preference Service
 * 
 * Contains all API calls related to user preferences and notifications:
 * - Get preferences
 * - Update preferences
 * - Update theme
 * - Update AI tone
 * - Update reminder settings
 */

import axiosClient from '../lib/axiosClient';

export type Theme = 'light' | 'dark';
export type AiTone = 'empathetic' | 'neutral' | 'motivational';

export interface UserPreference {
  id: number;
  userId: number;
  theme: Theme;
  aiTone: AiTone;
  dailyReminder: boolean;
}

export interface PreferenceResponse {
  message?: string;
  preferences?: UserPreference;
  theme?: Theme;
  aiTone?: AiTone;
  dailyReminder?: boolean;
}

export interface UpdatePreferencesData {
  theme?: Theme;
  aiTone?: AiTone;
  dailyReminder?: boolean;
}

/**
 * Get user preferences
 * GET /api/preferences
 */
export const getUserPreferences = async (): Promise<PreferenceResponse> => {
  const response = await axiosClient.get<PreferenceResponse>('/preferences');
  return response.data;
};

/**
 * Update user preferences
 * PUT /api/preferences
 */
export const updateUserPreferences = async (
  data: UpdatePreferencesData
): Promise<PreferenceResponse> => {
  const response = await axiosClient.put<PreferenceResponse>('/preferences', data);
  return response.data;
};

/**
 * Update theme preference
 * PATCH /api/preferences/theme
 */
export const updateTheme = async (theme: Theme): Promise<PreferenceResponse> => {
  const response = await axiosClient.patch<PreferenceResponse>('/preferences/theme', { theme });
  return response.data;
};

/**
 * Update AI tone preference
 * PATCH /api/preferences/ai-tone
 */
export const updateAiTone = async (aiTone: AiTone): Promise<PreferenceResponse> => {
  const response = await axiosClient.patch<PreferenceResponse>('/preferences/ai-tone', { aiTone });
  return response.data;
};

/**
 * Update daily reminder setting
 * PATCH /api/preferences/reminder
 */
export const updateReminderSetting = async (
  dailyReminder: boolean
): Promise<PreferenceResponse> => {
  const response = await axiosClient.patch<PreferenceResponse>('/preferences/reminder', {
    dailyReminder,
  });
  return response.data;
};
