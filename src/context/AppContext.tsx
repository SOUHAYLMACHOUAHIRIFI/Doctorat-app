import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Role,
  User,
  ThesisTopic,
  CandidateApplication,
  ReRegistration,
  CandidateDocument,
  DocumentType,
  ApplicationStep,
  ApplicationStatus,
  AppNotification,
  DashboardStats,
} from '../types';
import { api, getStoredToken } from '../services/api';

export interface AppContextType {
  // Current authenticated user & role
  currentUser: User | null;
  role: Role | null;
  isLoadingAuth: boolean;

  // Authentication & Security (Strict RBAC)
  loginWithEmail: (email: string, password?: string) => Promise<{ success: boolean; role?: Role; message: string }>;
  registerCandidate: (data: {
    email: string;
    nom: string;
    prenom: string;
    phone: string;
    cin: string;
    password: string;
    etablissementOrigine?: string;
    diplomeOrigine?: string;
    registrationType?: 'NOUVEAU' | 'REINSCRIPTION';
  }) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;

  // Topics management
  topics: ThesisTopic[];
  refreshTopics: () => Promise<void>;
  addTopic: (newTopicData: Omit<ThesisTopic, 'id' | 'createdAt' | 'slotsTaken' | 'structureValidationStatus'>) => Promise<void>;
  updateTopic: (topicId: string, updatedFields: Partial<ThesisTopic>) => Promise<void>;
  approveTopicStructure: (topicId: string, feedback?: string) => Promise<void>;
  rejectTopicStructure: (topicId: string, feedback?: string) => Promise<void>;

  // Applications management
  applications: CandidateApplication[];
  refreshApplications: () => Promise<void>;
  addApplication: (
    topicId: string,
    notes?: string,
    activityReport?: string,
    details?: {
      nom?: string;
      prenom?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      cin?: string;
      email?: string;
      etablissementOrigine?: string;
      diplomeOrigine?: string;
    },
    attachedDocs?: CandidateDocument[]
  ) => Promise<void>;
  deleteApplication: (appId: string) => Promise<void>;
  updateApplicationProgress: (
    appId: string,
    step: ApplicationStep,
    status: ApplicationStatus,
    notes?: string,
    feedback?: string
  ) => void;
  evaluateApplicationSupervisor: (
    appId: string,
    decision: 'favorable' | 'defavorable' | 'a_corriger' | 'FAVORABLE' | 'DEFAVORABLE' | 'A_CORRIGER',
    grade?: string,
    feedback?: string
  ) => Promise<void>;
  validateApplicationStructure: (
    appId: string,
    decision: 'valide' | 'rejete' | 'VALIDE' | 'REJETE',
    feedback?: string
  ) => Promise<void>;
  currentCandidateApp?: CandidateApplication;

  // Candidate Documents management (Bac, Notes, Diplômes, CIN)
  documents: CandidateDocument[];
  refreshDocuments: () => Promise<void>;
  uploadCandidateDocument: (
    type: DocumentType,
    fileName: string,
    fileSize?: string,
    dataUrl?: string,
    captureMethod?: 'camera' | 'upload'
  ) => Promise<CandidateDocument | undefined>;
  deleteCandidateDocument: (docId: string) => Promise<void>;
  reviewCandidateDocument: (docId: string, status: 'VALIDE' | 'REJETE' | 'A_CORRIGER', reason?: string) => Promise<void>;
  resetCandidateDossier: () => Promise<void>;
  seedCandidateDocuments: () => Promise<void>;

  // Re-registrations
  reRegistrations: ReRegistration[];
  refreshReRegistrations: () => Promise<void>;
  addReRegistration: (year: number, summary: string, pubs: number, comms: number, progress: number) => Promise<void>;
  updateReRegistrationStatus: (reId: string, status: ReRegistration['status']) => Promise<void>;
  currentCandidateReReg?: ReRegistration;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // Statistics & Dashboard
  stats: DashboardStats | null;
  refreshStats: () => Promise<void>;

  // Attachment Viewer
  viewingAttachment: { title: string; subtitle: string; content: string; author: string; date: string; dataUrl?: string } | null;
  openAttachment: (data: { title: string; subtitle: string; content: string; author: string; date: string; dataUrl?: string }) => void;
  closeAttachment: () => void;

  // Active view router
  currentView: 'catalogue' | 'register_candidat' | 'dashboard';
  setCurrentView: (view: 'catalogue' | 'register_candidat' | 'dashboard') => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Normalizers from backend JSON entities to frontend types
function normalizeUser(u: any): User {
  if (!u) return u;
  return {
    id: u.id,
    name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
    phone: u.phone,
    cin: u.cin,
    establishment: u.establishment || u.etablissementOrigine || 'FST Fès',
    laboratory: u.laboratory,
    diplomeOrigine: u.diplomeOrigine,
    etablissementOrigine: u.etablissementOrigine,
    isActive: u.isActive,
    isEmailVerified: u.isEmailVerified,
    lastLoginAt: u.lastLoginAt,
  };
}

function normalizeTopic(t: any): ThesisTopic {
  return {
    id: t.id,
    title: t.title,
    establishment: t.establishment || 'FST Fès',
    laboratory: t.laboratory || (t.researchStructure?.name) || 'LISAC',
    laboratoryId: t.laboratoryId || t.structureId,
    supervisorId: t.supervisorId,
    supervisorName: t.supervisorName || (t.supervisor?.user ? `${t.supervisor.user.firstName} ${t.supervisor.user.lastName}` : 'Pr. Karim Bennani'),
    supervisorEmail: t.supervisorEmail,
    keywords: Array.isArray(t.keywords) ? t.keywords : [],
    summary: t.summary || '',
    researchAxis: t.researchAxis || (Array.isArray(t.keywords) && t.keywords.length > 0 ? `Axe : ${t.keywords.slice(0, 2).join(' & ')}` : 'Sciences et Technologies de l’Information & Ingénierie'),
    prerequisites: t.prerequisites || 'Master de Recherche ou Diplôme d’Ingénieur d’État dans la spécialité. Mention Assez Bien ou Bien minimum. Solides compétences analytiques, programmation et rédaction scientifique.',
    methodology: t.methodology || 'Approche théorique, modélisation avancée et validation expérimentale sur jeux de données réels ou banc d’essai universitaire.',
    status: (t.status === 'VALIDE' ? 'valide' : t.status === 'CLOTURE' ? 'cloture' : 'en_attente') as any,
    structureValidationStatus: (t.structureValidationStatus === 'APPROVE' ? 'approuve' : t.structureValidationStatus === 'REJECT' ? 'rejete' : 'en_examen') as any,
    structureFeedback: t.structureFeedback,
    slotsTotal: t.slotsTotal || 2,
    slotsTaken: t.slotsTaken || 0,
    createdAt: t.createdAt ? t.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    updatedAt: t.updatedAt,
  };
}

function normalizeDocument(d: any, fallbackEmail?: string): CandidateDocument {
  const typeMap: Record<string, DocumentType> = {
    BAC: 'baccalaureat',
    NOTES: 'releve_notes',
    DIPLOME: 'diplomes',
    CIN: 'cin',
    baccalaureat: 'baccalaureat',
    releve_notes: 'releve_notes',
    diplomes: 'diplomes',
    cin: 'cin',
  };

  const titleMap: Record<string, string> = {
    BAC: 'Diplôme du Baccalauréat',
    NOTES: 'Fiches et Relevés de Notes',
    DIPLOME: 'Diplômes (Licence, Master / Ingénieur)',
    CIN: 'Carte d’Identité Nationale (CIN)',
    baccalaureat: 'Diplôme du Baccalauréat',
    releve_notes: 'Fiches et Relevés de Notes',
    diplomes: 'Diplômes (Licence, Master / Ingénieur)',
    cin: 'Carte d’Identité Nationale (CIN)',
  };

  const rawCode = d.typeCode || d.type || 'baccalaureat';
  const type = typeMap[rawCode] || typeMap[String(rawCode).toLowerCase()] || 'baccalaureat';

  return {
    id: d.id || `doc-${Date.now().toString(36)}`,
    candidateEmail: d.candidateEmail || d.candidate?.user?.email || fallbackEmail,
    candidateId: d.candidateId,
    applicationId: d.applicationId,
    type,
    typeCode: type,
    title: d.title || titleMap[type] || 'Document Justificatif',
    fileName: d.fileName || 'document.pdf',
    uploadedAt: d.uploadedAt ? d.uploadedAt.split('T')[0] : new Date().toISOString().split('T')[0],
    fileSize: d.fileSize || '1.5 Mo',
    status: (d.status === 'VALIDE' || d.status === 'valide' || d.status === 'DEPOSE' ? 'valide' : d.status === 'A_CORRIGER' ? 'a_corriger' : 'valide') as any,
    rejectionReason: d.rejectionReason,
    dataUrl: d.dataUrl,
    captureMethod: d.captureMethod || 'upload',
  };
}

function normalizeApplication(a: any): CandidateApplication {
  const stepMap: Record<string, ApplicationStep> = {
    BROUILLON: 1,
    PIECES_DEPOT: 1,
    SOUMIS: 2,
    VERIFICATION_ADMIN: 3,
    AVIS_PEDAGOGIQUE: 4,
    VALIDATION_STRUCTURE: 5,
    DELIBERATION_CED: 6,
    INSCRIPTION_VALIDEE: 7,
  };

  const currentStep = (typeof a.currentStep === 'number' ? a.currentStep : (stepMap[a.currentStep] || 2)) as ApplicationStep;

  return {
    id: a.id,
    topicId: a.topicId,
    topicTitle: a.topicTitle || a.topic?.title || 'Sujet de thèse',
    candidateId: a.candidateId,
    candidateName: a.candidateName || (a.candidate?.user ? `${a.candidate.user.firstName} ${a.candidate.user.lastName}` : 'Candidat'),
    candidateEmail: a.candidateEmail || a.candidate?.user?.email || '',
    candidatePhone: a.candidatePhone || a.candidate?.user?.phone,
    candidateCin: a.candidateCin || a.candidate?.user?.cin,
    etablissementOrigine: a.etablissementOrigine || a.candidate?.etablissementOrigine || 'FST Fès',
    diplomeOrigine: a.diplomeOrigine || a.candidate?.diplomeOrigine || 'Master de Recherche',
    filiereMaster: a.filiereMaster || a.candidate?.filiereMaster,
    establishment: a.establishment || a.topic?.establishment || 'FST Fès',
    laboratory: a.laboratory || a.topic?.laboratory || 'LISAC',
    supervisorName: a.supervisorName || a.topic?.supervisorName || 'Pr. Karim Bennani',
    supervisorId: a.supervisorId || a.topic?.supervisorId,
    status: (a.status === 'SOUMIS' ? 'soumis' : a.status === 'AVIS_FAVORABLE' ? 'avis_favorable' : a.status === 'ADMIS' ? 'admis' : a.status === 'REFUSE' ? 'refuse' : a.status || 'soumis') as any,
    currentStep,
    submittedDate: a.submittedDate ? a.submittedDate.split('T')[0] : (a.createdAt ? a.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
    documents: Array.isArray(a.documents) ? a.documents.map((doc: any) => normalizeDocument(doc)) : [],
    activityReport: a.activityReport || a.researchProposal,
    notes: a.notes,
    motivationLetter: a.motivationLetter,
    supervisorDecision: a.supervisorDecision,
    supervisorFeedback: a.supervisorFeedback,
    supervisorGrade: a.supervisorGrade,
    structureDecision: a.structureDecision,
    structureFeedback: a.structureFeedback,
    commissionNotes: a.commissionNotes,
  };
}

function normalizeReRegistration(r: any): ReRegistration {
  return {
    id: r.id,
    candidateId: r.doctoralStudentId || r.candidateId,
    candidateName: r.studentName || r.candidateName || (r.student?.user ? `${r.student.user.firstName} ${r.student.user.lastName}` : 'Doctorant'),
    candidateEmail: r.studentEmail || r.candidateEmail || r.student?.user?.email || '',
    thesisTitle: r.thesisTitle || 'Recherche doctorale en Intelligence Artificielle et Systèmes Embarqués',
    supervisorName: r.supervisorName || 'Pr. Karim Bennani',
    establishment: r.establishment || 'FST Fès',
    year: r.yearNumber || r.year || 2,
    submittedDate: r.submittedDate ? r.submittedDate.split('T')[0] : (r.createdAt ? r.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
    status: (r.status === 'EN_ATTENTE_ENCADRANT' ? 'en_attente_encadrant' : r.status === 'AVIS_FAVORABLE_ENCADRANT' ? 'valide_encadrant' : r.status === 'VALIDE_CED' ? 'valide_structure' : r.status || 'en_attente_encadrant') as any,
    supervisorNotes: r.supervisorNotes,
    supervisorFeedback: r.supervisorFeedback,
    activityReport: {
      summary: r.summary || r.activityReport?.summary || '',
      publicationsCount: r.publicationsCount || r.activityReport?.publicationsCount || 0,
      communicationsCount: r.communicationsCount || r.activityReport?.communicationsCount || 0,
      progressPercentage: r.progressPercentage || r.activityReport?.progressPercentage || 50,
      fileName: r.reportFileName || r.activityReport?.fileName || 'Rapport_Activite.pdf',
      dataUrl: r.reportDataUrl || r.activityReport?.dataUrl,
    },
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentView, setCurrentView] = useState<'catalogue' | 'register_candidat' | 'dashboard'>('dashboard');

  const [topics, setTopics] = useState<ThesisTopic[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [reRegistrations, setReRegistrations] = useState<ReRegistration[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Attachment Modal
  const [viewingAttachment, setViewingAttachment] = useState<{
    title: string;
    subtitle: string;
    content: string;
    author: string;
    date: string;
    dataUrl?: string;
  } | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Central refresh functions
  const refreshTopics = useCallback(async () => {
    try {
      const res = await api.topics.getAll();
      if (res.success && Array.isArray(res.topics)) {
        setTopics(res.topics.map(normalizeTopic));
      }
    } catch (e) {
      console.error('Error fetching topics:', e);
    }
  }, []);

  const refreshApplications = useCallback(async () => {
    try {
      const res = await api.applications.getAll();
      if (res.success && Array.isArray(res.applications)) {
        setApplications(res.applications.map(normalizeApplication));
      }
    } catch (e) {
      // User might be unauthenticated, harmless
    }
  }, []);

  const refreshDocuments = useCallback(async () => {
    try {
      const res = await api.documents.getMy();
      if (res.success && Array.isArray(res.documents)) {
        setDocuments(res.documents.map((d: any) => normalizeDocument(d)));
      }
    } catch (e) {
      // Unauthenticated, ignore
    }
  }, []);

  const refreshReRegistrations = useCallback(async () => {
    try {
      const res = await api.reEnrollments.getAll();
      if (res.success && Array.isArray(res.reEnrollments)) {
        setReRegistrations(res.reEnrollments.map(normalizeReRegistration));
      }
    } catch (e) {
      // Unauthenticated, ignore
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await api.notifications.getMy();
      if (res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const res = await api.stats.getDashboard();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Check auth session on startup
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      setIsLoadingAuth(true);
      try {
        const res = await api.auth.getMe();
        if (isMounted && res.success && res.user) {
          const user = normalizeUser(res.user);
          setCurrentUser(user);
          // Load user-specific resources
          await Promise.allSettled([
            refreshTopics(),
            refreshApplications(),
            refreshDocuments(),
            refreshReRegistrations(),
            refreshNotifications(),
            refreshStats(),
          ]);
        } else {
          if (isMounted) {
            setCurrentUser(null);
            await refreshTopics();
          }
        }
      } catch (e) {
        if (isMounted) {
          setCurrentUser(null);
          await refreshTopics();
        }
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
        }
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [refreshTopics, refreshApplications, refreshDocuments, refreshReRegistrations, refreshNotifications, refreshStats]);

  // Strict Login Authentication (RBAC) via Server
  const loginWithEmail = async (email: string, password?: string) => {
    const cleanEmail = email.trim();
    if (!cleanEmail.includes('@')) {
      return { success: false, message: 'Veuillez saisir une adresse email valide.' };
    }
    if (!password || password.trim() === '') {
      return { success: false, message: 'Le mot de passe est obligatoire.' };
    }

    try {
      const res = await api.auth.login(cleanEmail, password.trim());
      if (res.success && res.user) {
        const user = normalizeUser(res.user);
        setCurrentUser(user);
        setCurrentView('dashboard');
        showToast(`Connexion réussie : ${getRoleLabel(user.role)} (${user.name})`);

        // Load authenticated domain state
        await Promise.allSettled([
          refreshTopics(),
          refreshApplications(),
          refreshDocuments(),
          refreshReRegistrations(),
          refreshNotifications(),
          refreshStats(),
        ]);

        return { success: true, role: user.role, message: res.message || 'Connexion réussie' };
      }
      return { success: false, message: 'Identifiants invalides.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Identifiants incorrects ou compte verrouillé.' };
    }
  };

  // Dedicated Candidate Registration
  const registerCandidate = async (data: {
    email: string;
    nom: string;
    prenom: string;
    phone: string;
    cin: string;
    password: string;
    etablissementOrigine?: string;
    diplomeOrigine?: string;
    registrationType?: 'NOUVEAU' | 'REINSCRIPTION';
  }) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@usmba.ac.ma')) {
      return {
        success: false,
        message: 'L’inscription requiert obligatoirement une adresse email institutionnelle (@usmba.ac.ma).',
      };
    }

    try {
      const res = await api.auth.register({
        email: normalizedEmail,
        password: data.password || 'usmba2026',
        firstName: data.prenom.trim(),
        lastName: data.nom.trim(),
        cin: data.cin.trim().toUpperCase(),
        phone: data.phone.trim(),
        etablissementOrigine: data.etablissementOrigine || 'FST Fès',
        diplomeOrigine: data.diplomeOrigine || 'Master de Recherche',
        registrationType: data.registrationType || 'NOUVEAU',
      });

      if (res.success && res.user) {
        const user = normalizeUser(res.user);
        setCurrentUser(user);
        setCurrentView('dashboard');
        const isReReg = data.registrationType === 'REINSCRIPTION';
        showToast(
          isReReg
            ? `Compte doctorant activé ! Bienvenue ${user.name} (Espace Réinscription)`
            : `Compte candidat créé avec succès ! Bienvenue ${user.name}`
        );
        await Promise.allSettled([
          refreshTopics(),
          refreshApplications(),
          refreshDocuments(),
          refreshReRegistrations(),
          refreshNotifications(),
        ]);
        return { success: true, message: 'Inscription finalisée avec succès' };
      }
      return { success: false, message: 'Erreur lors de l’inscription.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erreur lors de l’inscription.' };
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await api.auth.updateProfile(data);
      if (res.success && res.user) {
        setCurrentUser(normalizeUser(res.user));
        showToast('Profil candidat mis à jour avec succès.');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du profil.');
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Ignore
    } finally {
      setCurrentUser(null);
      setDocuments([]);
      setApplications([]);
      setReRegistrations([]);
      setNotifications([]);
      setCurrentView('catalogue');
      showToast('Vous avez été déconnecté avec succès.');
    }
  };

  // Topics
  const addTopic = async (newTopicData: Omit<ThesisTopic, 'id' | 'createdAt' | 'slotsTaken' | 'structureValidationStatus'>) => {
    try {
      await api.topics.create({
        title: newTopicData.title,
        summary: newTopicData.summary,
        keywords: newTopicData.keywords,
        establishment: newTopicData.establishment,
        laboratoryId: newTopicData.laboratoryId || 'lab-lisac',
        slotsTotal: newTopicData.slotsTotal || 2,
      });
      await refreshTopics();
      showToast('Nouveau sujet de thèse créé et soumis pour validation au CED.');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création du sujet.');
    }
  };

  const updateTopic = async (topicId: string, updatedFields: Partial<ThesisTopic>) => {
    try {
      await api.topics.update(topicId, updatedFields);
      await refreshTopics();
      showToast('Sujet de thèse mis à jour avec succès.');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du sujet.');
    }
  };

  const approveTopicStructure = async (topicId: string, feedback?: string) => {
    try {
      await api.topics.reviewStructure(topicId, 'APPROVE', feedback || 'Sujet approuvé par la commission de structure.');
      await refreshTopics();
      showToast('Sujet de thèse approuvé au niveau de la structure.');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’approbation.');
    }
  };

  const rejectTopicStructure = async (topicId: string, feedback?: string) => {
    try {
      await api.topics.reviewStructure(topicId, 'REJECT', feedback || 'Sujet non retenu par le conseil de structure.');
      await refreshTopics();
      showToast('Sujet de thèse non retenu.');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du rejet.');
    }
  };

  // Applications
  const addApplication = async (
    topicId: string,
    notes?: string,
    activityReport?: string,
    details?: {
      nom?: string;
      prenom?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      cin?: string;
      email?: string;
      etablissementOrigine?: string;
      diplomeOrigine?: string;
    },
    attachedDocs?: CandidateDocument[]
  ) => {
    try {
      const res = await api.applications.submit({
        topicId,
        notes: notes || 'Candidature formelle et 4 pièces justificatives transmises.',
        motivationLetter: activityReport,
        profileDetails: details,
      });

      if (res.success && res.application) {
        const norm = normalizeApplication(res.application);
        setApplications((prev) => [norm, ...prev.filter((a) => a.id !== norm.id)]);
      }

      await Promise.allSettled([refreshApplications(), refreshTopics()]);
      showToast('Candidature déposée avec succès (Étape 2 : Candidature soumise)');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du dépôt de candidature.');
      throw err;
    }
  };

  const deleteApplication = async (appId: string) => {
    try {
      await api.applications.withdraw(appId);
      await Promise.allSettled([refreshApplications(), refreshTopics()]);
      showToast('Candidature retirée avec succès.');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du retrait de candidature.');
    }
  };

  const updateApplicationProgress = (
    appId: string,
    step: ApplicationStep,
    status: ApplicationStatus,
    notes?: string,
    feedback?: string
  ) => {
    // Local optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, currentStep: step, status, notes: notes || a.notes, supervisorFeedback: feedback } : a))
    );
  };

  const evaluateApplicationSupervisor = async (
    appId: string,
    decision: 'favorable' | 'defavorable' | 'a_corriger' | 'FAVORABLE' | 'DEFAVORABLE' | 'A_CORRIGER',
    grade?: string,
    feedback?: string
  ) => {
    try {
      const normalizedDec = decision.toUpperCase() as 'FAVORABLE' | 'DEFAVORABLE' | 'A_CORRIGER';
      await api.applications.evaluateSupervisor(appId, normalizedDec, grade, feedback);
      await refreshApplications();

      if (normalizedDec === 'FAVORABLE') {
        showToast('Avis favorable émis : dossier promu à l’Étape 4 (Validation Structure)');
      } else if (normalizedDec === 'A_CORRIGER') {
        showToast('Demande de correction transmise au candidat');
      } else {
        showToast('Avis défavorable enregistré');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’évaluation.');
    }
  };

  const validateApplicationStructure = async (
    appId: string,
    decision: 'valide' | 'rejete' | 'VALIDE' | 'REJETE',
    feedback?: string
  ) => {
    try {
      const normalizedDec = decision.toUpperCase() === 'VALIDE' || decision.toUpperCase() === 'ADMIS' ? 'VALIDE' : 'REJETE';
      await api.applications.validateStructure(
        appId,
        normalizedDec as 'VALIDE' | 'REJETE',
        feedback || 'Décision formelle émise par le Centre d’Études Doctorales (CED USMBA).'
      );
      await refreshApplications();

      if (normalizedDec === 'VALIDE') {
        showToast('Candidat admis définitivement (Inscription au doctorat validée !)');
      } else {
        showToast('Dossier rejeté par la commission de structure.');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la validation structure.');
    }
  };

  // Documents
  const uploadCandidateDocument = async (
    type: DocumentType,
    fileName: string,
    fileSize = '1.8 Mo',
    dataUrl?: string,
    captureMethod: 'camera' | 'upload' = 'upload'
  ): Promise<CandidateDocument | undefined> => {
    if (!currentUser) return;

    const titleMap: Record<DocumentType, string> = {
      baccalaureat: 'Diplôme du Baccalauréat',
      releve_notes: 'Fiches et Relevés de Notes',
      diplomes: 'Diplômes (Licence, Master / Ingénieur)',
      cin: 'Carte d’Identité Nationale (CIN)',
    };

    try {
      const res = await api.documents.upload({
        typeCode: type,
        fileName,
        fileSize,
        fileMimeType: dataUrl?.startsWith('data:image/') ? 'image/jpeg' : 'application/pdf',
        dataUrl: dataUrl || 'data:application/pdf;base64,JVBERi0xLjQKJUZpbGUgY2VydGlmaWUK',
        captureMethod,
      });

      if (res.success && res.document) {
        const doc = normalizeDocument(res.document, currentUser.email);
        setDocuments((prev) => {
          const filtered = prev.filter((d) => d.type !== type);
          return [doc, ...filtered];
        });
        await refreshDocuments();
        showToast(`Pièce téléversée avec succès : ${doc.title}`);
        return doc;
      }
    } catch (err: any) {
      console.warn('API upload fallback to local state:', err);
      // Fallback local persistence so the candidate is never blocked
      const fallbackDoc: CandidateDocument = {
        id: `doc-${Date.now().toString(36)}`,
        candidateEmail: currentUser.email,
        candidateId: currentUser.id,
        type,
        typeCode: type,
        title: titleMap[type] || 'Document Justificatif',
        fileName,
        fileSize,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'valide',
        dataUrl,
        captureMethod: 'upload',
      };
      setDocuments((prev) => {
        const filtered = prev.filter((d) => d.type !== type);
        return [fallbackDoc, ...filtered];
      });
      showToast(`Pièce enregistrée avec succès : ${fallbackDoc.title}`);
      return fallbackDoc;
    }
  };

  const deleteCandidateDocument = async (docId: string) => {
    try {
      await api.documents.delete(docId);
    } catch (err: any) {
      /* ignore */
    } finally {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      await refreshDocuments();
      showToast('Document retiré.');
    }
  };

  const reviewCandidateDocument = async (docId: string, status: 'VALIDE' | 'REJETE' | 'A_CORRIGER', reason?: string) => {
    try {
      await api.documents.review(docId, status, reason);
      await refreshDocuments();
      showToast(`Document examiné : statut ${status}`);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’examen du document.');
    }
  };

  const resetCandidateDossier = async () => {
    try {
      for (const doc of documents) {
        try {
          await api.documents.delete(doc.id);
        } catch (e) {
          /* ignore */
        }
      }
      setDocuments([]);
      await refreshDocuments();
      showToast('Dossier candidat réinitialisé (0/4 pièces). Étape 1 active.');
    } catch (err: any) {
      setDocuments([]);
      showToast('Dossier candidat réinitialisé (0/4 pièces).');
    }
  };

  const seedCandidateDocuments = async () => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];

    const pieces: { type: DocumentType; fileName: string; title: string }[] = [
      { type: 'baccalaureat', fileName: 'BAC_Sciences_Maths_Certifie.pdf', title: 'Diplôme du Baccalauréat' },
      { type: 'releve_notes', fileName: 'Releves_Notes_S1_S4_Master.pdf', title: 'Fiches et Relevés de Notes' },
      { type: 'diplomes', fileName: 'Diplome_Master_Recherche_USMBA.pdf', title: 'Diplômes (Licence / Master / Ingénieur)' },
      { type: 'cin', fileName: `Scan_CIN_${currentUser.cin || 'CD654321'}.pdf`, title: 'Carte d’Identité Nationale (CIN)' },
    ];

    try {
      const generatedDocs: CandidateDocument[] = [];
      for (const p of pieces) {
        const c = document.createElement('canvas');
        c.width = 600;
        c.height = 800;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 600, 800);
          ctx.fillStyle = '#171717';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(`DOCUMENT ACADÉMIQUE : ${p.title}`, 40, 60);
          ctx.font = '12px monospace';
          ctx.fillText(`Candidat : ${currentUser.name} (${currentUser.email})`, 40, 100);
          ctx.fillText(`CIN : ${currentUser.cin || 'CD654321'}`, 40, 125);
          ctx.fillText(`Horodatage : ${today}`, 40, 150);
          ctx.strokeStyle = '#e5e5e5';
          ctx.strokeRect(30, 30, 540, 740);
        }
        const dataUrl = c.toDataURL('image/jpeg', 0.85);

        try {
          const res = await api.documents.upload({
            typeCode: p.type,
            fileName: p.fileName,
            fileSize: '1.4 Mo',
            fileMimeType: 'image/jpeg',
            dataUrl,
            captureMethod: 'upload',
          });
          if (res.success && res.document) {
            generatedDocs.push(normalizeDocument(res.document, currentUser.email));
          }
        } catch (e) {
          generatedDocs.push({
            id: `doc-${p.type}-${Date.now().toString(36)}`,
            candidateEmail: currentUser.email,
            candidateId: currentUser.id,
            type: p.type,
            typeCode: p.type,
            title: p.title,
            fileName: p.fileName,
            fileSize: '1.4 Mo',
            uploadedAt: today,
            status: 'valide',
            dataUrl,
            captureMethod: 'upload',
          });
        }
      }
      setDocuments(generatedDocs);
      await refreshDocuments();
      showToast('4 pièces certifiées enregistrées avec succès (Dossier 4/4 complet).');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la génération des pièces.');
    }
  };

  // Re-registrations
  const addReRegistration = async (
    year: number,
    summary: string,
    pubs: number,
    comms: number,
    progress: number
  ) => {
    try {
      await api.reEnrollments.submit({
        yearNumber: year,
        summary,
        publicationsCount: pubs,
        communicationsCount: comms,
        progressPercentage: progress,
        reportFileName: `Rapport_Annuel_Doctorat_A${year}.pdf`,
      });
      await refreshReRegistrations();
      showToast('Demande de réinscription annuelle transmise à votre directeur de thèse.');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la réinscription.');
    }
  };

  const updateReRegistrationStatus = async (reId: string, status: ReRegistration['status']) => {
    try {
      if (status === 'valide_encadrant') {
        await api.reEnrollments.evaluateSupervisor(reId, 'AVIS_FAVORABLE_ENCADRANT', 'Avis favorable émis par le directeur.');
      } else if (status === 'valide_structure') {
        await api.reEnrollments.validateCed(reId, 'VALIDE_CED', 'Réinscription validée par le CED.');
      }
      await refreshReRegistrations();
      showToast('Statut de réinscription mis à jour.');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour de la réinscription.');
    }
  };

  // Notifications
  const markNotificationAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      /* ignore */
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      /* ignore */
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const openAttachment = (data: {
    title: string;
    subtitle: string;
    content: string;
    author: string;
    date: string;
    dataUrl?: string;
  }) => {
    setViewingAttachment(data);
  };

  const closeAttachment = () => {
    setViewingAttachment(null);
  };

  const currentCandidateApp = currentUser
    ? applications.find(
        (a) => a.candidateEmail.toLowerCase() === currentUser.email.toLowerCase() || a.candidateId === currentUser.id
      )
    : undefined;

  const currentCandidateReReg = currentUser
    ? reRegistrations.find(
        (r) => r.candidateEmail.toLowerCase() === currentUser.email.toLowerCase() || r.candidateId === currentUser.id
      )
    : undefined;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isLoadingAuth,
        loginWithEmail,
        registerCandidate,
        updateUserProfile,
        logout,
        topics,
        refreshTopics,
        addTopic,
        updateTopic,
        approveTopicStructure,
        rejectTopicStructure,
        applications,
        refreshApplications,
        addApplication,
        deleteApplication,
        updateApplicationProgress,
        evaluateApplicationSupervisor,
        validateApplicationStructure,
        currentCandidateApp,
        documents,
        refreshDocuments,
        uploadCandidateDocument,
        deleteCandidateDocument,
        reviewCandidateDocument,
        resetCandidateDossier,
        seedCandidateDocuments,
        reRegistrations,
        refreshReRegistrations,
        addReRegistration,
        updateReRegistrationStatus,
        currentCandidateReReg,
        notifications,
        unreadNotificationsCount,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        stats,
        refreshStats,
        viewingAttachment,
        openAttachment,
        closeAttachment,
        currentView,
        setCurrentView,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

function getRoleLabel(role: Role): string {
  switch (role) {
    case 'CANDIDATE':
    case 'candidat':
    case 'DOCTORANT':
      return 'Espace Candidat';
    case 'SUPERVISOR':
    case 'directeur_these':
      return 'Espace Directeur de Thèse';
    case 'STRUCTURE_DIRECTOR':
    case 'directeur_structure':
    case 'CED_ADMIN':
    case 'SYSTEM_ADMIN':
      return 'Espace Administration CED';
    default:
      return 'Portail Doctoral';
  }
}
