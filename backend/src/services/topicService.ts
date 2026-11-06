import { topicRepository } from '../repositories/topicRepository';
import { db } from '../repositories/database';
import { ResearchTopicEntity, SafeUser } from '../types';
import { ROLES } from '../config/constants';
import { auditService } from './auditService';
import { notificationService } from './notificationService';

export const topicService = {
  getTopics(user?: SafeUser): ResearchTopicEntity[] {
    const all = topicRepository.findAll();

    if (!user) {
      // Unauthenticated visitor: show validated topics
      return all.filter((t) => t.status === 'VALIDE');
    }

    if (user.role === ROLES.SUPERVISOR) {
      // Find supervisor ID
      const supervisors = db.get('supervisors');
      const sup = supervisors.find((s) => s.userId === user.id);
      if (!sup) return all.filter((t) => t.status === 'VALIDE');

      // Supervisor sees their own topics + all validated topics
      return all.filter((t) => t.supervisorId === sup.id || t.status === 'VALIDE');
    }

    if (user.role === ROLES.STRUCTURE_DIRECTOR) {
      // Find laboratory managed by this director
      const structures = db.get('structures');
      const managed = structures.filter((s) => s.directorId === user.id || s.name === user.laboratory);
      const managedIds = managed.map((m) => m.id);

      return all.filter((t) => managedIds.includes(t.laboratoryId) || t.status === 'VALIDE');
    }

    // CED_ADMIN and SYSTEM_ADMIN see all
    if (user.role === ROLES.CED_ADMIN || user.role === ROLES.SYSTEM_ADMIN) {
      return all;
    }

    // Candidates & Doctorants see validated topics
    return all.filter((t) => t.status === 'VALIDE');
  },

  getTopicById(id: string): ResearchTopicEntity {
    const topic = topicRepository.findById(id);
    if (!topic) throw new Error('Sujet de recherche non trouvé.');
    return topic;
  },

  createTopic(
    user: SafeUser,
    data: {
      title: string;
      summary: string;
      keywords: string[];
      establishment: string;
      laboratoryId: string;
      slotsTotal?: number;
    }
  ): ResearchTopicEntity {
    // Determine supervisor ID
    let supervisorId = '';
    const supervisors = db.get('supervisors');
    const existingSup = supervisors.find((s) => s.userId === user.id);

    if (existingSup) {
      supervisorId = existingSup.id;
    } else {
      // Create supervisor record if missing
      supervisorId = `sup-${Date.now().toString(36)}`;
      supervisors.push({
        id: supervisorId,
        userId: user.id,
        grade: 'Professeur de l’Enseignement Supérieur (PES)',
        specialty: 'Recherche Doctorale',
        structureId: data.laboratoryId,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      });
      db.save();
    }

    const currentYear = db.get('academicYears').find((ay) => ay.isCurrent) || db.get('academicYears')[0];

    const newTopic: ResearchTopicEntity = {
      id: `th-${Date.now().toString(36)}`,
      title: data.title.trim(),
      summary: data.summary.trim(),
      keywords: data.keywords,
      establishment: data.establishment,
      laboratoryId: data.laboratoryId,
      supervisorId,
      slotsTotal: data.slotsTotal || 1,
      slotsTaken: 0,
      status: 'EN_EXAMEN_STRUCTURE',
      academicYearId: currentYear ? currentYear.id : 'ay-2026-2027',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    topicRepository.create(newTopic);

    auditService.log(
      user.email,
      user.role,
      'CREATE_TOPIC',
      'ResearchTopic',
      newTopic.id,
      { title: newTopic.title, laboratoryId: data.laboratoryId },
      user.id
    );

    // Notify structure director if assigned
    const structure = db.get('structures').find((s) => s.id === data.laboratoryId);
    if (structure && structure.directorId) {
      notificationService.notify(
        structure.directorId,
        'Nouveau sujet de thèse soumis pour validation',
        `Le professeur ${user.firstName} ${user.lastName} a soumis le sujet : "${newTopic.title}".`,
        'INFO',
        `/structure`
      );
    }

    return newTopic;
  },

  updateTopic(user: SafeUser, topicId: string, updates: Partial<ResearchTopicEntity>): ResearchTopicEntity {
    const topic = topicRepository.findById(topicId);
    if (!topic) throw new Error('Sujet non trouvé.');

    // Check ownership: only the supervisor who created it or an admin can update
    const supervisors = db.get('supervisors');
    const sup = supervisors.find((s) => s.userId === user.id);

    if (
      user.role !== ROLES.SYSTEM_ADMIN &&
      user.role !== ROLES.CED_ADMIN &&
      (!sup || sup.id !== topic.supervisorId)
    ) {
      throw new Error('Vous n’avez pas le droit de modifier ce sujet de recherche.');
    }

    const updated = topicRepository.update(topicId, updates);
    if (!updated) throw new Error('Erreur lors de la mise à jour du sujet.');

    auditService.log(user.email, user.role, 'UPDATE_TOPIC', 'ResearchTopic', topicId, updates, user.id);

    return updated;
  },

  reviewTopicStructure(
    user: SafeUser,
    topicId: string,
    decision: 'APPROVE' | 'REJECT',
    feedback: string
  ): ResearchTopicEntity {
    const topic = topicRepository.findById(topicId);
    if (!topic) throw new Error('Sujet non trouvé.');

    const newStatus = decision === 'APPROVE' ? 'VALIDE' : 'REJETE';
    const updated = topicRepository.update(topicId, {
      status: newStatus,
      structureFeedback: feedback.trim(),
    });

    if (!updated) throw new Error('Erreur de mise à jour.');

    auditService.log(
      user.email,
      user.role,
      decision === 'APPROVE' ? 'APPROVE_TOPIC_STRUCTURE' : 'REJECT_TOPIC_STRUCTURE',
      'ResearchTopic',
      topicId,
      { decision, feedback },
      user.id
    );

    // Notify supervisor
    const supervisor = db.get('supervisors').find((s) => s.id === topic.supervisorId);
    if (supervisor) {
      notificationService.notify(
        supervisor.userId,
        `Sujet de thèse ${decision === 'APPROVE' ? 'approuvé' : 'non retenu'} par la structure`,
        `Votre sujet "${topic.title}" a été examiné : ${feedback}`,
        decision === 'APPROVE' ? 'SUCCESS' : 'WARNING',
        '/supervisor'
      );
    }

    return updated;
  },
};
