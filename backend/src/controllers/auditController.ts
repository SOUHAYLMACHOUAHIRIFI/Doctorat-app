import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { auditService } from '../services/auditService';

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
