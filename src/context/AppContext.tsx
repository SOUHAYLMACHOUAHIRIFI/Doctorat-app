import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../types';
import {
  KNOWN_USERS,
  INITIAL_TOPICS,
  INITIAL_APPLICATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_RE_REGISTRATIONS,
} from '../data/mockData';

export interface AppContextType {
  // Current authenticated user & role
  currentUser: User | null;
  role: Role | null;
  registeredUsers: User[];

  // Authentication & Security (Strict RBAC)
  loginWithEmail: (email: string, password?: string) => { success: boolean; role?: Role; message: string };
  registerCandidate: (data: {
    email: string;
    nom: string;
    prenom: string;
    phone: string;
    cin: string;
    password: string;
    etablissementOrigine?: string;
    diplomeOrigine?: string;
  }) => { success: boolean; message: string };
  updateUserProfile: (data: Partial<User>) => void;
  logout: () => void;

  // Topics management
  topics: ThesisTopic[];
  addTopic: (newTopicData: Omit<ThesisTopic, 'id' | 'createdAt' | 'slotsTaken' | 'structureValidationStatus'>) => void;
  updateTopic: (topicId: string, updatedFields: Partial<ThesisTopic>) => void;
  approveTopicStructure: (topicId: string, feedback?: string) => void;
  rejectTopicStructure: (topicId: string, feedback?: string) => void;

  // Applications management
  applications: CandidateApplication[];
  addApplication: (
    topicId: string,
    notes?: string,
    activityReport?: string,
    details?: {
      nom?: string;
      prenom?: string;
      phone?: string;
      cin?: string;
      email?: string;
      etablissementOrigine?: string;
      diplomeOrigine?: string;
    },
    attachedDocs?: CandidateDocument[]
  ) => void;
  deleteApplication: (appId: string) => void;
  updateApplicationProgress: (
    appId: string,
    step: ApplicationStep,
    status: ApplicationStatus,
    notes?: string,
    feedback?: string
  ) => void;
  evaluateApplicationSupervisor: (
    appId: string,
    decision: 'favorable' | 'defavorable' | 'a_corriger',
    grade?: string,
    feedback?: string
  ) => void;
  validateApplicationStructure: (
    appId: string,
    decision: 'valide' | 'rejete',
    feedback?: string
  ) => void;
  currentCandidateApp?: CandidateApplication;

  // Candidate Documents management (Bac, Notes, Diplômes, CIN)
  documents: CandidateDocument[];
  uploadCandidateDocument: (
    type: DocumentType,
    fileName: string,
    fileSize?: string,
    dataUrl?: string,
    captureMethod?: 'camera' | 'upload'
  ) => CandidateDocument | undefined;
  deleteCandidateDocument: (docId: string) => void;
  resetCandidateDossier: () => void;
  seedCandidateDocuments: () => void;

  // Re-registrations
  reRegistrations: ReRegistration[];
  addReRegistration: (year: number, summary: string, pubs: number, comms: number, progress: number) => void;
  updateReRegistrationStatus: (reId: string, status: ReRegistration['status']) => void;
  currentCandidateReReg?: ReRegistration;

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Directory of users with localStorage persistence
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('gcd_users_v5');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return KNOWN_USERS;
  });

  // Current logged in user (starts with demo candidate Youssef, or saved user)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gcd_current_user_v5');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return KNOWN_USERS[0]; // Youssef El Amrani by default for immediate preview
  });

  const [currentView, setCurrentView] = useState<'catalogue' | 'register_candidat' | 'dashboard'>('dashboard');

  // Topics
  const [topics, setTopics] = useState<ThesisTopic[]>(() => {
    const saved = localStorage.getItem('gcd_topics_v5');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_TOPICS;
  });

  // Applications
  const [applications, setApplications] = useState<CandidateApplication[]>(() => {
    const saved = localStorage.getItem('gcd_applications_v5');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_APPLICATIONS;
  });

  // Documents
  const [documents, setDocuments] = useState<CandidateDocument[]>(() => {
    const saved = localStorage.getItem('gcd_documents_v5');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_DOCUMENTS;
  });

  // Re-registrations
  const [reRegistrations, setReRegistrations] = useState<ReRegistration[]>(() => {
    const saved = localStorage.getItem('gcd_rereg_v5');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_RE_REGISTRATIONS;
  });

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

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('gcd_users_v5', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gcd_current_user_v5', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gcd_current_user_v5');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gcd_topics_v5', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('gcd_applications_v5', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('gcd_documents_v5', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('gcd_rereg_v5', JSON.stringify(reRegistrations));
  }, [reRegistrations]);

  // Strict Login Authentication (RBAC)
  const loginWithEmail = (email: string, password?: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) {
      return { success: false, message: 'Veuillez saisir une adresse email valide.' };
    }

    // Find in registered users directory
    const matchedUser = registeredUsers.find((u) => u.email.toLowerCase() === normalized);

    if (!matchedUser) {
      return {
        success: false,
        message: 'Ce compte n’est pas enregistré. Les candidats doivent créer un compte via l’onglet Inscription.',
      };
    }

    // Password verification (Strict: no login without password)
    const expectedPassword = matchedUser.password || 'usmba2026';
    if (!password || password.trim() === '') {
      return {
        success: false,
        message: 'Le mot de passe est obligatoire pour vous connecter à votre compte.',
      };
    }
    if (password.trim() !== expectedPassword) {
      return {
        success: false,
        message: 'Mot de passe incorrect. Pour les comptes institutionnels de démonstration, le mot de passe est usmba2026.',
      };
    }

    setCurrentUser(matchedUser);
    setCurrentView('dashboard');
    showToast(`Connexion réussie : ${getRoleLabel(matchedUser.role)} (${matchedUser.name})`);
    return { success: true, role: matchedUser.role, message: 'Connexion réussie' };
  };

  // Dedicated Candidate Registration (requires @usmba.ac.ma)
  const registerCandidate = (data: {
    email: string;
    nom: string;
    prenom: string;
    phone: string;
    cin: string;
    password: string;
    etablissementOrigine?: string;
    diplomeOrigine?: string;
  }) => {
    const normalizedEmail = data.email.trim().toLowerCase();

    if (!normalizedEmail.endsWith('@usmba.ac.ma')) {
      return {
        success: false,
        message: 'L’inscription requiert obligatoirement une adresse email institutionnelle (@usmba.ac.ma).',
      };
    }

    const exists = registeredUsers.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return {
        success: false,
        message: 'Cette adresse email est déjà enregistrée. Veuillez vous connecter avec votre mot de passe.',
      };
    }

    const newCandidate: User = {
      id: `cand-${Date.now().toString(36)}`,
      name: `${data.prenom.trim()} ${data.nom.trim()}`,
      firstName: data.prenom.trim(),
      lastName: data.nom.trim(),
      email: normalizedEmail,
      password: data.password || 'usmba2026',
      role: 'candidat',
      phone: data.phone.trim(),
      cin: data.cin.trim().toUpperCase(),
      establishment: data.etablissementOrigine || 'FST Fès',
      etablissementOrigine: data.etablissementOrigine || 'FST Fès',
      diplomeOrigine: data.diplomeOrigine || 'Master de Recherche',
    };

    setRegisteredUsers((prev) => [...prev, newCandidate]);
    setCurrentUser(newCandidate);
    setCurrentView('dashboard');
    showToast(`Compte candidat créé avec succès ! Bienvenue ${newCandidate.name}`);
    return { success: true, message: 'Inscription finalisée' };
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...data } : u))
    );
    showToast('Profil candidat mis à jour avec succès.');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('catalogue');
    showToast('Vous avez été déconnecté avec succès.');
  };

  // Topics
  const addTopic = (newTopicData: Omit<ThesisTopic, 'id' | 'createdAt' | 'slotsTaken' | 'structureValidationStatus'>) => {
    const newTopic: ThesisTopic = {
      ...newTopicData,
      id: `th-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().split('T')[0],
      slotsTaken: 0,
      structureValidationStatus: 'en_examen',
    };
    setTopics((prev) => [newTopic, ...prev]);
    showToast('Nouveau sujet de thèse créé et soumis pour validation au CED.');
  };

  const updateTopic = (topicId: string, updatedFields: Partial<ThesisTopic>) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              ...updatedFields,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : t
      )
    );
    showToast('Sujet de thèse mis à jour.');
  };

  const approveTopicStructure = (topicId: string, feedback?: string) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              structureValidationStatus: 'approuve',
              status: 'valide',
              structureFeedback: feedback || 'Sujet validé et approuvé par la direction de structure (CED).',
            }
          : t
      )
    );
    showToast('Sujet de thèse approuvé au niveau de la structure.');
  };

  const rejectTopicStructure = (topicId: string, feedback?: string) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              structureValidationStatus: 'rejete',
              status: 'cloture',
              structureFeedback: feedback || 'Sujet non retenu par le conseil de structure.',
            }
          : t
      )
    );
    showToast('Sujet de thèse non retenu.');
  };

  // Applications
  const addApplication = (
    topicId: string,
    notes?: string,
    activityReport?: string,
    details?: {
      nom?: string;
      prenom?: string;
      phone?: string;
      cin?: string;
      email?: string;
      etablissementOrigine?: string;
      diplomeOrigine?: string;
    },
    attachedDocs?: CandidateDocument[]
  ) => {
    if (!currentUser) return;

    const targetTopic = topics.find((t) => t.id === topicId);
    if (!targetTopic) return;

    const candidateEmail = details?.email || currentUser.email;
    const alreadyApplied = applications.some(
      (a) => a.topicId === topicId && a.candidateEmail.toLowerCase() === candidateEmail.toLowerCase()
    );
    if (alreadyApplied) {
      showToast('Vous avez déjà postulé à ce sujet de thèse.');
      return;
    }

    const candidateName =
      details?.nom && details?.prenom
        ? `${details.prenom.trim()} ${details.nom.trim()}`
        : currentUser.name;

    // Gather candidate documents
    const userDocs = attachedDocs && attachedDocs.length > 0
      ? attachedDocs
      : documents.filter((d) => d.candidateEmail.toLowerCase() === candidateEmail.toLowerCase());

    const newApp: CandidateApplication = {
      id: `app-${Date.now().toString(36)}`,
      topicId: targetTopic.id,
      topicTitle: targetTopic.title,
      candidateId: currentUser.id,
      candidateName,
      candidateEmail,
      candidatePhone: details?.phone || currentUser.phone,
      candidateCin: details?.cin || currentUser.cin,
      etablissementOrigine:
        details?.etablissementOrigine || currentUser.etablissementOrigine || 'Université Sidi Mohamed Ben Abdellah',
      diplomeOrigine: details?.diplomeOrigine || currentUser.diplomeOrigine || 'Master de Recherche',
      establishment: targetTopic.establishment,
      laboratory: targetTopic.laboratory,
      supervisorName: targetTopic.supervisorName,
      supervisorId: targetTopic.supervisorId,
      status: 'soumis',
      currentStep: 2, // Étape 2 : Candidature soumise (Étape 1 : Pièces scannées étant validée au préalable)
      submittedDate: new Date().toISOString().split('T')[0],
      documents: userDocs,
      notes: notes || 'Candidature formelle et 4 pièces justificatives transmises.',
      activityReport: activityReport || 'Dossier de candidature initial et projet de recherche préliminaire.',
    };

    setApplications((prev) => [newApp, ...prev]);

    // Update currentUser profile if new details were provided
    if (details?.phone || details?.cin || details?.etablissementOrigine || details?.diplomeOrigine) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              phone: details.phone || prev.phone,
              cin: details.cin || prev.cin,
              name: candidateName,
              etablissementOrigine: details.etablissementOrigine || prev.etablissementOrigine,
              diplomeOrigine: details.diplomeOrigine || prev.diplomeOrigine,
            }
          : prev
      );
    }

    // Increment topic slots taken
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, slotsTaken: t.slotsTaken + 1 } : t))
    );

    showToast('Candidature déposée avec succès (Étape 2 : Candidature soumise)');
  };

  const deleteApplication = (appId: string) => {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;

    setApplications((prev) => prev.filter((a) => a.id !== appId));

    if (target.topicId) {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === target.topicId ? { ...t, slotsTaken: Math.max(0, t.slotsTaken - 1) } : t
        )
      );
    }

    showToast('Candidature retirée.');
  };

  const updateApplicationProgress = (
    appId: string,
    step: ApplicationStep,
    status: ApplicationStatus,
    notes?: string,
    feedback?: string
  ) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              currentStep: step,
              status,
              notes: notes || a.notes,
              supervisorFeedback: feedback !== undefined ? feedback : a.supervisorFeedback,
            }
          : a
      )
    );
    showToast(`Dossier candidat mis à jour : Étape ${step}`);
  };

  // Supervisor pedagogical evaluation
  const evaluateApplicationSupervisor = (
    appId: string,
    decision: 'favorable' | 'defavorable' | 'a_corriger',
    grade?: string,
    feedback?: string
  ) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== appId) return a;

        if (decision === 'favorable') {
          return {
            ...a,
            currentStep: 4, // Étape 4 : Validation Structure
            status: 'avis_favorable',
            supervisorDecision: 'favorable',
            supervisorGrade: grade || a.supervisorGrade || 'Favorable',
            supervisorFeedback: feedback || a.supervisorFeedback || 'Avis favorable émis par le directeur de thèse.',
            notes: 'Avis favorable accordé. Dossier transmis à la direction de la structure pour validation finale.',
          };
        } else if (decision === 'a_corriger') {
          return {
            ...a,
            status: 'a_corriger',
            supervisorDecision: 'a_corriger',
            supervisorFeedback: feedback || 'Veuillez corriger ou compléter vos pièces justificatives.',
            notes: 'Correction requise par le directeur de thèse avant réévaluation.',
          };
        } else {
          return {
            ...a,
            status: 'refuse',
            supervisorDecision: 'defavorable',
            supervisorFeedback: feedback || 'Candidature non retenue lors de l’évaluation pédagogique.',
            notes: 'Candidature non retenue par le directeur de thèse.',
          };
        }
      })
    );

    if (decision === 'favorable') {
      showToast('Avis favorable émis : dossier promu à l’Étape 4 (Validation Structure)');
    } else if (decision === 'a_corriger') {
      showToast('Demande de correction transmise au candidat');
    } else {
      showToast('Avis défavorable enregistré');
    }
  };

  // Structure Director validation
  const validateApplicationStructure = (
    appId: string,
    decision: 'valide' | 'rejete',
    feedback?: string
  ) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== appId) return a;

        if (decision === 'valide') {
          return {
            ...a,
            currentStep: 5, // Étape 5 : Admission Finale
            status: 'admis',
            structureDecision: 'valide',
            structureFeedback: feedback || 'Validation officielle accordée par la commission du CED USMBA.',
            notes: 'Candidat admis définitivement en doctorat. Inscription validée.',
          };
        } else {
          return {
            ...a,
            status: 'refuse',
            structureDecision: 'rejete',
            structureFeedback: feedback || 'Dossier non retenu par le conseil du CED.',
            notes: 'Candidature non retenue lors de la commission de structure.',
          };
        }
      })
    );

    if (decision === 'valide') {
      showToast('Candidat admis définitivement (Étape 5 : Admission Finale)');
    } else {
      showToast('Dossier rejeté par la commission de structure');
    }
  };

  // Documents management with webcam scan and upload support
  const uploadCandidateDocument = (
    type: DocumentType,
    fileName: string,
    fileSize = '1.8 Mo',
    dataUrl?: string,
    captureMethod: 'camera' | 'upload' = 'upload'
  ): CandidateDocument | undefined => {
    if (!currentUser) return;

    const titles: Record<DocumentType, string> = {
      baccalaureat: 'Diplôme du Baccalauréat',
      releve_notes: 'Fiches et Relevés de Notes',
      diplomes: 'Diplômes (Licence, Master / Ingénieur)',
      cin: 'Carte d’Identité Nationale (CIN)',
    };

    const newDoc: CandidateDocument = {
      id: `doc-${Date.now().toString(36)}`,
      candidateEmail: currentUser.email,
      type,
      title: titles[type],
      fileName,
      uploadedAt: new Date().toISOString().split('T')[0],
      fileSize,
      status: 'valide',
      dataUrl,
      captureMethod,
    };

    setDocuments((prev) => {
      const filtered = prev.filter(
        (d) => !(d.candidateEmail.toLowerCase() === currentUser.email.toLowerCase() && d.type === type)
      );
      return [newDoc, ...filtered];
    });

    // Also update current candidate's active application if any
    setApplications((prev) =>
      prev.map((app) => {
        if (app.candidateEmail.toLowerCase() === currentUser.email.toLowerCase()) {
          const updatedDocs = [
            ...(app.documents || []).filter((d) => d.type !== type),
            newDoc,
          ];
          return { ...app, documents: updatedDocs };
        }
        return app;
      })
    );

    showToast(`Pièce ${captureMethod === 'camera' ? 'scannée par caméra' : 'téléversée'} : ${titles[type]}`);
    return newDoc;
  };

  const deleteCandidateDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    setApplications((prev) =>
      prev.map((app) => ({
        ...app,
        documents: (app.documents || []).filter((d) => d.id !== docId),
      }))
    );
    showToast('Document retiré.');
  };

  const resetCandidateDossier = () => {
    if (!currentUser) return;
    const userEmail = currentUser.email.toLowerCase();
    setDocuments((prev) => prev.filter((d) => d.candidateEmail.toLowerCase() !== userEmail));
    setApplications((prev) => prev.filter((a) => a.candidateEmail.toLowerCase() !== userEmail));
    showToast('Dossier candidat réinitialisé (0/4 pièces). Étape 1 active.');
  };

  const seedCandidateDocuments = () => {
    if (!currentUser) return;
    const userEmail = currentUser.email.toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    const sampleDocs: CandidateDocument[] = [
      {
        id: `doc-${Date.now().toString(36)}-bac`,
        candidateEmail: userEmail,
        type: 'baccalaureat',
        title: 'Diplôme du Baccalauréat',
        fileName: 'BAC_Sciences_Maths_Certifie.pdf',
        uploadedAt: today,
        fileSize: '1.4 Mo',
        status: 'valide',
        captureMethod: 'upload',
      },
      {
        id: `doc-${Date.now().toString(36)}-notes`,
        candidateEmail: userEmail,
        type: 'releve_notes',
        title: 'Fiches et Relevés de Notes',
        fileName: 'Releves_Notes_S1_S4_Master.pdf',
        uploadedAt: today,
        fileSize: '3.2 Mo',
        status: 'valide',
        captureMethod: 'upload',
      },
      {
        id: `doc-${Date.now().toString(36)}-dip`,
        candidateEmail: userEmail,
        type: 'diplomes',
        title: 'Diplômes (Licence / Master / Ingénieur)',
        fileName: 'Diplome_Master_Recherche_USMBA.pdf',
        uploadedAt: today,
        fileSize: '2.1 Mo',
        status: 'valide',
        captureMethod: 'upload',
      },
      {
        id: `doc-${Date.now().toString(36)}-cin`,
        candidateEmail: userEmail,
        type: 'cin',
        title: 'Carte d’Identité Nationale (CIN)',
        fileName: `Scan_CIN_${currentUser.cin || 'CD654321'}.pdf`,
        uploadedAt: today,
        fileSize: '0.9 Mo',
        status: 'valide',
        captureMethod: 'camera',
      },
    ];

    setDocuments((prev) => [
      ...prev.filter((d) => d.candidateEmail.toLowerCase() !== userEmail),
      ...sampleDocs,
    ]);
    showToast('4 pièces certifiées générées avec succès (Dossier 4/4 complet).');
  };

  // Re-registration
  const addReRegistration = (
    year: number,
    summary: string,
    pubs: number,
    comms: number,
    progress: number
  ) => {
    if (!currentUser) return;

    const newRe: ReRegistration = {
      id: `re-${Date.now().toString(36)}`,
      candidateId: currentUser.id,
      candidateName: currentUser.name,
      candidateEmail: currentUser.email,
      thesisTitle: 'Recherche doctorale en Intelligence Artificielle et Systèmes Embarqués',
      supervisorName: 'Pr. Karim Bennani',
      establishment: currentUser.establishment || 'FST Fès',
      year,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'en_attente_encadrant',
      activityReport: {
        summary,
        publicationsCount: pubs,
        communicationsCount: comms,
        progressPercentage: progress,
        fileName: `Rapport_Activite_Annuel_${currentUser.name.replace(/\s+/g, '_')}_A${year}.pdf`,
      },
    };

    setReRegistrations((prev) => [newRe, ...prev]);
    showToast('Demande de réinscription annuelle transmise à votre directeur de thèse.');
  };

  const updateReRegistrationStatus = (reId: string, status: ReRegistration['status']) => {
    setReRegistrations((prev) =>
      prev.map((r) => (r.id === reId ? { ...r, status } : r))
    );
    showToast('Statut de réinscription mis à jour.');
  };

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
    ? applications.find((a) => a.candidateEmail.toLowerCase() === currentUser.email.toLowerCase())
    : undefined;

  const currentCandidateReReg = currentUser
    ? reRegistrations.find((r) => r.candidateEmail.toLowerCase() === currentUser.email.toLowerCase())
    : undefined;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        registeredUsers,
        loginWithEmail,
        registerCandidate,
        updateUserProfile,
        logout,
        topics,
        addTopic,
        updateTopic,
        approveTopicStructure,
        rejectTopicStructure,
        applications,
        addApplication,
        deleteApplication,
        updateApplicationProgress,
        evaluateApplicationSupervisor,
        validateApplicationStructure,
        currentCandidateApp,
        documents,
        uploadCandidateDocument,
        deleteCandidateDocument,
        resetCandidateDossier,
        seedCandidateDocuments,
        reRegistrations,
        addReRegistration,
        updateReRegistrationStatus,
        currentCandidateReReg,
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
    case 'candidat':
      return 'Candidat / Doctorant';
    case 'directeur_these':
      return 'Directeur de Thèse';
    case 'directeur_structure':
      return 'Directeur de Structure (CED)';
    default:
      return 'Utilisateur';
  }
}
