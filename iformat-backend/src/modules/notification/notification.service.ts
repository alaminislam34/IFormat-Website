import { prisma } from "../../lib/prisma.js";

export class NotificationService {
  static async createNotification(input: {
    userId: string;
    type: string;
    title: string;
    message: string;
    payload?: any;
  }) {
    return prisma.notification.create({
      data: input,
    });
  }

  static async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
