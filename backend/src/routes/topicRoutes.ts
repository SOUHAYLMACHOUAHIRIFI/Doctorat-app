import { Router } from 'express';
import { topicController } from '../controllers/topicController';
import { optionalAuth, requireAuth } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { ROLES } from '../config/constants';

const router = Router();

// Public / Authenticated catalog reading
router.get('/', optionalAuth, topicController.getTopics);
router.get('/:id', optionalAuth, topicController.getTopicById);

// Supervisor / Admin topic creation
router.post(
  '/',
  requireAuth,
  requireRoles(ROLES.SUPERVISOR, ROLES.CED_ADMIN, ROLES.SYSTEM_ADMIN),
  topicController.createTopic
);

// Supervisor update
router.put(
  '/:id',
  requireAuth,
  requireRoles(ROLES.SUPERVISOR, ROLES.CED_ADMIN, ROLES.SYSTEM_ADMIN),
  topicController.updateTopic
);

// Structure / CED review & validation
router.post(
  '/:id/review',
  requireAuth,
  requireRoles(ROLES.STRUCTURE_DIRECTOR, ROLES.CED, ROLES.CED_ADMIN, ROLES.ADMIN, ROLES.SYSTEM_ADMIN),
  topicController.reviewTopicStructure
);

// Structure / CED official signing with digital visa
router.post(
  '/:id/sign-structure',
  requireAuth,
  requireRoles(ROLES.STRUCTURE_DIRECTOR, ROLES.CED, ROLES.CED_ADMIN, ROLES.ADMIN, ROLES.SYSTEM_ADMIN),
  topicController.signTopicStructure
);

export default router;
