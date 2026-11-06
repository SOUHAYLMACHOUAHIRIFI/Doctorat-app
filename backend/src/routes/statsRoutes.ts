import { Router } from 'express';
import { statsController } from '../controllers/statsController';
import { optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

router.get('/dashboard', optionalAuth, statsController.getDashboardStats);

export default router;
