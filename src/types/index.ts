export type Role =
  | 'candidat'
  | 'directeur_these'
  | 'directeur_structure'
  | 'candidate'
  | 'supervisor'
  | 'structure_director';

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
}

export type TopicStatus = 'valide' | 'en_attente' | 'cloture';
export type StructureValidationStatus = 'en_examen' | 'approuve' | 'rejete';

export interface ThesisTopic {
  id: string;
  title: string;
  establishment: string; // e.g. FST Fès, FS Dhar El Mahraz, ENSA Fès
  laboratory: string; // e.g. LISAC, LERMA, LIAS
  supervisorId: string;
  supervisorName: string;
  supervisorEmail?: string;
  keywords: string[];
  summary: string;
  status: TopicStatus; // valide (vert), en_attente (orange), cloture (rouge)
  structureValidationStatus: StructureValidationStatus; // Examen par la direction de la structure
  structureFeedback?: string;
  slotsTotal: number;
  slotsTaken: number;
  createdAt: string;
  updatedAt?: string;
}

export type ApplicationStep = 1 | 2 | 3 | 4 | 5;
// 1: Dossier soumis ➔ 2: Pièces validées ➔ 3: Avis Directeur ➔ 4: Validation Structure ➔ 5: Admis

export type ApplicationStatus =
  | 'soumis'
  | 'pieces_validees'
  | 'avis_directeur'
  | 'validation_structure'
  | 'admis'
  | 'refuse'
  | 'a_corriger';

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
  cvUrl?: string;
  projetUrl?: string;
  activityReport?: string;
  notes?: string;
  supervisorFeedback?: string; // Remarques pédagogiques de l'encadrant
  structureFeedback?: string;  // Remarques de la commission de structure
}

export type DocumentType = 'baccalaureat' | 'releve_notes' | 'diplomes' | 'cin';

export interface CandidateDocument {
  id: string;
  candidateEmail: string;
  type: DocumentType;
  title: string;
  fileName: string;
  uploadedAt: string;
  fileSize: string;
  status: 'valide' | 'en_attente' | 'a_corriger';
  previewUrl?: string;
  dataUrl?: string; // Base64 or Object URL for webcam scans / uploaded files
  captureMethod?: 'upload' | 'camera';
}

export interface ReRegistration {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  thesisTitle: string;
  supervisorName: string;
  establishment: string;
  year: number; // 2ème, 3ème, 4ème année
  submittedDate: string;
  status: 'en_attente_encadrant' | 'valide_encadrant' | 'valide_structure' | 'a_corriger';
  supervisorNotes?: string;
  activityReport: {
    summary: string;
    publicationsCount: number;
    communicationsCount: number;
    progressPercentage: number;
    fileName: string;
    dataUrl?: string;
  };
}
