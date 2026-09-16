import { apiClient } from "@/lib/api/api-client";

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  payload?: Record<string, any> | null;
  createdAt: string;
}

export const notificationService = {
  /**
   * Fetch current user's recent notifications
   */
  async getMyNotifications(): Promise<AppNotification[]> {
    return apiClient.get<AppNotification[]>("/notifications");
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<void> {
    return apiClient.patch<void>(`/notifications/${id}/read`);
  },

  async markRead(id: string): Promise<void> {
    return apiClient.patch<void>(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    return apiClient.post<void>("/notifications/read-all");
  },

  async markAllRead(): Promise<void> {
    return apiClient.post<void>("/notifications/read-all");
  },
};
