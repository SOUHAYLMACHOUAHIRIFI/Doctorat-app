import { Router } from 'express';
import { documentController } from '../controllers/documentController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { ROLES } from '../config/constants';

const router = Router();

// Candidate: get own documents
router.get('/my', requireAuth, documentController.getMyDocuments);

// Candidate: upload document
router.post(
  '/upload',
  requireAuth,
  requireRoles(ROLES.CANDIDATE, ROLES.DOCTORANT),
  documentController.uploadDocument
);

// Evaluator: view candidate documents
router.get(
  '/candidate/:candidateUserId',
  requireAuth,
  requireRoles(ROLES.SUPERVISOR, ROLES.STRUCTURE_DIRECTOR, ROLES.CED_ADMIN, ROLES.SYSTEM_ADMIN),
  documentController.getCandidateDocuments
);

// Review document (validate, reject with reason, request correction)
router.post(
  '/:id/review',
  requireAuth,
  requireRoles(ROLES.SUPERVISOR, ROLES.STRUCTURE_DIRECTOR, ROLES.CED_ADMIN, ROLES.SYSTEM_ADMIN),
  documentController.reviewDocument
);

// Delete own document
router.delete('/:id', requireAuth, documentController.deleteDocument);

export default router;
