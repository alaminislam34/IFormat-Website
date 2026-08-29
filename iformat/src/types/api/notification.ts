export interface NotificationDTO {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, any> | null;
  read: boolean;
  createdAt: string;
}
