import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { auditService } from '../services/auditService';
import { db } from '../repositories/database';
import { userRepository } from '../repositories/userRepository';
import { ROLES, USMBA_ESTABLISHMENTS } from '../config/constants';
import { UserEntity, PlatformSettingsEntity } from '../types';

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

export const adminController = {
  // 1. User Management (CRUD)
  getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const users = userRepository.findAll();
      res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (err) {
      next(err);
    }
  },

  createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        cin,
        phone,
        role,
        establishment,
        laboratory,
      } = req.body;

      if (!email || !password || !firstName || !lastName || !cin || !role) {
        res.status(400).json({
          success: false,
          message: 'Champs requis manquants (email, mot de passe, prénom, nom, CIN, rôle).',
        });
        return;
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const normalizedCin = String(cin).trim().toUpperCase();

      if (userRepository.findByEmail(normalizedEmail)) {
        res.status(400).json({
          success: false,
          message: 'Une adresse email identique est déjà utilisée par un compte.',
        });
        return;
      }

      if (userRepository.findByCin(normalizedCin)) {
        res.status(400).json({
          success: false,
          message: 'Le numéro de CIN est déjà associé à un autre compte.',
        });
        return;
      }

      const passwordHash = bcrypt.hashSync(String(password).trim(), 10);
      const now = new Date().toISOString().split('T')[0];

      const newUser: UserEntity = {
        id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        email: normalizedEmail,
        passwordHash,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        cin: normalizedCin,
        phone: phone ? String(phone).trim() : undefined,
        establishment: establishment ? String(establishment).trim() : 'FST Fès',
        laboratory: laboratory ? String(laboratory).trim() : undefined,
        role,
        isActive: true,
        isEmailVerified: true,
        createdAt: now,
        updatedAt: now,
      };

      userRepository.create(newUser);

      // Create linked supervisor or candidate profile if appropriate
      if (role === 'SUPERVISOR' || role === 'directeur_these') {
        const supervisors = db.get('supervisors');
        supervisors.push({
          id: `sup-${Date.now().toString(36)}`,
          userId: newUser.id,
          grade: 'Professeur de l’Enseignement Supérieur (PES)',
          specialty: 'Recherche Doctorale',
          structureId: 'struct-lisac',
          createdAt: now,
          updatedAt: now,
        });
        db.save();
      } else if (role === 'CANDIDATE' || role === 'candidat') {
        const candidates = db.get('candidates');
        candidates.push({
          id: `cand-${Date.now().toString(36)}`,
          userId: newUser.id,
          etablissementOrigine: newUser.establishment || 'FST Fès',
          diplomeOrigine: 'Master de Recherche',
          createdAt: now,
          updatedAt: now,
        });
        db.save();
      }

      auditService.log(
        req.user!.email,
        req.user!.role,
        'ADMIN_CREATE_USER',
        'User',
        newUser.id,
        { email: newUser.email, role: newUser.role, fullName: `${newUser.firstName} ${newUser.lastName}` },
        req.user!.id
      );

      res.status(201).json({
        success: true,
        message: `Compte utilisateur créé avec succès pour ${newUser.firstName} ${newUser.lastName}.`,
        user: userRepository.toSafeUser(newUser),
      });
    } catch (err) {
      next(err);
    }
  },

  updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const targetUserId = req.params.id;
      const {
        firstName,
        lastName,
        email,
        cin,
        phone,
        role,
        establishment,
        laboratory,
        isActive,
      } = req.body;

      const existing = userRepository.findById(targetUserId);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      const updates: Partial<UserEntity> = {};
      if (firstName !== undefined) updates.firstName = String(firstName).trim();
      if (lastName !== undefined) updates.lastName = String(lastName).trim();
      if (email !== undefined) updates.email = String(email).trim().toLowerCase();
      if (cin !== undefined) updates.cin = String(cin).trim().toUpperCase();
      if (phone !== undefined) updates.phone = String(phone).trim();
      if (establishment !== undefined) updates.establishment = String(establishment).trim();
      if (laboratory !== undefined) updates.laboratory = String(laboratory).trim();
      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) updates.isActive = Boolean(isActive);

      const updated = userRepository.update(targetUserId, updates);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      auditService.log(
        req.user!.email,
        req.user!.role,
        'ADMIN_UPDATE_USER',
        'User',
        targetUserId,
        { updates },
        req.user!.id
      );

      res.json({
        success: true,
        message: 'Informations utilisateur mises à jour.',
        user: userRepository.toSafeUser(updated),
      });
    } catch (err) {
      next(err);
    }
  },

  updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const targetUserId = req.params.id;
      const { role, isActive } = req.body;

      if (!Object.values(ROLES).includes(role)) {
        res.status(400).json({ success: false, message: 'Rôle non valide.' });
        return;
      }

      const updated = userRepository.update(targetUserId, { role, isActive });
      if (!updated) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      auditService.log(
        req.user!.email,
        req.user!.role,
        'UPDATE_USER_ROLE',
        'User',
        targetUserId,
        { newRole: role, isActive },
        req.user!.id
      );

      res.json({
        success: true,
        message: 'Rôle utilisateur mis à jour.',
        user: userRepository.toSafeUser(updated),
      });
    } catch (err) {
      next(err);
    }
  },

  resetUserPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const targetUserId = req.params.id;
      const { newPassword } = req.body;

      const user = userRepository.findById(targetUserId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      const passwordToSet = newPassword && String(newPassword).trim() !== '' ? String(newPassword).trim() : 'usmba2026';
      const passwordHash = bcrypt.hashSync(passwordToSet, 10);

      userRepository.update(targetUserId, { passwordHash });

      auditService.log(
        req.user!.email,
        req.user!.role,
        'ADMIN_RESET_PASSWORD',
        'User',
        targetUserId,
        { targetEmail: user.email },
        req.user!.id
      );

      res.json({
        success: true,
        message: `Mot de passe réinitialisé avec succès pour ${user.email} (nouveau mot de passe : "${passwordToSet}").`,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const targetUserId = req.params.id;
      if (targetUserId === req.user!.id) {
        res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte.' });
        return;
      }

      const targetUser = userRepository.findById(targetUserId);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      // Soft delete: deactivate user
      userRepository.update(targetUserId, { isActive: false });

      auditService.log(
        req.user!.email,
        req.user!.role,
        'ADMIN_DEACTIVATE_USER',
        'User',
        targetUserId,
        { email: targetUser.email },
        req.user!.id
      );

      res.json({
        success: true,
        message: `Compte utilisateur désactivé avec succès (${targetUser.email}).`,
      });
    } catch (err) {
      next(err);
    }
  },

  // 2. Control Access & RBAC Matrix
  getRbacMatrix(req: AuthenticatedRequest, res: Response): void {
    const matrix = [
      {
        role: 'ADMIN',
        roleLabel: 'Administrateur de la Plateforme (ADMIN / SYSTEM_ADMIN)',
        description: 'Supervision globale, gouvernance technique, gestion des utilisateurs, audit de sécurité et paramétrage du système.',
        permissions: [
          { code: 'users:manage', label: 'Gestion complète des utilisateurs (Création, Édition, Suspension, Rôles)', granted: true },
          { code: 'rbac:configure', label: 'Contrôle des accès et configuration des droits RBAC', granted: true },
          { code: 'data:supervise', label: 'Supervision des flux de données, statistiques globales et exports', granted: true },
          { code: 'settings:configure', label: 'Paramétrage des règles générales, dates limites et campagnes', granted: true },
          { code: 'audit:inspect', label: 'Consultation intégrale des journaux d’audit infalsifiables', granted: true },
        ],
      },
      {
        role: 'CED',
        roleLabel: 'Directeur de Structure & CED (CED / STRUCTURE_DIRECTOR)',
        description: 'Supervision des admissions doctorales au niveau de la structure, validation officielle des sujets et notification des résultats.',
        permissions: [
          { code: 'topics:consult_all', label: 'Consultation de l’ensemble des sujets et des candidatures associées', granted: true },
          { code: 'topics:validate_sign', label: 'Validation et signature officielle des sujets de recherche', granted: true },
          { code: 'candidates:dossier_track', label: 'Suivi des dossiers complets, pièces justificatives et avis des encadrants', granted: true },
          { code: 'results:notify', label: 'Notification des résultats définitifs d’admission ou de rejet', granted: true },
          { code: 'waitlist:manage', label: 'Gestion des délais et administration des listes d’attente', granted: true },
        ],
      },
      {
        role: 'SUPERVISOR',
        roleLabel: 'Directeur de Thèse (SUPERVISOR)',
        description: 'Proposition des sujets de recherche, évaluation pédagogique des candidats et suivi des doctorants encadrés.',
        permissions: [
          { code: 'topics:propose', label: 'Dépôt et mise à jour de propositions de sujets de thèse', granted: true },
          { code: 'applications:evaluate', label: 'Évaluation pédagogique (Avis favorable, note, correction, avis défavorable)', granted: true },
          { code: 'reenrollments:review', label: 'Validation annuelle des rapports d’activité des doctorants', granted: true },
        ],
      },
      {
        role: 'CANDIDATE',
        roleLabel: 'Candidat au Doctorat (CANDIDATE)',
        description: 'Constitution du profil, téléversement des 4 pièces justificatives certifiées et postulation aux sujets ouverts.',
        permissions: [
          { code: 'docs:upload_4_pieces', label: 'Dépôt des 4 pièces justificatives scannées (Bac, Notes, Diplômes, CIN)', granted: true },
          { code: 'applications:submit', label: 'Dépôt de candidatures aux sujets de thèse (max 3 candidatures)', granted: true },
          { code: 'status:track', label: 'Suivi de l’avancement et réception des notifications de décision', granted: true },
        ],
      },
      {
        role: 'DOCTORANT',
        roleLabel: 'Doctorant en cours de cycle (DOCTORANT)',
        description: 'Doctorant officiellement inscrit en thèse, gestion des réinscriptions annuelles et rapports d’avancement.',
        permissions: [
          { code: 'thesis:track', label: 'Consultation de son dossier de thèse et son numéro CNE/Massar', granted: true },
          { code: 'reenrollment:submit', label: 'Soumission annuelle du rapport d’activité pour réinscription', granted: true },
        ],
      },
    ];

    res.json({
      success: true,
      matrix,
    });
  },

  // 3. Platform Settings & Campaign configuration
  getSettings(req: AuthenticatedRequest, res: Response): void {
    const settings = (db.get('settings') as PlatformSettingsEntity) || {
      platformName: 'GCD USMBA — Gestion du Cycle Doctoral',
      universityName: 'Université Sidi Mohamed Ben Abdellah de Fès',
      institutionalEmailDomain: '@usmba.ac.ma',
      maxApplicationsPerCandidate: 3,
      enableDocumentCameraScan: true,
      campaignStartDate: '2026-09-01',
      campaignEndDate: '2026-11-30',
      reEnrollmentDeadline: '2026-12-15',
      maintenanceMode: false,
      autoNotifyOnStatusChange: true,
    };

    res.json({
      success: true,
      settings,
      establishments: USMBA_ESTABLISHMENTS,
    });
  },

  updateSettings(req: AuthenticatedRequest, res: Response): void {
    const updates = req.body;
    let settings = db.get('settings') as PlatformSettingsEntity;
    if (!settings) {
      settings = {} as PlatformSettingsEntity;
    }

    Object.assign(settings, updates);
    (db as any).data.settings = settings;
    db.save();

    auditService.log(
      req.user!.email,
      req.user!.role,
      'ADMIN_UPDATE_SETTINGS',
      'PlatformSettings',
      'global',
      { updates },
      req.user!.id
    );

    res.json({
      success: true,
      message: 'Paramètres généraux du système mis à jour avec succès.',
      settings,
    });
  },

  // 4. Global Data Supervision & Metrics
  getDataOverview(req: AuthenticatedRequest, res: Response): void {
    const users = db.get('users');
    const topics = db.get('topics');
    const applications = db.get('applications');
    const documents = db.get('documents');
    const reEnrollments = db.get('reEnrollments');
    const auditLogs = db.get('auditLogs');

    const usersByRole = users.reduce((acc: Record<string, number>, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    const topicsByStatus = topics.reduce((acc: Record<string, number>, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    const applicationsByStatus = applications.reduce((acc: Record<string, number>, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    const establishmentStats = USMBA_ESTABLISHMENTS.map((est) => {
      const code = est.split(' ')[0];
      return {
        establishment: est,
        shortCode: code,
        topicsCount: topics.filter((t) => t.establishment.includes(code)).length,
        applicationsCount: applications.filter((a) => a.establishment.includes(code)).length,
      };
    });

    res.json({
      success: true,
      overview: {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.isActive).length,
        usersByRole,
        totalTopics: topics.length,
        topicsByStatus,
        totalApplications: applications.length,
        applicationsByStatus,
        totalDocuments: documents.length,
        totalReEnrollments: reEnrollments.length,
        totalAuditLogs: auditLogs.length,
        establishmentStats,
      },
    });
  },

  // 5. Export Data
  exportData(req: AuthenticatedRequest, res: Response): void {
    const applications = db.get('applications');
    const admittedApplications = applications.filter(
      (a) => a.status === 'ADMIS' || a.status === 'CED_APPROVED' || a.status === 'ACCEPTED'
    );
    const topics = db.get('topics');
    const users = userRepository.findAll();

    auditService.log(
      req.user!.email,
      req.user!.role,
      'ADMIN_EXPORT_DATA',
      'System',
      'export',
      { countAdmitted: admittedApplications.length, countTotal: applications.length },
      req.user!.id
    );

    res.json({
      success: true,
      exportTimestamp: new Date().toISOString(),
      admittedCandidates: admittedApplications.map((a) => ({
        candidat: a.candidateName,
        cin: a.candidateCin,
        email: a.candidateEmail,
        etablissement: a.establishment,
        laboratoire: a.laboratory,
        sujet: a.topicTitle,
        directeurThese: a.supervisorName,
        dateAdmission: a.updatedAt,
      })),
      allApplicationsCount: applications.length,
      topicsCount: topics.length,
      usersCount: users.length,
    });
  },

  getAcademicYears(req: AuthenticatedRequest, res: Response): void {
    const years = db.get('academicYears');
    res.json({
      success: true,
      academicYears: years,
    });
  },

  updateCampaign(req: AuthenticatedRequest, res: Response): void {
    const { id, campaignOpen, campaignDeadline } = req.body;
    const year = db.get('academicYears').find((y) => y.id === id);
    if (!year) {
      res.status(404).json({ success: false, message: 'Année universitaire non trouvée.' });
      return;
    }

    if (campaignOpen !== undefined) year.campaignOpen = campaignOpen;
    if (campaignDeadline !== undefined) year.campaignDeadline = campaignDeadline;
    db.save();

    res.json({
      success: true,
      message: 'Campagne universitaire mise à jour.',
      academicYear: year,
    });
  },

  createAcademicYear(req: AuthenticatedRequest, res: Response): void {
    const { code, isCurrent, campaignOpen, campaignDeadline } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, message: 'Le code de l’année universitaire est obligatoire (ex: 2027-2028).' });
      return;
    }

    const years = db.get('academicYears');
    if (years.some((y) => y.code === code.trim())) {
      res.status(400).json({ success: false, message: 'Cette année universitaire existe déjà.' });
      return;
    }

    if (isCurrent) {
      years.forEach((y) => (y.isCurrent = false));
    }

    const newYear = {
      id: `ay-${Date.now().toString(36)}`,
      code: code.trim(),
      isCurrent: !!isCurrent,
      campaignOpen: campaignOpen !== undefined ? !!campaignOpen : true,
      campaignDeadline: campaignDeadline || undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    years.push(newYear);
    db.save();

    res.status(201).json({
      success: true,
      message: `Année universitaire ${newYear.code} créée avec succès.`,
      academicYear: newYear,
    });
  },
};
