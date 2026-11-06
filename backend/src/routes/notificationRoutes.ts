import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.get('/my', requireAuth, notificationController.getMyNotifications);
router.put('/:id/read', requireAuth, notificationController.markAsRead);
router.put('/read-all', requireAuth, notificationController.markAllAsRead);

export default router;
