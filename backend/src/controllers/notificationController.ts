import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { notificationService } from '../services/notificationService';

export const notificationController = {
  getMyNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const notifs = notificationService.getUserNotifications(req.user.id);
      const unreadCount = notifs.filter((n) => !n.isRead).length;

      res.json({
        success: true,
        count: notifs.length,
        unreadCount,
        notifications: notifs,
      });
    } catch (err) {
      next(err);
    }
  },

  markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      notificationService.markAsRead(req.params.id, req.user.id);
      res.json({
        success: true,
        message: 'Notification marquée comme lue.',
      });
    } catch (err) {
      next(err);
    }
  },

  markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      notificationService.markAllAsRead(req.user.id);
      res.json({
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues.',
      });
    } catch (err) {
      next(err);
    }
  },
};
