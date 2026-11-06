import { notificationRepository } from '../repositories/notificationRepository';
import { NotificationEntity } from '../types';

export const notificationService = {
  getUserNotifications(userId: string): NotificationEntity[] {
    return notificationRepository.findByUser(userId);
  },

  notify(
    userId: string,
    title: string,
    message: string,
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT' = 'INFO',
    link?: string
  ): NotificationEntity {
    return notificationRepository.create({
      id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title,
      message,
      type,
      isRead: false,
      link,
      createdAt: new Date().toISOString().split('T')[0],
    });
  },

  markAsRead(id: string, userId: string): boolean {
    return notificationRepository.markAsRead(id, userId);
  },

  markAllAsRead(userId: string): void {
    notificationRepository.markAllAsRead(userId);
  },
};
