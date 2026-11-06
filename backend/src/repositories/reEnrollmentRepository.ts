import { db } from './database';
import { ReEnrollmentEntity } from '../types';

export const reEnrollmentRepository = {
  findAll(): ReEnrollmentEntity[] {
    return [...db.get('reEnrollments')];
  },

  findById(id: string): ReEnrollmentEntity | undefined {
    return db.get('reEnrollments').find((r) => r.id === id);
  },

  findByStudent(studentId: string): ReEnrollmentEntity[] {
    return db.get('reEnrollments').filter((r) => r.studentId === studentId);
  },

  findBySupervisor(supervisorId: string): ReEnrollmentEntity[] {
    return db.get('reEnrollments').filter((r) => r.supervisorId === supervisorId);
  },

  create(reEnrollment: ReEnrollmentEntity): ReEnrollmentEntity {
    db.get('reEnrollments').unshift(reEnrollment);
    db.save();
    return reEnrollment;
  },

  update(id: string, updates: Partial<ReEnrollmentEntity>): ReEnrollmentEntity | undefined {
    const item = this.findById(id);
    if (!item) return undefined;

    Object.assign(item, updates, { updatedAt: new Date().toISOString().split('T')[0] });
    db.save();
    return item;
  },

  delete(id: string): boolean {
    const list = db.get('reEnrollments');
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return false;

    list.splice(index, 1);
    db.save();
    return true;
  },
};
