import { Router } from 'express';
import { auditController } from '../controllers/auditController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { ROLES } from '../config/constants';

const router = Router();

// Audit logs restricted to CED_ADMIN and SYSTEM_ADMIN
router.get(
  '/',
  requireAuth,
  requireRoles(ROLES.CED_ADMIN, ROLES.SYSTEM_ADMIN),
  auditController.getLogs
);

export default router;
