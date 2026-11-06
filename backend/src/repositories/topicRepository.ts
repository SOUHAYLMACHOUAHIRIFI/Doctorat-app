import { db } from './database';
import { ResearchTopicEntity } from '../types';

export const topicRepository = {
  findAll(): ResearchTopicEntity[] {
    return [...db.get('topics')];
  },

  findById(id: string): ResearchTopicEntity | undefined {
    return db.get('topics').find((t) => t.id === id);
  },

  findBySupervisor(supervisorId: string): ResearchTopicEntity[] {
    return db.get('topics').filter((t) => t.supervisorId === supervisorId);
  },

  findByLaboratory(laboratoryId: string): ResearchTopicEntity[] {
    return db.get('topics').filter((t) => t.laboratoryId === laboratoryId);
  },

  create(topic: ResearchTopicEntity): ResearchTopicEntity {
    db.get('topics').unshift(topic);
    db.save();
    return topic;
  },

  update(id: string, updates: Partial<ResearchTopicEntity>): ResearchTopicEntity | undefined {
    const topic = this.findById(id);
    if (!topic) return undefined;

    Object.assign(topic, updates, { updatedAt: new Date().toISOString().split('T')[0] });
    db.save();
    return topic;
  },

  delete(id: string): boolean {
    const topics = db.get('topics');
    const index = topics.findIndex((t) => t.id === id);
    if (index === -1) return false;

    topics.splice(index, 1);
    db.save();
    return true;
  },

  incrementSlotsTaken(id: string): void {
    const topic = this.findById(id);
    if (topic) {
      topic.slotsTaken = Math.min(topic.slotsTotal, topic.slotsTaken + 1);
      db.save();
    }
  },

  decrementSlotsTaken(id: string): void {
    const topic = this.findById(id);
    if (topic) {
      topic.slotsTaken = Math.max(0, topic.slotsTaken - 1);
      db.save();
    }
  },
};
