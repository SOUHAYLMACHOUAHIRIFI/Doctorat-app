export type Role =
  | 'CANDIDATE'
  | 'DOCTORANT'
  | 'SUPERVISOR'
  | 'STRUCTURE_DIRECTOR'
  | 'CED_ADMIN'
  | 'SYSTEM_ADMIN'
  // Backward compatibility aliases
  | 'candidat'
  | 'directeur_these'
  | 'directeur_structure';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role: Role;
  phone?: string;
  cin?: string;
  establishment?: string;
  laboratory?: string;
  diplomeOrigine?: string;
  etablissementOrigine?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
}

export type TopicStatus = 'valide' | 'en_attente' | 'cloture' | 'PROPOSE' | 'EN_EXAMEN_STRUCTURE' | 'VALIDE' | 'REJETE' | 'CLOTURE';
export type StructureValidationStatus = 'en_examen' | 'approuve' | 'rejete' | 'APPROVE' | 'REJECT';

export interface ThesisTopic {
  id: string;
  title: string;
  establishment: string; // e.g. FST Fès, FS Dhar El Mahraz, ENSA Fès
  laboratory: string; // e.g. LISAC, LERMA
  laboratoryId?: string;
  supervisorId: string;
  supervisorName: string;
  supervisorEmail?: string;
  keywords: string[];
  summary: string;
  researchAxis?: string;
  prerequisites?: string;
  methodology?: string;
  status: TopicStatus;
  structureValidationStatus?: StructureValidationStatus;
  structureFeedback?: string;
  slotsTotal: number;
  slotsTaken: number;
  createdAt: string;
  updatedAt?: string;
}

export type ApplicationStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ApplicationStatus =
  | 'soumis'
  | 'pieces_validees'
  | 'avis_favorable'
  | 'avis_defavorable'
  | 'a_corriger'
  | 'validation_structure'
  | 'admis'
  | 'refuse'
  | 'BROUILLON'
  | 'SOUMIS'
  | 'EN_VERIFICATION'
  | 'A_CORRIGER'
  | 'AVIS_FAVORABLE'
  | 'AVIS_DEFAVORABLE'
  | 'VALIDE_STRUCTURE'
  | 'REJETE_STRUCTURE'
  | 'ADMIS'
  | 'REFUSE';

export type DocumentType = 'baccalaureat' | 'releve_notes' | 'diplomes' | 'cin';

export type DocumentStatus =
  | 'NON_DEPOSE'
  | 'DEPOSE'
  | 'EN_VERIFICATION'
  | 'A_CORRIGER'
  | 'VALIDE'
  | 'REJETE'
  | 'valide'
  | 'en_attente'
  | 'a_corriger';

export interface CandidateDocument {
  id: string;
  candidateEmail?: string;
  candidateId?: string;
  applicationId?: string;
  type: DocumentType;
  typeCode?: string;
  title: string;
  fileName: string;
  uploadedAt: string;
  fileSize: string;
  status: DocumentStatus;
  rejectionReason?: string;
  correctionNotes?: string;
  previewUrl?: string;
  dataUrl?: string; // Base64 data from live webcam scan or file upload
  captureMethod?: 'upload' | 'camera';
}

export interface CandidateApplication {
  id: string;
  topicId: string;
  topicTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateCin?: string;
  etablissementOrigine?: string;
  diplomeOrigine?: string;
  filiereMaster?: string;
  establishment: string;
  laboratory: string;
  supervisorName: string;
  supervisorId?: string;
  status: ApplicationStatus;
  currentStep: ApplicationStep;
  submittedDate: string;
  documents: CandidateDocument[];
  cvUrl?: string;
  projetUrl?: string;
  activityReport?: string;
  notes?: string;
  motivationLetter?: string;
  supervisorDecision?: 'favorable' | 'defavorable' | 'a_corriger' | 'FAVORABLE' | 'DEFAVORABLE' | 'A_CORRIGER';
  supervisorFeedback?: string;
  supervisorGrade?: string;
  structureDecision?: 'valide' | 'rejete' | 'VALIDE' | 'REJETE';
  structureFeedback?: string;
  commissionNotes?: string;
}

export interface ReRegistration {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  thesisTitle: string;
  supervisorName: string;
  establishment: string;
  year: number; // 2, 3, 4, 5
  submittedDate: string;
  status:
    | 'en_attente_encadrant'
    | 'valide_encadrant'
    | 'valide_structure'
    | 'a_corriger'
    | 'EN_ATTENTE_ENCADRANT'
    | 'AVIS_FAVORABLE_ENCADRANT'
    | 'A_CORRIGER_ENCADRANT'
    | 'AVIS_DEFAVORABLE_ENCADRANT'
    | 'VALIDE_CED'
    | 'REJETE_CED';
  supervisorNotes?: string;
  supervisorFeedback?: string;
  activityReport: {
    summary: string;
    publicationsCount: number;
    communicationsCount: number;
    progressPercentage: number;
    fileName: string;
    dataUrl?: string;
  };
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AppAuditLog {
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

export interface DashboardStats {
  candidates: number;
  doctoralStudents: number;
  supervisors: number;
  topics: {
    total: number;
    validated: number;
    pending: number;
  };
  applications: {
    total: number;
    admitted: number;
    favorable: number;
    pending: number;
  };
  reEnrollments: {
    total: number;
    validated: number;
  };
  documents: {
    total: number;
    validated: number;
  };
}
