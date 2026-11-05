import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Role,
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

interface AppContextType {
  currentUser: User | null;
  role: Role | null;
  registeredUsers: User[];
  // Auth functions
  loginWithEmail: (email: string, explicitRole?: Role) => { success: boolean; role: Role; message: string };
  registerCandidate: (data: {
    email: string;
    nom: string;
    prenom: string;
    phone: string;
    cin: string;
  }) => { success: boolean; message: string };
  logout: () => void;
  detectRoleFromEmail: (email: string) => Role;
  switchRole: (targetRole: Role) => void;

  // Topics management
  topics: ThesisTopic[];
  addTopic: (topic: Omit<ThesisTopic, 'id' | 'createdAt' | 'slotsTaken' | 'structureValidationStatus'>) => void;
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
    }
  ) => void;
  deleteApplication: (appId: string) => void;
  updateApplicationProgress: (
    appId: string,
    step: ApplicationStep,
    status: ApplicationStatus,
    notes?: string,
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
  ) => void;
  deleteCandidateDocument: (docId: string) => void;

  // Re-registrations
  reRegistrations: ReRegistration[];
  addReRegistration: (year: number, summary: string, pubs: number, comms: number, progress: number) => void;
  updateReRegistrationStatus: (reId: string, status: ReRegistration['status']) => void;
  currentCandidateReReg?: ReRegistration;

  // Attachment Viewer
  viewingAttachment: { title: string; subtitle: string; content: string; author: string; date: string } | null;
  openAttachment: (data: { title: string; subtitle: string; content: string; author: string; date: string }) => void;
  closeAttachment: () => void;

  // Active view router
  currentView: 'catalogue' | 'register_candidat' | 'dashboard';
  setCurrentView: (view: 'catalogue' | 'register_candidat' | 'dashboard') => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper for automatic role detection based on institutional email
export function resolveRoleFromEmail(email: string, users?: User[]): Role {
  const normalized = email.trim().toLowerCase();

  // 1. Pattern detection for Direction de Structure / Admin (CED, Doyen, Présidence, Labo)
  if (
    normalized.includes('structure') ||
    normalized.includes('ced') ||
    normalized.includes('admin') ||
    normalized.includes('direction') ||
    normalized.includes('director.structure') ||
    normalized.includes('doyen') ||
    normalized.includes('president') ||
    normalized.includes('labo') ||
    normalized.includes('pole') ||
    normalized.includes('laboratoire')
  ) {
    return 'directeur_structure';
  }

  // 2. Pattern detection for Directeurs de thèse / Professeurs / Supervisors / Encadrants
  if (
    normalized.includes('supervisor') ||
    normalized.includes('these') ||
    normalized.includes('thesis') ||
    normalized.includes('encadrant') ||
    normalized.includes('prof') ||
    normalized.startsWith('pr.') ||
    normalized.startsWith('pr_') ||
    normalized.startsWith('dr.') ||
    normalized.startsWith('dr_') ||
    normalized.includes('bennani') ||
    normalized.includes('chami') ||
    normalized.includes('directeur') ||
    normalized.includes('enseignant')
  ) {
    return 'directeur_these';
  }

  // 3. Check if user already exists in directory (if provided)
  if (users) {
    const existing = users.find((u) => u.email.toLowerCase() === normalized);
    if (existing) {
      if (existing.role === 'supervisor') return 'directeur_these';
      if (existing.role === 'structure_director') return 'directeur_structure';
      if (existing.role === 'candidate') return 'candidat';
      return existing.role;
    }
  }

  // 4. Default for all candidate / student emails
  return 'candidat';
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Directory of users
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('gcd_users_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return KNOWN_USERS;
  });

  // Current logged in user (starts with default demo candidate, or saved)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gcd_current_user_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return KNOWN_USERS[0]; // Youssef El Amrani by default
  });

  const [currentView, setCurrentView] = useState<'catalogue' | 'register_candidat' | 'dashboard'>('dashboard');

  // Topics
  const [topics, setTopics] = useState<ThesisTopic[]>(() => {
    const saved = localStorage.getItem('gcd_topics_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_TOPICS;
  });

  // Applications
  const [applications, setApplications] = useState<CandidateApplication[]>(() => {
    const saved = localStorage.getItem('gcd_applications_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_APPLICATIONS;
  });

  // Documents
  const [documents, setDocuments] = useState<CandidateDocument[]>(() => {
    const saved = localStorage.getItem('gcd_documents_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_DOCUMENTS;
  });

  // Re-registrations
  const [reRegistrations, setReRegistrations] = useState<ReRegistration[]>(() => {
    const saved = localStorage.getItem('gcd_rereg_v2');
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
    localStorage.setItem('gcd_users_v2', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gcd_current_user_v2', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gcd_current_user_v2');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gcd_topics_v2', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('gcd_applications_v2', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('gcd_documents_v2', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('gcd_rereg_v2', JSON.stringify(reRegistrations));
  }, [reRegistrations]);

  // Ensure pure clean white theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Automatic role detection function
  const detectRoleFromEmail = (email: string): Role => {
    return resolveRoleFromEmail(email, registeredUsers);
  };

  // Login with institutional email - automatically grants role (or honors explicit role selection)
  const loginWithEmail = (email: string, explicitRole?: Role) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) {
      return { success: false, role: 'candidat' as Role, message: 'Veuillez saisir une adresse email valide.' };
    }

    let determinedRole = explicitRole || resolveRoleFromEmail(normalized, registeredUsers);
    if (determinedRole === 'supervisor') determinedRole = 'directeur_these';
    if (determinedRole === 'structure_director') determinedRole = 'directeur_structure';
    if (determinedRole === 'candidate') determinedRole = 'candidat';

    let matchedUser = registeredUsers.find((u) => u.email.toLowerCase() === normalized);

    if (!matchedUser) {
      // Auto-provision user account with determined role
      const prefix = normalized.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = prefix
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      matchedUser = {
        id: `user-${Date.now().toString(36)}`,
        name: determinedRole === 'directeur_these' ? `Pr. ${formattedName}` : formattedName,
        email: normalized,
        role: determinedRole,
        establishment: 'FST Fès',
        laboratory:
          determinedRole === 'directeur_these'
            ? 'Laboratoire LISAC'
            : determinedRole === 'directeur_structure'
            ? 'Centre d’Études Doctorales (CED)'
            : undefined,
      };

      setRegisteredUsers((prev) => [...prev, matchedUser!]);
    } else {
      // Synchronize existing user role if different
      if (matchedUser.role !== determinedRole) {
        matchedUser = { ...matchedUser, role: determinedRole };
        setRegisteredUsers((prev) =>
          prev.map((u) => (u.id === matchedUser!.id ? matchedUser! : u))
        );
      }
    }

    setCurrentUser(matchedUser);
    setCurrentView('dashboard');
    showToast(`Connexion réussie : ${getRoleLabel(determinedRole)}`);
    return { success: true, role: determinedRole, message: 'Connexion réussie' };
  };

  // Dedicated Candidate Registration
  const registerCandidate = (data: {
    email: string;
    nom: string;
    prenom: string;
    phone: string;
    cin: string;
  }) => {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if email already registered
    const exists = registeredUsers.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return { success: false, message: 'Cette adresse email est déjà enregistrée. Veuillez vous connecter.' };
    }

    const newCandidate: User = {
      id: `cand-${Date.now().toString(36)}`,
      name: `${data.prenom.trim()} ${data.nom.trim()}`,
      firstName: data.prenom.trim(),
      lastName: data.nom.trim(),
      email: normalizedEmail,
      role: 'candidat',
      phone: data.phone.trim(),
      cin: data.cin.trim().toUpperCase(),
      establishment: 'FST Fès',
    };

    setRegisteredUsers((prev) => [...prev, newCandidate]);
    setCurrentUser(newCandidate);
    setCurrentView('dashboard');
    showToast(`Compte Candidat créé avec succès ! Bienvenue ${newCandidate.name}`);
    return { success: true, message: 'Inscription finalisée' };
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Vous avez été déconnecté.');
  };

  // Immediate role switcher for seamless navigation across all 3 dashboards
  const switchRole = (targetRole: Role) => {
    let normalizedRole: Role = targetRole;
    if (targetRole === 'supervisor') normalizedRole = 'directeur_these';
    if (targetRole === 'structure_director') normalizedRole = 'directeur_structure';
    if (targetRole === 'candidate') normalizedRole = 'candidat';

    // Find existing user in registeredUsers or KNOWN_USERS
    const targetUser =
      registeredUsers.find((u) => u.role === normalizedRole || u.role === targetRole) ||
      KNOWN_USERS.find((u) => u.role === normalizedRole || u.role === targetRole);

    if (targetUser) {
      setCurrentUser(targetUser);
      setCurrentView('dashboard');
      showToast(`Espace actif : ${getRoleLabel(normalizedRole)} (${targetUser.name})`);
    } else {
      const fallbackUser: User = {
        id: `user-${Date.now().toString(36)}`,
        name:
          normalizedRole === 'directeur_these'
            ? 'Pr. Karim Bennani'
            : normalizedRole === 'directeur_structure'
            ? 'Direction de Structure CED'
            : 'Candidat Doctorant',
        email:
          normalizedRole === 'directeur_these'
            ? 'supervisor@usmba.ac.ma'
            : normalizedRole === 'directeur_structure'
            ? 'structure@usmba.ac.ma'
            : 'candidat@usmba.ac.ma',
        role: normalizedRole,
        establishment: 'FST Fès',
        laboratory: normalizedRole === 'directeur_these' ? 'Laboratoire LISAC' : undefined,
      };
      setRegisteredUsers((prev) => [...prev, fallbackUser]);
      setCurrentUser(fallbackUser);
      setCurrentView('dashboard');
      showToast(`Espace actif : ${getRoleLabel(normalizedRole)}`);
    }
  };

  // Topics
  const addTopic = (newTopicData: Omit<ThesisTopic, 'id' | 'createdAt' | 'slotsTaken' | 'structureValidationStatus'>) => {
    const newTopic: ThesisTopic = {
      ...newTopicData,
      id: `th-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().split('T')[0],
      slotsTaken: 0,
      structureValidationStatus: 'en_examen', // Requires structure approval
    };
    setTopics((prev) => [newTopic, ...prev]);
    showToast('Nouveau sujet de thèse créé et soumis pour validation par la structure.');
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
    showToast('Sujet de thèse mis à jour avec succès.');
  };

  const approveTopicStructure = (topicId: string, feedback?: string) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              structureValidationStatus: 'approuve',
              status: 'valide',
              structureFeedback: feedback || 'Sujet validé et approuvé par la direction de la structure de recherche.',
            }
          : t
      )
    );
    showToast('Sujet de thèse approuvé au niveau de la structure de recherche.');
  };

  const rejectTopicStructure = (topicId: string, feedback?: string) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              structureValidationStatus: 'rejete',
              status: 'cloture',
              structureFeedback: feedback || 'Sujet non retenu par la commission de la structure.',
            }
          : t
      )
    );
    showToast('Sujet de thèse refusé par la structure.');
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
    }
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

    const candidateName = details?.nom && details?.prenom
      ? `${details.prenom.trim()} ${details.nom.trim()}`
      : currentUser.name;

    const newApp: CandidateApplication = {
      id: `app-${Date.now().toString(36)}`,
      topicId: targetTopic.id,
      topicTitle: targetTopic.title,
      candidateId: currentUser.id,
      candidateName,
      candidateEmail,
      candidatePhone: details?.phone || currentUser.phone,
      candidateCin: details?.cin || currentUser.cin,
      etablissementOrigine: details?.etablissementOrigine || currentUser.etablissementOrigine || 'Université Sidi Mohamed Ben Abdellah',
      diplomeOrigine: details?.diplomeOrigine || currentUser.diplomeOrigine || 'Master de Recherche',
      establishment: targetTopic.establishment,
      laboratory: targetTopic.laboratory,
      supervisorName: targetTopic.supervisorName,
      supervisorId: targetTopic.supervisorId,
      status: 'soumis',
      currentStep: 1, // Step 1: Dossier soumis
      submittedDate: new Date().toISOString().split('T')[0],
      notes: notes || 'Candidature initiale transmise avec succès.',
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

    // Update slots
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, slotsTaken: t.slotsTaken + 1 } : t))
    );

    showToast('Candidature soumise avec succès (Étape 1 : Dossier soumis)');
  };

  // Allow candidate to delete their application
  const deleteApplication = (appId: string) => {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;

    setApplications((prev) => prev.filter((a) => a.id !== appId));

    // Release slot on topic
    if (target.topicId) {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === target.topicId ? { ...t, slotsTaken: Math.max(0, t.slotsTaken - 1) } : t
        )
      );
    }

    showToast('Candidature supprimée avec succès.');
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

  // Documents management with webcam scan and upload support
  const uploadCandidateDocument = (
    type: DocumentType,
    fileName: string,
    fileSize = '1.8 Mo',
    dataUrl?: string,
    captureMethod: 'camera' | 'upload' = 'upload'
  ) => {
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
      // Replace existing document of same type or add
      const filtered = prev.filter(
        (d) => !(d.candidateEmail.toLowerCase() === currentUser.email.toLowerCase() && d.type === type)
      );
      return [newDoc, ...filtered];
    });

    showToast(`Pièce justificative ${captureMethod === 'camera' ? 'scannée par caméra' : 'téléversée'} : ${titles[type]}`);
  };

  const deleteCandidateDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    showToast('Document retiré.');
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
        logout,
        detectRoleFromEmail,
        switchRole,
        topics,
        addTopic,
        updateTopic,
        approveTopicStructure,
        rejectTopicStructure,
        applications,
        addApplication,
        deleteApplication,
        updateApplicationProgress,
        currentCandidateApp,
        documents,
        uploadCandidateDocument,
        deleteCandidateDocument,
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
    case 'candidate':
      return 'Candidat / Doctorant';
    case 'directeur_these':
    case 'supervisor':
      return 'Directeur de Thèse';
    case 'directeur_structure':
    case 'structure_director':
      return 'Directeur de Structure (Admin)';
    default:
      return 'Utilisateur';
  }
}
