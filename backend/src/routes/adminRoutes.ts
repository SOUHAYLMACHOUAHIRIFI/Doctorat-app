import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { ROLES } from '../config/constants';

const router = Router();

// Restricted to SYSTEM_ADMIN and CED_ADMIN
router.use(requireAuth, requireRoles(ROLES.SYSTEM_ADMIN, ROLES.CED_ADMIN));

router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.get('/academic-years', adminController.getAcademicYears);
router.post('/academic-years', adminController.createAcademicYear);
router.put('/academic-years/campaign', adminController.updateCampaign);

export default router;
