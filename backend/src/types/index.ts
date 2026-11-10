import { RoleType, DocumentStatusCode, ApplicationStatusCode } from '../config/constants';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  cin: string;
  phone?: string;
  establishment?: string;
  laboratory?: string;
  role: RoleType;
  isActive: boolean;
  isEmailVerified: boolean;
  emailToken?: string;
  resetToken?: string;
  resetExpires?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<UserEntity, 'passwordHash' | 'emailToken' | 'resetToken' | 'resetExpires'>;

export interface CandidateEntity {
  id: string;
  userId: string;
  etablissementOrigine: string;
  diplomeOrigine: string;
  mentionDiplome?: string;
  anneeObtention?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctoralStudentEntity {
  id: string;
  userId: string;
  cneNumber?: string;
  thesisTitle: string;
  topicId?: string;
  supervisorId: string;
  structureId: string;
  enrollmentYear: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupervisorEntity {
  id: string;
  userId: string;
  grade: string;
  specialty?: string;
  structureId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchStructureEntity {
  id: string;
  name: string;
  code: string;
  establishment: string;
  cedId: string;
  directorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctoralCenterEntity {
  id: string;
  name: string;
  description?: string;
  directorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchTopicEntity {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  establishment: string;
  laboratoryId: string;
  supervisorId: string;
  slotsTotal: number;
  slotsTaken: number;
  status: 'PROPOSE' | 'EN_EXAMEN_STRUCTURE' | 'VALIDE' | 'REJETE' | 'CLOTURE';
  structureFeedback?: string;
  academicYearId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDocumentEntity {
  id: string;
  candidateId: string;
  candidateEmail?: string;
  applicationId?: string;
  typeCode: string; // baccalaureat, releve_notes, diplomes, cin
  title: string;
  fileName: string;
  fileSize: string;
  fileMimeType: string;
  dataUrl?: string;
  status: DocumentStatusCode;
  rejectionReason?: string;
  correctionNotes?: string;
  captureMethod: 'camera' | 'upload';
  uploadedAt: string;
  updatedAt: string;
}

export interface DocumentReviewEntity {
  id: string;
  documentId: string;
  reviewerId: string;
  reviewerName: string;
  previousStatus: DocumentStatusCode;
  newStatus: DocumentStatusCode;
  reason?: string;
  reviewedAt: string;
}

export interface ApplicationEntity {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateCin: string;
  candidatePhone?: string;
  etablissementOrigine: string;
  diplomeOrigine: string;
  topicId: string;
  topicTitle: string;
  establishment: string;
  laboratory: string;
  supervisorId: string;
  supervisorName: string;
  step: number; // 1 to 5
  currentStep?: number; // 1 to 5 (synchronized)
  status: ApplicationStatusCode;
  notes?: string;
  motivationLetter?: string;
  supervisorDecision?: string;
  supervisorGrade?: string;
  supervisorFeedback?: string;
  structureDecision?: string;
  structureFeedback?: string;
  commissionNotes?: string;
  submittedAt: string;
  updatedAt: string;
  documents?: ApplicationDocumentEntity[];
}

export interface AcademicYearEntity {
  id: string;
  code: string; // e.g. "2026-2027"
  isCurrent: boolean;
  campaignOpen: boolean;
  campaignDeadline?: string;
  createdAt: string;
}

export interface EnrollmentEntity {
  id: string;
  studentId: string;
  academicYearId: string;
  validatedAt: string;
}

export interface ReEnrollmentEntity {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  supervisorId: string;
  supervisorName: string;
  academicYearId: string;
  academicYearCode: string;
  yearNumber: number; // 2, 3, 4
  thesisTitle: string;
  establishment: string;
  summary: string;
  publicationsCount: number;
  communicationsCount: number;
  progressPercentage: number;
  reportFileName?: string;
  reportDataUrl?: string;
  supervisorFeedback?: string;
  status: 'EN_ATTENTE_ENCADRANT' | 'AVIS_FAVORABLE_ENCADRANT' | 'A_CORRIGER_ENCADRANT' | 'AVIS_DEFAVORABLE_ENCADRANT' | 'VALIDE_CED' | 'REJETE_CED';
  submittedAt: string;
  updatedAt: string;
}

export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLogEntity {
  id: string;
  userId?: string;
  userEmail: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}
