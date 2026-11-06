import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { reEnrollmentService } from '../services/reEnrollmentService';
import {
  createReEnrollmentSchema,
  evaluateReEnrollmentSupervisorSchema,
  validateReEnrollmentCedSchema,
} from '../validators/reEnrollmentValidator';

export const reEnrollmentController = {
  getReEnrollments(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const list = reEnrollmentService.getReEnrollments(req.user);
      res.json({
        success: true,
        count: list.length,
        reEnrollments: list,
      });
    } catch (err) {
      next(err);
    }
  },

  submitReEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const validated = createReEnrollmentSchema.parse(req.body);
      const re = reEnrollmentService.submitReEnrollment(req.user, validated);

      res.status(201).json({
        success: true,
        message: 'Demande de réinscription annuelle transmise à votre directeur de thèse.',
        reEnrollment: re,
      });
    } catch (err) {
      next(err);
    }
  },

  evaluateSupervisor(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const validated = evaluateReEnrollmentSupervisorSchema.parse(req.body);
      const updated = reEnrollmentService.evaluateReEnrollmentSupervisor(
        req.user,
        req.params.id,
        validated.status,
        validated.feedback
      );

      res.json({
        success: true,
        message: 'Avis du directeur de thèse enregistré.',
        reEnrollment: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  validateCed(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const validated = validateReEnrollmentCedSchema.parse(req.body);
      const updated = reEnrollmentService.validateReEnrollmentCed(
        req.user,
        req.params.id,
        validated.status,
        validated.feedback
      );

      res.json({
        success: true,
        message: 'Décision CED enregistrée.',
        reEnrollment: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};
