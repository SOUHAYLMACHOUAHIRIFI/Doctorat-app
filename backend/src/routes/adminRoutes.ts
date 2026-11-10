import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rbacMiddleware';
import { ROLES } from '../config/constants';

const router = Router();

// Restricted to SYSTEM_ADMIN, ADMIN, CED_ADMIN, CED
router.use(requireAuth, requireRoles(ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.CED_ADMIN, ROLES.CED));

// User Management CRUD
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.post('/users/:id/reset-password', adminController.resetUserPassword);
router.delete('/users/:id', adminController.deleteUser);

// RBAC Matrix & Access Control
router.get('/rbac-matrix', adminController.getRbacMatrix);

// General Settings & Campaign Calendars
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Global Supervision & Exports
router.get('/overview', adminController.getDataOverview);
router.get('/export', adminController.exportData);

// Academic Years Management
router.get('/academic-years', adminController.getAcademicYears);
router.post('/academic-years', adminController.createAcademicYear);
router.put('/academic-years/campaign', adminController.updateCampaign);

export default router;
