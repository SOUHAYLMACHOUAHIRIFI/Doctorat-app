import { applicationRepository } from '../repositories/applicationRepository';
import { topicRepository } from '../repositories/topicRepository';
import { documentRepository } from '../repositories/documentRepository';
import { db } from '../repositories/database';
import { ApplicationEntity, SafeUser, DoctoralStudentEntity } from '../types';
import { ROLES, APPLICATION_STEPS, APPLICATION_STATUS, MANDATORY_DOCUMENT_TYPES } from '../config/constants';
import { auditService } from './auditService';
import { notificationService } from './notificationService';

export const applicationService = {
  getApplications(user: SafeUser): ApplicationEntity[] {
    // 1. Candidate: strictly their own application
    if (user.role === ROLES.CANDIDATE) {
      const cand = db.get('candidates').find((c) => c.userId === user.id);
      if (!cand) return [];
      return applicationRepository.findByCandidate(cand.id);
    }

    // 2. Doctorant: their application history
    if (user.role === ROLES.DOCTORANT) {
      const cand = db.get('candidates').find((c) => c.userId === user.id);
      if (!cand) return [];
      return applicationRepository.findByCandidate(cand.id);
    }

    // 3. Supervisor: strictly applications for their own topics
    if (user.role === ROLES.SUPERVISOR) {
      const supervisors = db.get('supervisors');
      const sup = supervisors.find((s) => s.userId === user.id);
      if (!sup) return [];
      return applicationRepository.findBySupervisor(sup.id);
    }

    // 4. Structure Director: strictly applications belonging to their laboratory
    if (user.role === ROLES.STRUCTURE_DIRECTOR) {
      const structures = db.get('structures');
      const managed = structures.filter((s) => s.directorId === user.id || s.name === user.laboratory);
      if (managed.length === 0) {
        // Fallback to match by laboratory name
        return user.laboratory ? applicationRepository.findByLaboratory(user.laboratory) : [];
      }
      const allApps = applicationRepository.findAll();
      const managedLabNames = managed.map((m) => m.name.toLowerCase());
      return allApps.filter((a) => managedLabNames.some((lab) => a.laboratory.toLowerCase().includes(lab)));
    }

    // 5. CED_ADMIN and SYSTEM_ADMIN: all applications
    return applicationRepository.findAll();
  },

  getApplicationById(user: SafeUser, id: string): ApplicationEntity {
    const app = applicationRepository.findById(id);
    if (!app) throw new Error('Candidature non trouvée.');

    // Security scope checks
    if (user.role === ROLES.CANDIDATE || user.role === ROLES.DOCTORANT) {
      const cand = db.get('candidates').find((c) => c.userId === user.id);
      if (!cand || app.candidateId !== cand.id) {
        throw new Error('Accès interdit : Vous ne pouvez pas consulter le dossier d’un autre candidat.');
      }
    } else if (user.role === ROLES.SUPERVISOR) {
      const sup = db.get('supervisors').find((s) => s.userId === user.id);
      if (!sup || app.supervisorId !== sup.id) {
        throw new Error('Accès interdit : Vous ne pouvez consulter que les candidatures associées à vos propres sujets.');
      }
    }

    return app;
  },

  submitApplication(
    user: SafeUser,
    data: {
      topicId: string;
      notes?: string;
      motivationLetter?: string;
      profileDetails?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        cin?: string;
        etablissementOrigine?: string;
        diplomeOrigine?: string;
      };
    }
  ): ApplicationEntity {
    // 1. Get or create candidate record
    const candidates = db.get('candidates');
    let cand = candidates.find((c) => c.userId === user.id);

    if (!cand) {
      cand = {
        id: `cand-${Date.now().toString(36)}`,
        userId: user.id,
        etablissementOrigine: data.profileDetails?.etablissementOrigine || user.establishment || 'FST Fès',
        diplomeOrigine: data.profileDetails?.diplomeOrigine || 'Master de Recherche',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      candidates.push(cand);
      db.save();
    }

    // 2. Verify that all 4 mandatory documents have been uploaded!
    const candidateDocs = documentRepository.findByCandidate(cand.id);
    const hasAllDocs = MANDATORY_DOCUMENT_TYPES.every((typeCode) =>
      candidateDocs.some((d) => d.typeCode === typeCode)
    );

    if (!hasAllDocs) {
      throw new Error(
        'Dossier incomplet (Étape 1 obligatoire) : Vous devez impérativement téléverser vos 4 pièces justificatives (Baccalauréat, Relevés de notes, Diplôme et CIN) avant de pouvoir soumettre votre candidature.'
      );
    }

    // 3. Verify topic exists and is available
    const topic = topicRepository.findById(data.topicId);
    if (!topic) throw new Error('Sujet de recherche non trouvé.');
    if (topic.status !== 'VALIDE') throw new Error('Ce sujet n’est pas encore ouvert aux candidatures.');

    // 4. Prevent duplicate application to the same topic
    const existing = applicationRepository.findByCandidate(cand.id);
    if (existing.some((a) => a.topicId === data.topicId)) {
      throw new Error('Vous avez déjà déposé une candidature pour ce sujet de recherche.');
    }

    // Find supervisor name
    const supervisorEntity = db.get('supervisors').find((s) => s.id === topic.supervisorId);
    const supervisorUser = supervisorEntity ? db.get('users').find((u) => u.id === supervisorEntity.userId) : undefined;
    const supervisorName = supervisorUser ? `Pr. ${supervisorUser.firstName} ${supervisorUser.lastName}` : 'Directeur de Thèse';

    const now = new Date().toISOString().split('T')[0];

    const newApp: ApplicationEntity = {
      id: `app-${Date.now().toString(36)}`,
      candidateId: cand.id,
      candidateName: `${data.profileDetails?.firstName || user.firstName} ${data.profileDetails?.lastName || user.lastName}`,
      candidateEmail: user.email,
      candidateCin: data.profileDetails?.cin || user.cin,
      candidatePhone: data.profileDetails?.phone || user.phone,
      etablissementOrigine: data.profileDetails?.etablissementOrigine || cand.etablissementOrigine,
      diplomeOrigine: data.profileDetails?.diplomeOrigine || cand.diplomeOrigine,
      topicId: topic.id,
      topicTitle: topic.title,
      establishment: topic.establishment,
      laboratory: user.laboratory || 'Laboratoire de Recherche USMBA',
      supervisorId: topic.supervisorId,
      supervisorName,
      step: APPLICATION_STEPS.CANDIDATURE_SOUMISE,
      status: APPLICATION_STATUS.SOUMIS,
      notes: data.notes || 'Candidature formelle et 4 pièces justificatives certifiées.',
      motivationLetter: data.motivationLetter,
      submittedAt: now,
      updatedAt: now,
    };

    applicationRepository.create(newApp);
    topicRepository.incrementSlotsTaken(topic.id);

    // Link uploaded docs to this application
    candidateDocs.forEach((d) => {
      documentRepository.update(d.id, { applicationId: newApp.id });
    });

    auditService.log(
      user.email,
      user.role,
      'SUBMIT_APPLICATION',
      'Application',
      newApp.id,
      { topicId: topic.id, topicTitle: topic.title },
      user.id
    );

    // Notify supervisor
    if (supervisorEntity) {
      notificationService.notify(
        supervisorEntity.userId,
        'Nouvelle candidature reçue',
        `Le candidat ${newApp.candidateName} (${newApp.candidateCin}) a postulé à votre sujet "${topic.title}".`,
        'INFO',
        '/supervisor'
      );
    }

    return newApp;
  },

  deleteApplication(user: SafeUser, appId: string): boolean {
    const app = applicationRepository.findById(appId);
    if (!app) throw new Error('Candidature non trouvée.');

    const cand = db.get('candidates').find((c) => c.userId === user.id);
    if (!cand || app.candidateId !== cand.id) {
      throw new Error('Vous n’avez pas le droit de supprimer ce dossier de candidature.');
    }

    const success = applicationRepository.delete(appId);
    if (success) {
      topicRepository.decrementSlotsTaken(app.topicId);
      auditService.log(user.email, user.role, 'WITHDRAW_APPLICATION', 'Application', appId, {}, user.id);
    }
    return success;
  },

  evaluateApplicationSupervisor(
    supervisorUser: SafeUser,
    appId: string,
    decision: 'FAVORABLE' | 'DEFAVORABLE' | 'A_CORRIGER',
    grade?: string,
    feedback?: string
  ): ApplicationEntity {
    const app = applicationRepository.findById(appId);
    if (!app) throw new Error('Candidature non trouvée.');

    // Security check: must be the assigned supervisor
    const supervisor = db.get('supervisors').find((s) => s.userId === supervisorUser.id);
    if (!supervisor || supervisor.id !== app.supervisorId) {
      if (supervisorUser.role !== ROLES.SYSTEM_ADMIN && supervisorUser.role !== ROLES.CED_ADMIN) {
        throw new Error('Accès interdit : Seul le directeur de thèse assigné à ce sujet peut émettre une évaluation.');
      }
    }

    let nextStep = app.step;
    let nextStatus = app.status;

    if (decision === 'FAVORABLE') {
      nextStep = APPLICATION_STEPS.VALIDATION_STRUCTURE; // Step 5: Structure commission
      nextStatus = APPLICATION_STATUS.AVIS_FAVORABLE;
    } else if (decision === 'A_CORRIGER') {
      nextStatus = APPLICATION_STATUS.A_CORRIGER;
    } else {
      nextStatus = APPLICATION_STATUS.AVIS_DEFAVORABLE;
    }

    const updated = applicationRepository.update(appId, {
      step: nextStep,
      status: nextStatus,
      supervisorGrade: grade || app.supervisorGrade,
      supervisorFeedback: feedback?.trim(),
    });

    if (!updated) throw new Error('Erreur de mise à jour.');

    auditService.log(
      supervisorUser.email,
      supervisorUser.role,
      'EVALUATE_APPLICATION_SUPERVISOR',
      'Application',
      appId,
      { decision, grade, feedback },
      supervisorUser.id
    );

    // Notify candidate
    const candidateEntity = db.get('candidates').find((c) => c.id === app.candidateId);
    if (candidateEntity) {
      const candidateUser = db.get('users').find((u) => u.id === candidateEntity.userId);
      if (candidateUser) {
        notificationService.notify(
          candidateUser.id,
          `Avis émis par le directeur de thèse (${decision})`,
          `Votre encadrant a émis un avis "${decision}" sur votre candidature : ${feedback}`,
          decision === 'FAVORABLE' ? 'SUCCESS' : 'WARNING',
          '/candidat'
        );
      }
    }

    return updated;
  },

  validateApplicationStructure(
    directorUser: SafeUser,
    appId: string,
    decision: 'VALIDE' | 'REJETE',
    feedback: string
  ): ApplicationEntity {
    const app = applicationRepository.findById(appId);
    if (!app) throw new Error('Candidature non trouvée.');

    let nextStep = APPLICATION_STEPS.DECISION_FINALE;
    let nextStatus = decision === 'VALIDE' ? APPLICATION_STATUS.ADMIS : APPLICATION_STATUS.REFUSE;

    const updated = applicationRepository.update(appId, {
      step: nextStep,
      status: nextStatus,
      structureFeedback: feedback.trim(),
    });

    if (!updated) throw new Error('Erreur de mise à jour.');

    // If ADMIS: promote candidate to DOCTORANT!
    if (decision === 'VALIDE') {
      const candidateEntity = db.get('candidates').find((c) => c.id === app.candidateId);
      if (candidateEntity) {
        // Update user role to DOCTORANT
        const user = db.get('users').find((u) => u.id === candidateEntity.userId);
        if (user) {
          user.role = ROLES.DOCTORANT;
          user.updatedAt = new Date().toISOString().split('T')[0];
        }

        // Create DoctoralStudent record
        const doctoralStudents = db.get('doctoralStudents');
        const existingStudent = doctoralStudents.find((s) => s.userId === candidateEntity.userId);

        if (!existingStudent) {
          const newStudent: DoctoralStudentEntity = {
            id: `doc-stud-${Date.now().toString(36)}`,
            userId: candidateEntity.userId,
            cneNumber: `N${Math.floor(100000000 + Math.random() * 900000000)}`,
            thesisTitle: app.topicTitle,
            topicId: app.topicId,
            supervisorId: app.supervisorId,
            structureId: 'struct-lisac',
            enrollmentYear: 1,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
          };
          doctoralStudents.push(newStudent);
        }

        db.save();
      }
    }

    auditService.log(
      directorUser.email,
      directorUser.role,
      decision === 'VALIDE' ? 'ADMISSION_APPROVED' : 'ADMISSION_REJECTED',
      'Application',
      appId,
      { decision, feedback },
      directorUser.id
    );

    // Notify candidate
    const candidateEntity = db.get('candidates').find((c) => c.id === app.candidateId);
    if (candidateEntity) {
      notificationService.notify(
        candidateEntity.userId,
        decision === 'VALIDE' ? 'Félicitations : Admission en Doctorat validée !' : 'Décision de structure',
        decision === 'VALIDE'
          ? `Votre inscription doctorale a été officiellement validée par la commission CED. Vous êtes désormais inscrit en 1ère année.`
          : `Votre candidature n’a pas été retenue par la commission : ${feedback}`,
        decision === 'VALIDE' ? 'SUCCESS' : 'WARNING',
        '/candidat'
      );
    }

    return updated;
  },
};
