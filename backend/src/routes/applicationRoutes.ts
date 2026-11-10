import { Router } from 'express';
import { applicationController } from '../controllers/applicationController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { ROLES } from '../config/constants';

const router = Router();

// Get applications scoped by authenticated user's role
router.get('/', requireAuth, applicationController.getApplications);
router.get('/:id', requireAuth, applicationController.getApplicationById);

// Submit application (CANDIDATE only)
router.post('/', requireAuth, requireRoles(ROLES.CANDIDATE), applicationController.submitApplication);

// Delete / Withdraw application (CANDIDATE only)
router.delete('/:id', requireAuth, requireRoles(ROLES.CANDIDATE), applicationController.deleteApplication);

// Supervisor evaluation
router.post(
  '/:id/evaluate',
  requireAuth,
  requireRoles(ROLES.SUPERVISOR, ROLES.CED_ADMIN, ROLES.SYSTEM_ADMIN),
  applicationController.evaluateApplicationSupervisor
);

// Structure / CED validation
router.post(
  '/:id/validate-structure',
  requireAuth,
  requireRoles(ROLES.STRUCTURE_DIRECTOR, ROLES.CED, ROLES.CED_ADMIN, ROLES.ADMIN, ROLES.SYSTEM_ADMIN),
  applicationController.validateApplicationStructure
);

// Structure / CED Final Admission Result Notification (ADMIS, LISTE_ATTENTE, REFUSE)
router.post(
  '/:id/decision-final',
  requireAuth,
  requireRoles(ROLES.STRUCTURE_DIRECTOR, ROLES.CED, ROLES.CED_ADMIN, ROLES.ADMIN, ROLES.SYSTEM_ADMIN),
  applicationController.decideFinalAdmission
);

// Structure / CED Promote Waitlisted Candidate to Admitted
router.post(
  '/:id/promote-waitlist',
  requireAuth,
  requireRoles(ROLES.STRUCTURE_DIRECTOR, ROLES.CED, ROLES.CED_ADMIN, ROLES.ADMIN, ROLES.SYSTEM_ADMIN),
  applicationController.promoteWaitlist
);

export default router;
