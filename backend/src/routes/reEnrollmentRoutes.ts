import { Router } from 'express';
import { reEnrollmentController } from '../controllers/reEnrollmentController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { ROLES } from '../config/constants';

const router = Router();

router.get('/', requireAuth, reEnrollmentController.getReEnrollments);

// Student submit annual report
router.post('/', requireAuth, requireRoles(ROLES.DOCTORANT), reEnrollmentController.submitReEnrollment);

// Supervisor evaluation
router.post(
  '/:id/evaluate',
  requireAuth,
  requireRoles(ROLES.SUPERVISOR, ROLES.CED_ADMIN, ROLES.SYSTEM_ADMIN),
  reEnrollmentController.evaluateSupervisor
);

// CED final validation
router.post(
  '/:id/validate-ced',
  requireAuth,
  requireRoles(ROLES.CED_ADMIN, ROLES.SYSTEM_ADMIN),
  reEnrollmentController.validateCed
);

export default router;
