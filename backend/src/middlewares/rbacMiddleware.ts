import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { RoleType } from '../config/constants';

// Normalize user role and allowed roles for seamless RBAC across synonyms
function roleMatches(userRole: string, allowedRoles: RoleType[]): boolean {
  const normalizedUserRole = userRole.toUpperCase();
  const normalizedAllowed = allowedRoles.map((r) => String(r).toUpperCase());

  // Direct match
  if (normalizedAllowed.includes(normalizedUserRole)) {
    return true;
  }

  // Admin hierarchy (SYSTEM_ADMIN or ADMIN has full super-admin access)
  const isSuperAdmin = normalizedUserRole === 'ADMIN' || normalizedUserRole === 'SYSTEM_ADMIN';
  if (isSuperAdmin) {
    return true;
  }

  // CED / Structure Director equivalence
  const isStructureDirectorUser =
    normalizedUserRole === 'CED' ||
    normalizedUserRole === 'CED_ADMIN' ||
    normalizedUserRole === 'STRUCTURE_DIRECTOR' ||
    normalizedUserRole === 'DIRECTEUR_STRUCTURE';

  const acceptsStructureDirector = normalizedAllowed.some(
    (r) =>
      r === 'CED' ||
      r === 'CED_ADMIN' ||
      r === 'STRUCTURE_DIRECTOR' ||
      r === 'DIRECTEUR_STRUCTURE'
  );

  if (isStructureDirectorUser && acceptsStructureDirector) {
    return true;
  }

  // Supervisor equivalence
  const isSupervisorUser =
    normalizedUserRole === 'SUPERVISOR' || normalizedUserRole === 'DIRECTEUR_THESE';
  const acceptsSupervisor = normalizedAllowed.some(
    (r) => r === 'SUPERVISOR' || r === 'DIRECTEUR_THESE'
  );
  if (isSupervisorUser && acceptsSupervisor) {
    return true;
  }

  // Candidate equivalence
  const isCandidateUser =
    normalizedUserRole === 'CANDIDATE' ||
    normalizedUserRole === 'CANDIDAT' ||
    normalizedUserRole === 'DOCTORANT';
  const acceptsCandidate = normalizedAllowed.some(
    (r) => r === 'CANDIDATE' || r === 'CANDIDAT' || r === 'DOCTORANT'
  );
  if (isCandidateUser && acceptsCandidate) {
    return true;
  }

  return false;
}

export const requireRoles = (...allowedRoles: RoleType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise.',
      });
      return;
    }

    if (!roleMatches(req.user.role, allowedRoles)) {
      res.status(403).json({
        success: false,
        message: `Accès interdit : Votre rôle (${req.user.role}) n’a pas les privilèges requis pour exécuter cette opération.`,
      });
      return;
    }

    next();
  };
};
