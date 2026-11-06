import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { auditService } from '../services/auditService';
import { db } from '../repositories/database';
import { userRepository } from '../repositories/userRepository';
import { ROLES } from '../config/constants';

export const auditController = {
  getLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const limit = parseInt((req.query.limit as string) || '100', 10);
      const logs = auditService.getAll(limit);

      res.json({
        success: true,
        count: logs.length,
        logs,
      });
    } catch (err) {
      next(err);
    }
  },
};

export const adminController = {
  getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const users = userRepository.findAll();
      res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (err) {
      next(err);
    }
  },

  updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const targetUserId = req.params.id;
      const { role, isActive } = req.body;

      if (!Object.values(ROLES).includes(role)) {
        res.status(400).json({ success: false, message: 'Rôle non valide.' });
        return;
      }

      const updated = userRepository.update(targetUserId, { role, isActive });
      if (!updated) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      auditService.log(
        req.user!.email,
        req.user!.role,
        'UPDATE_USER_ROLE',
        'User',
        targetUserId,
        { newRole: role, isActive },
        req.user!.id
      );

      res.json({
        success: true,
        message: 'Rôle utilisateur mis à jour.',
        user: userRepository.toSafeUser(updated),
      });
    } catch (err) {
      next(err);
    }
  },

  getAcademicYears(req: AuthenticatedRequest, res: Response): void {
    const years = db.get('academicYears');
    res.json({
      success: true,
      academicYears: years,
    });
  },

  updateCampaign(req: AuthenticatedRequest, res: Response): void {
    const { id, campaignOpen, campaignDeadline } = req.body;
    const year = db.get('academicYears').find((y) => y.id === id);
    if (!year) {
      res.status(404).json({ success: false, message: 'Année universitaire non trouvée.' });
      return;
    }

    if (campaignOpen !== undefined) year.campaignOpen = campaignOpen;
    if (campaignDeadline !== undefined) year.campaignDeadline = campaignDeadline;
    db.save();

    res.json({
      success: true,
      message: 'Campagne universitaire mise à jour.',
      academicYear: year,
    });
  },

  createAcademicYear(req: AuthenticatedRequest, res: Response): void {
    const { code, isCurrent, campaignOpen, campaignDeadline } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, message: 'Le code de l’année universitaire est obligatoire (ex: 2027-2028).' });
      return;
    }

    const years = db.get('academicYears');
    if (years.some((y) => y.code === code.trim())) {
      res.status(400).json({ success: false, message: 'Cette année universitaire existe déjà.' });
      return;
    }

    if (isCurrent) {
      years.forEach((y) => (y.isCurrent = false));
    }

    const newYear = {
      id: `ay-${Date.now().toString(36)}`,
      code: code.trim(),
      isCurrent: !!isCurrent,
      campaignOpen: campaignOpen !== undefined ? !!campaignOpen : true,
      campaignDeadline: campaignDeadline || undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    years.push(newYear);
    db.save();

    res.status(201).json({
      success: true,
      message: `Année universitaire ${newYear.code} créée avec succès.`,
      academicYear: newYear,
    });
  },
};
