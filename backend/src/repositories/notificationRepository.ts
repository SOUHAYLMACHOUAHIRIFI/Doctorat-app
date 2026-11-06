import { db } from './database';
import { NotificationEntity } from '../types';

export const notificationRepository = {
  findByUser(userId: string): NotificationEntity[] {
    return db.get('notifications').filter((n) => n.userId === userId);
  },

  create(notification: NotificationEntity): NotificationEntity {
    db.get('notifications').unshift(notification);
    db.save();
    return notification;
  },

  markAsRead(id: string, userId: string): boolean {
    const notif = db.get('notifications').find((n) => n.id === id && n.userId === userId);
    if (!notif) return false;

    notif.isRead = true;
    db.save();
    return true;
  },

  markAllAsRead(userId: string): void {
    db.get('notifications')
      .filter((n) => n.userId === userId)
      .forEach((n) => (n.isRead = true));
    db.save();
  },
};
