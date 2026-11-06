import { Router } from 'express';
import authRoutes from './authRoutes';
import topicRoutes from './topicRoutes';
import documentRoutes from './documentRoutes';
import applicationRoutes from './applicationRoutes';
import reEnrollmentRoutes from './reEnrollmentRoutes';
import notificationRoutes from './notificationRoutes';
import statsRoutes from './statsRoutes';
import auditRoutes from './auditRoutes';
import adminRoutes from './adminRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/topics', topicRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/re-enrollments', reEnrollmentRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/stats', statsRoutes);
apiRouter.use('/audit', auditRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
