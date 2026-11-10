export const ROLES = {
  CANDIDATE: 'CANDIDATE',
  DOCTORANT: 'DOCTORANT',
  SUPERVISOR: 'SUPERVISOR',
  STRUCTURE_DIRECTOR: 'STRUCTURE_DIRECTOR',
  CED_ADMIN: 'CED_ADMIN',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const DOCUMENT_TYPES = {
  BACCALAUREAT: 'baccalaureat',
  RELEVE_NOTES: 'releve_notes',
  DIPLOMES: 'diplomes',
  CIN: 'cin',
} as const;

export type DocumentTypeCode = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

export const MANDATORY_DOCUMENT_TYPES: DocumentTypeCode[] = [
  DOCUMENT_TYPES.BACCALAUREAT,
  DOCUMENT_TYPES.RELEVE_NOTES,
  DOCUMENT_TYPES.DIPLOMES,
  DOCUMENT_TYPES.CIN,
];

export const DOCUMENT_STATUS = {
  NON_DEPOSE: 'NON_DEPOSE',
  DEPOSE: 'DEPOSE',
  EN_VERIFICATION: 'EN_VERIFICATION',
  A_CORRIGER: 'A_CORRIGER',
  VALIDE: 'VALIDE',
  REJETE: 'REJETE',
} as const;

export type DocumentStatusCode = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

export const MAX_APPLICATIONS_PER_CANDIDATE = 3;

export const APPLICATION_STEPS = {
  PROFIL_ET_DOCUMENTS: 1,
  CANDIDATURE_SOUMISE: 2,
  EVALUATION_DIRECTEUR: 3,
  VALIDATION_STRUCTURE: 4,
  ADMISSION_CED: 5,
  DECISION_FINALE: 5,
  // Compatibility aliases
  VERIFICATION_DOSSIER: 2,
  COMMISSION_DOCTORALE: 4,
} as const;

export const APPLICATION_STATUS = {
  BROUILLON: 'BROUILLON',
  SOUMIS: 'SOUMIS',
  EN_VERIFICATION: 'EN_VERIFICATION',
  A_CORRIGER: 'A_CORRIGER',
  AVIS_FAVORABLE: 'SUPERVISOR_APPROVED',
  SUPERVISOR_APPROVED: 'SUPERVISOR_APPROVED',
  EVALUATED: 'EVALUATED',
  AVIS_DEFAVORABLE: 'AVIS_DEFAVORABLE',
  VALIDE_STRUCTURE: 'CED_APPROVED',
  CED_APPROVED: 'CED_APPROVED',
  ACCEPTED: 'ACCEPTED',
  REJETE_STRUCTURE: 'REJETE_STRUCTURE',
  ADMIS: 'ADMIS',
  REFUSE: 'REFUSE',
} as const;

export type ApplicationStatusCode = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS] | string;

export const USMBA_ESTABLISHMENTS = [
  'FST Fès (Faculté des Sciences et Techniques)',
  'FS Dhar El Mahraz (Faculté des Sciences)',
  'ENSA Fès (École Nationale des Sciences Appliquées)',
  'FLSH Dhar El Mahraz (Faculté des Lettres et des Sciences Humaines)',
  'FSJES Fès (Faculté des Sciences Juridiques, Économiques et Sociales)',
  'EST Fès (École Supérieure de Technologie)',
];
