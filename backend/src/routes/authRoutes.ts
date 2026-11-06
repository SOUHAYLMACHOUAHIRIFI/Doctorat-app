import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public routes with rate limiting
router.post('/register', authRateLimiter, authController.registerCandidate);
router.post('/login', authRateLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/password/reset-request', authRateLimiter, authController.requestPasswordReset);
router.post('/password/reset-confirm', authRateLimiter, authController.confirmPasswordReset);

// Private authenticated routes
router.get('/me', requireAuth, authController.getMe);
router.put('/profile', requireAuth, authController.updateProfile);

export default router;
