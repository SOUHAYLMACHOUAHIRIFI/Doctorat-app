import { db } from './database';
import { ApplicationEntity } from '../types';

export const applicationRepository = {
  findAll(): ApplicationEntity[] {
    return [...db.get('applications')];
  },

  findById(id: string): ApplicationEntity | undefined {
    return db.get('applications').find((a) => a.id === id);
  },

  findByCandidate(candidateId: string): ApplicationEntity[] {
    return db.get('applications').filter((a) => a.candidateId === candidateId);
  },

  findBySupervisor(supervisorId: string): ApplicationEntity[] {
    return db.get('applications').filter((a) => a.supervisorId === supervisorId);
  },

  findByLaboratory(laboratoryName: string): ApplicationEntity[] {
    const normalized = laboratoryName.toLowerCase();
    return db.get('applications').filter((a) => a.laboratory.toLowerCase().includes(normalized));
  },

  findByTopic(topicId: string): ApplicationEntity[] {
    return db.get('applications').filter((a) => a.topicId === topicId);
  },

  create(app: ApplicationEntity): ApplicationEntity {
    db.get('applications').unshift(app);
    db.save();
    return app;
  },

  update(id: string, updates: Partial<ApplicationEntity>): ApplicationEntity | undefined {
    const app = this.findById(id);
    if (!app) return undefined;

    Object.assign(app, updates, { updatedAt: new Date().toISOString().split('T')[0] });
    db.save();
    return app;
  },

  delete(id: string): boolean {
    const apps = db.get('applications');
    const index = apps.findIndex((a) => a.id === id);
    if (index === -1) return false;

    apps.splice(index, 1);
    db.save();
    return true;
  },
};
