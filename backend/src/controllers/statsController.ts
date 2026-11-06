import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { db } from '../repositories/database';
import { ROLES, APPLICATION_STATUS } from '../config/constants';

export const statsController = {
  getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const users = db.get('users');
      const candidates = db.get('candidates');
      const doctoralStudents = db.get('doctoralStudents');
      const topics = db.get('topics');
      const applications = db.get('applications');
      const reEnrollments = db.get('reEnrollments');
      const documents = db.get('documents');

      // Aggregate statistics by role and status
      const totalCandidates = candidates.length;
      const totalStudents = doctoralStudents.length;
      const totalSupervisors = users.filter((u) => u.role === ROLES.SUPERVISOR).length;
      const totalTopics = topics.length;
      const validatedTopics = topics.filter((t) => t.status === 'VALIDE').length;
      const pendingTopics = topics.filter((t) => t.status === 'EN_EXAMEN_STRUCTURE' || t.status === 'PROPOSE').length;

      const totalApplications = applications.length;
      const admittedApplications = applications.filter((a) => a.status === APPLICATION_STATUS.ADMIS).length;
      const favorableApplications = applications.filter((a) => a.status === APPLICATION_STATUS.AVIS_FAVORABLE).length;
      const pendingApplications = applications.filter((a) => a.status === APPLICATION_STATUS.SOUMIS).length;

      const totalDocuments = documents.length;
      const validatedDocuments = documents.filter((d) => d.status === 'VALIDE').length;

      res.json({
        success: true,
        stats: {
          candidates: totalCandidates,
          doctoralStudents: totalStudents,
          supervisors: totalSupervisors,
          topics: {
            total: totalTopics,
            validated: validatedTopics,
            pending: pendingTopics,
          },
          applications: {
            total: totalApplications,
            admitted: admittedApplications,
            favorable: favorableApplications,
            pending: pendingApplications,
          },
          reEnrollments: {
            total: reEnrollments.length,
            validated: reEnrollments.filter((r) => r.status === 'VALIDE_CED').length,
          },
          documents: {
            total: totalDocuments,
            validated: validatedDocuments,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
