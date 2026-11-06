import { db } from './database';
import { AuditLogEntity } from '../types';

export const auditRepository = {
  findAll(limit = 100): AuditLogEntity[] {
    return db.get('auditLogs').slice(0, limit);
  },

  create(log: Omit<AuditLogEntity, 'id' | 'createdAt'>): AuditLogEntity {
    const entry: AuditLogEntity = {
      ...log,
      id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    db.get('auditLogs').unshift(entry);
    db.save();
    return entry;
  },
};
