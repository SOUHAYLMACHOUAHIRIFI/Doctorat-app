import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { documentService } from '../services/documentService';
import { uploadDocumentSchema, reviewDocumentSchema } from '../validators/documentValidator';
import { ROLES } from '../config/constants';

export const documentController = {
  getMyDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const docs = documentService.getCandidateDocuments(req.user.id);
      const isComplet = documentService.isDossierComplet(req.user.id);

      res.json({
        success: true,
        count: docs.length,
        isDossierComplet: isComplet,
        documents: docs,
      });
    } catch (err) {
      next(err);
    }
  },

  getCandidateDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const candidateUserId = req.params.candidateUserId;
      const docs = documentService.getCandidateDocuments(candidateUserId);

      res.json({
        success: true,
        count: docs.length,
        documents: docs,
      });
    } catch (err) {
      next(err);
    }
  },

  uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const validated = uploadDocumentSchema.parse(req.body);
      const doc = documentService.uploadDocument(req.user, validated);

      res.status(201).json({
        success: true,
        message: `Pièce justificative téléversée avec succès (${doc.title}). Statut : DÉPOSÉ`,
        document: doc,
      });
    } catch (err) {
      next(err);
    }
  },

  reviewDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      // Check role permissions: must be SUPERVISOR, STRUCTURE_DIRECTOR, CED_ADMIN, or SYSTEM_ADMIN
      const allowedRoles = [
        ROLES.SUPERVISOR,
        ROLES.STRUCTURE_DIRECTOR,
        ROLES.CED_ADMIN,
        ROLES.SYSTEM_ADMIN,
      ];
      if (!allowedRoles.includes(req.user.role as any)) {
        res.status(403).json({
          success: false,
          message: 'Seuls les évaluateurs habilités peuvent valider ou rejeter un document.',
        });
        return;
      }

      const validated = reviewDocumentSchema.parse(req.body);
      const updated = documentService.reviewDocument(
        req.user,
        req.params.id,
        validated.status,
        validated.reason
      );

      res.json({
        success: true,
        message: `Document mis à jour avec le statut : ${validated.status}`,
        document: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      documentService.deleteDocument(req.user, req.params.id);
      res.json({
        success: true,
        message: 'Pièce justificative retirée.',
      });
    } catch (err) {
      next(err);
    }
  },
};
