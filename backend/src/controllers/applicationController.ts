import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { applicationService } from '../services/applicationService';
import {
  applyTopicSchema,
  evaluateApplicationSupervisorSchema,
  validateApplicationStructureSchema,
} from '../validators/applicationValidator';
import { ROLES } from '../config/constants';

export const applicationController = {
  getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const apps = applicationService.getApplications(req.user);
      res.json({
        success: true,
        count: apps.length,
        applications: apps,
      });
    } catch (err) {
      next(err);
    }
  },

  getApplicationById(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const app = applicationService.getApplicationById(req.user, req.params.id);
      res.json({
        success: true,
        application: app,
      });
    } catch (err) {
      next(err);
    }
  },

  submitApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      if (req.user.role !== ROLES.CANDIDATE) {
        res.status(403).json({
          success: false,
          message: 'Seuls les utilisateurs au statut CANDIDATE peuvent déposer une candidature.',
        });
        return;
      }

      const validated = applyTopicSchema.parse(req.body);
      try {
        const app = applicationService.submitApplication(req.user, validated);
        res.status(201).json({
          success: true,
          message: 'Candidature déposée avec succès. Vos 4 pièces justificatives y sont associées.',
          application: app,
        });
      } catch (err: any) {
        res.status(400).json({
          success: false,
          message: err.message || 'Erreur lors du dépôt de candidature.',
        });
      }
    } catch (err) {
      next(err);
    }
  },

  deleteApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      applicationService.deleteApplication(req.user, req.params.id);
      res.json({
        success: true,
        message: 'Candidature retirée avec succès.',
      });
    } catch (err) {
      next(err);
    }
  },

  evaluateApplicationSupervisor(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const validated = evaluateApplicationSupervisorSchema.parse(req.body);
      const updated = applicationService.evaluateApplicationSupervisor(
        req.user,
        req.params.id,
        validated.decision,
        validated.grade,
        validated.feedback
      );

      res.json({
        success: true,
        message: `Évaluation enregistrée : avis ${validated.decision}.`,
        application: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  validateApplicationStructure(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const validated = validateApplicationStructureSchema.parse(req.body);
      const updated = applicationService.validateApplicationStructure(
        req.user,
        req.params.id,
        validated.decision,
        validated.feedback
      );

      res.json({
        success: true,
        message: `Décision de structure enregistrée : ${validated.decision === 'VALIDE' ? 'Admission prononcée' : 'Candidature rejetée'}.`,
        application: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  decideFinalAdmission(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const { decision, feedback, rank } = req.body;
      if (!decision || !['ADMIS', 'LISTE_ATTENTE', 'REFUSE'].includes(decision)) {
        res.status(400).json({ success: false, message: 'Décision invalide (ADMIS, LISTE_ATTENTE ou REFUSE requise).' });
        return;
      }

      const updated = applicationService.decideFinalAdmission(
        req.user,
        req.params.id,
        decision,
        feedback || 'Décision officielle de la commission doctorale CED.',
        rank ? Number(rank) : undefined
      );

      res.json({
        success: true,
        message: `Résultat officiel notifié : ${decision === 'ADMIS' ? 'Admis en liste principale' : decision === 'LISTE_ATTENTE' ? 'Inscrit sur liste d’attente' : 'Candidature non retenue'}.`,
        application: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  promoteWaitlist(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const updated = applicationService.promoteFromWaitlist(req.user, req.params.id);
      res.json({
        success: true,
        message: 'Candidat promu avec succès de la Liste d’Attente vers la Liste Principale (Admission validée).',
        application: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};
