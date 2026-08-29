import { apiClient } from "@/lib/api/api-client";
import { NotificationDTO } from "@/types/api";

export const notificationService = {
  /**
   * Fetch all notifications for the authenticated user (newest first, max 50).
   */
  async getMyNotifications(): Promise<NotificationDTO[]> {
    const data = await apiClient.get<NotificationDTO[]>("/notifications");
    return data ?? [];
  },

  /**
   * Mark a single notification as read.
   */
  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  /**
   * Mark every unread notification as read for the current user.
   */
  async markAllRead(): Promise<void> {
    await apiClient.post("/notifications/read-all");
  },
};
