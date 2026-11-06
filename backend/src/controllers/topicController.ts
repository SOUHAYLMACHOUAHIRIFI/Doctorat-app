import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { topicService } from '../services/topicService';
import { createTopicSchema, updateTopicSchema, reviewTopicStructureSchema } from '../validators/topicValidator';

export const topicController = {
  getTopics(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const topics = topicService.getTopics(req.user);
      res.json({
        success: true,
        count: topics.length,
        topics,
      });
    } catch (err) {
      next(err);
    }
  },

  getTopicById(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const topic = topicService.getTopicById(req.params.id);
      res.json({
        success: true,
        topic,
      });
    } catch (err) {
      next(err);
    }
  },

  createTopic(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const validated = createTopicSchema.parse(req.body);
      const newTopic = topicService.createTopic(req.user, validated);

      res.status(201).json({
        success: true,
        message: 'Sujet de recherche créé avec succès et soumis pour validation à la structure.',
        topic: newTopic,
      });
    } catch (err) {
      next(err);
    }
  },

  updateTopic(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const validated = updateTopicSchema.parse(req.body);
      const updated = topicService.updateTopic(req.user, req.params.id, validated);

      res.json({
        success: true,
        message: 'Sujet de recherche mis à jour.',
        topic: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  reviewTopicStructure(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
      }

      const validated = reviewTopicStructureSchema.parse(req.body);
      const updated = topicService.reviewTopicStructure(
        req.user,
        req.params.id,
        validated.decision,
        validated.feedback
      );

      res.json({
        success: true,
        message: `Sujet ${validated.decision === 'APPROVE' ? 'approuvé' : 'rejeté'} avec succès.`,
        topic: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};
