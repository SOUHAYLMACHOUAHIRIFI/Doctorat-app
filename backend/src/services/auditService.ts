import { auditRepository } from '../repositories/auditRepository';
import { AuditLogEntity } from '../types';

export const auditService = {
  log(
    userEmail: string,
    userRole: string,
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, any>,
    userId?: string,
    ipAddress?: string
  ): AuditLogEntity {
    return auditRepository.create({
      userId,
      userEmail,
      userRole,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
    });
  },

  getAll(limit = 100): AuditLogEntity[] {
    return auditRepository.findAll(limit);
  },
};
