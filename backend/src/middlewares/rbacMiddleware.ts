import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { RoleType } from '../config/constants';

export const requireRoles = (...allowedRoles: RoleType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Accès interdit : Votre rôle (${req.user.role}) n’a pas les privilèges requis pour exécuter cette opération.`,
      });
      return;
    }

    next();
  };
};
