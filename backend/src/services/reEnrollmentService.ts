import { reEnrollmentRepository } from '../repositories/reEnrollmentRepository';
import { db } from '../repositories/database';
import { ReEnrollmentEntity, SafeUser } from '../types';
import { ROLES } from '../config/constants';
import { auditService } from './auditService';
import { notificationService } from './notificationService';

export const reEnrollmentService = {
  getReEnrollments(user: SafeUser): ReEnrollmentEntity[] {
    if (user.role === ROLES.DOCTORANT) {
      const student = db.get('doctoralStudents').find((s) => s.userId === user.id);
      if (!student) return [];
      return reEnrollmentRepository.findByStudent(student.id);
    }

    if (user.role === ROLES.SUPERVISOR) {
      const supervisor = db.get('supervisors').find((s) => s.userId === user.id);
      if (!supervisor) return [];
      return reEnrollmentRepository.findBySupervisor(supervisor.id);
    }

    // CED_ADMIN, STRUCTURE_DIRECTOR, SYSTEM_ADMIN see all
    return reEnrollmentRepository.findAll();
  },

  submitReEnrollment(
    user: SafeUser,
    data: {
      yearNumber: number;
      summary: string;
      publicationsCount?: number;
      communicationsCount?: number;
      progressPercentage?: number;
      reportFileName?: string;
      reportDataUrl?: string;
    }
  ): ReEnrollmentEntity {
    const student = db.get('doctoralStudents').find((s) => s.userId === user.id);
    if (!student) {
      throw new Error('Vous devez être enregistré comme doctorant pour déposer une réinscription.');
    }

    const currentYear = db.get('academicYears').find((ay) => ay.isCurrent) || db.get('academicYears')[0];
    if (!currentYear.campaignOpen) {
      throw new Error('La campagne de réinscription pour cette année universitaire est actuellement close.');
    }

    const supervisor = db.get('supervisors').find((s) => s.id === student.supervisorId);
    const supervisorUser = supervisor ? db.get('users').find((u) => u.id === supervisor.userId) : undefined;
    const supervisorName = supervisorUser ? `Pr. ${supervisorUser.firstName} ${supervisorUser.lastName}` : 'Directeur de Thèse';

    const now = new Date().toISOString().split('T')[0];

    const newRe: ReEnrollmentEntity = {
      id: `re-${Date.now().toString(36)}`,
      studentId: student.id,
      studentName: `${user.firstName} ${user.lastName}`,
      studentEmail: user.email,
      supervisorId: student.supervisorId,
      supervisorName,
      academicYearId: currentYear.id,
      academicYearCode: currentYear.code,
      yearNumber: data.yearNumber,
      thesisTitle: student.thesisTitle,
      establishment: user.establishment || 'FST Fès',
      summary: data.summary.trim(),
      publicationsCount: data.publicationsCount || 0,
      communicationsCount: data.communicationsCount || 0,
      progressPercentage: data.progressPercentage || 0,
      reportFileName: data.reportFileName || `Rapport_Activite_${user.lastName}_A${data.yearNumber}.pdf`,
      reportDataUrl: data.reportDataUrl,
      status: 'EN_ATTENTE_ENCADRANT',
      submittedAt: now,
      updatedAt: now,
    };

    reEnrollmentRepository.create(newRe);

    auditService.log(
      user.email,
      user.role,
      'SUBMIT_RE_ENROLLMENT',
      'ReEnrollment',
      newRe.id,
      { yearNumber: data.yearNumber, academicYear: currentYear.code },
      user.id
    );

    // Notify supervisor
    if (supervisor) {
      notificationService.notify(
        supervisor.userId,
        `Demande de réinscription en ${data.yearNumber}ème année`,
        `Le doctorant ${newRe.studentName} a déposé son rapport d'activité annuel pour examen.`,
        'INFO',
        '/supervisor'
      );
    }

    return newRe;
  },

  evaluateReEnrollmentSupervisor(
    user: SafeUser,
    id: string,
    status: 'AVIS_FAVORABLE_ENCADRANT' | 'A_CORRIGER_ENCADRANT' | 'AVIS_DEFAVORABLE_ENCADRANT',
    feedback: string
  ): ReEnrollmentEntity {
    const re = reEnrollmentRepository.findById(id);
    if (!re) throw new Error('Demande de réinscription non trouvée.');

    const updated = reEnrollmentRepository.update(id, {
      status,
      supervisorFeedback: feedback.trim(),
    });

    if (!updated) throw new Error('Erreur de mise à jour.');

    auditService.log(
      user.email,
      user.role,
      'EVALUATE_RE_ENROLLMENT_SUPERVISOR',
      'ReEnrollment',
      id,
      { status, feedback },
      user.id
    );

    // Notify student
    const student = db.get('doctoralStudents').find((s) => s.id === re.studentId);
    if (student) {
      notificationService.notify(
        student.userId,
        `Avis encadrant sur votre réinscription`,
        `Votre directeur de thèse a émis un avis (${status}) : ${feedback}`,
        status === 'AVIS_FAVORABLE_ENCADRANT' ? 'SUCCESS' : 'WARNING',
        '/doctorant'
      );
    }

    return updated;
  },

  validateReEnrollmentCed(
    user: SafeUser,
    id: string,
    status: 'VALIDE_CED' | 'REJETE_CED',
    feedback: string
  ): ReEnrollmentEntity {
    const re = reEnrollmentRepository.findById(id);
    if (!re) throw new Error('Demande de réinscription non trouvée.');

    const updated = reEnrollmentRepository.update(id, {
      status,
    });

    if (!updated) throw new Error('Erreur de mise à jour.');

    // If validated, update student year
    if (status === 'VALIDE_CED') {
      const student = db.get('doctoralStudents').find((s) => s.id === re.studentId);
      if (student) {
        student.enrollmentYear = re.yearNumber;
        db.save();
      }
    }

    auditService.log(
      user.email,
      user.role,
      'VALIDATE_RE_ENROLLMENT_CED',
      'ReEnrollment',
      id,
      { status, feedback },
      user.id
    );

    // Notify student
    const student = db.get('doctoralStudents').find((s) => s.id === re.studentId);
    if (student) {
      notificationService.notify(
        student.userId,
        `Décision CED sur votre réinscription en ${re.yearNumber}ème année`,
        status === 'VALIDE_CED'
          ? `Votre réinscription annuelle a été validée par la direction du CED.`
          : `Votre réinscription a été rejetée : ${feedback}`,
        status === 'VALIDE_CED' ? 'SUCCESS' : 'WARNING',
        '/doctorant'
      );
    }

    return updated;
  },
};
