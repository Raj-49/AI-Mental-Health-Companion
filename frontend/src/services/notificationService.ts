/**
 * Notification Service
 * 
 * Contains all API calls related to notifications:
 * - Get notifications
 * - Create notification
 * - Mark as read
 * - Delete notification
 */

import axiosClient from '../lib/axiosClient';

export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string | null;
  createdAt: string;
}

export interface NotificationResponse {
  message?: string;
  notification: Notification;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: string;
}

export interface NotificationStatsResponse {
  totalCount: number;
  unreadCount: number;
  readCount: number;
  typeBreakdown: Array<{
    type: string | null;
    count: number;
  }>;
}

/**
 * Get all notifications for authenticated user
 * GET /api/notifications
 */
export const getNotifications = async (
  page: number = 1,
  limit: number = 20,
  isRead?: boolean
): Promise<NotificationsResponse> => {
  const params: Record<string, string | number | boolean> = { page, limit };
  if (isRead !== undefined) params.isRead = isRead;
  
  const response = await axiosClient.get<NotificationsResponse>('/notifications', { params });
  return response.data;
};

/**
 * Get a single notification by ID
 * GET /api/notifications/:id
 */
export const getNotificationById = async (id: number): Promise<NotificationResponse> => {
  const response = await axiosClient.get<NotificationResponse>(`/notifications/${id}`);
  return response.data;
};

/**
 * Create a new notification
 * POST /api/notifications
 */
export const createNotification = async (
  data: CreateNotificationData
): Promise<NotificationResponse> => {
  const response = await axiosClient.post<NotificationResponse>('/notifications', data);
  return response.data;
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = async (id: number): Promise<NotificationResponse> => {
  const response = await axiosClient.patch<NotificationResponse>(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = async (): Promise<{ message: string }> => {
  const response = await axiosClient.patch<{ message: string }>('/notifications/read-all');
  return response.data;
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (id: number): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ message: string }>(`/notifications/${id}`);
  return response.data;
};

/**
 * Delete all read notifications
 * DELETE /api/notifications/clear-read
 */
export const clearReadNotifications = async (): Promise<{ message: string; count: number }> => {
  const response = await axiosClient.delete<{ message: string; count: number }>(
    '/notifications/clear-read'
  );
  return response.data;
};

/**
 * Get notification statistics
 * GET /api/notifications/stats
 */
export const getNotificationStats = async (): Promise<NotificationStatsResponse> => {
  const response = await axiosClient.get<NotificationStatsResponse>('/notifications/stats');
  return response.data;
};
