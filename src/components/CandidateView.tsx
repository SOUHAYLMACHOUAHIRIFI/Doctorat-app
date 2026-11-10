import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ThesisTopic, DocumentType, ApplicationStep, User, CandidateDocument } from '../types';
import {
  Search,
  ArrowRight,
  CheckCircle2,
  Check,
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  CreditCard,
  GraduationCap,
  FileCheck,
  Building2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Eye,
  User as UserIcon,
  Phone,
  Mail,
  Save,
  Lock,
  Plus,
} from 'lucide-react';
import { ESTABLISHMENTS } from '../data/mockData';
import { DocumentScannerModal } from './DocumentScannerModal';

interface CandidateViewProps {
  onOpenApply: (topic: ThesisTopic) => void;
  onOpenReReg: () => void;
}

export const CandidateView: React.FC<CandidateViewProps> = ({ onOpenApply, onOpenReReg }) => {
  const {
    topics,
    currentCandidateApp,
    candidateApplications,
    currentCandidateReReg,
    currentUser,
    applications,
    deleteApplication,
    documents,
    uploadCandidateDocument,
    deleteCandidateDocument,
    updateUserProfile,
    openAttachment,
    showToast,
  } = useApp();

  // Wizard Tab: 1. documents & profil -> 2. catalogue -> 3. suivi
  const [activeStep, setActiveStep] = useState<'documents' | 'catalogue' | 'suivi'>('documents');
  const [previewCatalogueWithoutDocs, setPreviewCatalogueWithoutDocs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('Tous');

  // Candidate Profile form state in Step 1
  const [profileNom, setProfileNom] = useState(currentUser?.lastName || currentUser?.name?.split(' ').slice(1).join(' ') || '');
  const [profilePrenom, setProfilePrenom] = useState(currentUser?.firstName || currentUser?.name?.split(' ')[0] || '');
  const [profileCin, setProfileCin] = useState(currentUser?.cin || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileEstablishment, setProfileEstablishment] = useState(
    currentUser?.etablissementOrigine || currentUser?.establishment || 'FST Fès'
  );
  const [profileDiplome, setProfileDiplome] = useState(
    currentUser?.diplomeOrigine || 'Master de Recherche en Informatique & IA'
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Scanner modal state
  const [scanningDocType, setScanningDocType] = useState<DocumentType | null>(null);
  const [scanningDocTitle, setScanningDocTitle] = useState<string>('');

  // Confirmation state for deleting application
  const [confirmDeleteAppId, setConfirmDeleteAppId] = useState<string | null>(null);

  // Mandatory 4 document requirements (Baccalauréat, Relevés de notes, Diplôme, CIN)
  const REQUIRED_DOCS: { type: DocumentType; label: string; description: string; icon: any }[] = [
    {
      type: 'baccalaureat',
      label: 'Baccalauréat',
      description: 'Diplôme du Baccalauréat certifié conforme',
      icon: GraduationCap,
    },
    {
      type: 'releve_notes',
      label: 'Relevés de notes universitaires',
      description: 'Relevés de notes officiels de Licence et Master',
      icon: FileText,
    },
    {
      type: 'diplomes',
      label: 'Diplôme (Licence / Master / Ingénieur)',
      description: 'Attestations & Diplômes universitaires',
      icon: FileCheck,
    },
    {
      type: 'cin',
      label: 'Carte d’Identité Nationale (CIN)',
      description: 'Scan recto/verso net de la CIN en cours de validité',
      icon: CreditCard,
    },
  ];

  // User documents reliably scoped
  const candidateDocs = useMemo(() => {
    if (!currentUser) return [];
    return documents.filter(
      (d) =>
        !d.candidateEmail ||
        d.candidateEmail.toLowerCase() === currentUser.email.toLowerCase() ||
        d.candidateId === currentUser.id
    );
  }, [documents, currentUser]);

  // Group all candidate documents by mandatory category
  const docsGroupedByType = useMemo(() => {
    const map: Record<DocumentType, CandidateDocument[]> = {
      baccalaureat: [],
      releve_notes: [],
      diplomes: [],
      cin: [],
    };
    candidateDocs.forEach((d) => {
      const rawType = (d.type || d.typeCode || '').toLowerCase();
      let norm: DocumentType = 'releve_notes';
      if (rawType.includes('bac')) norm = 'baccalaureat';
      else if (rawType.includes('note') || rawType.includes('releve')) norm = 'releve_notes';
      else if (rawType.includes('diplom')) norm = 'diplomes';
      else if (rawType.includes('cin')) norm = 'cin';

      if (map[norm] && d.status !== 'A_CORRIGER' && (d.status as string) !== 'rejete') {
        map[norm].push(d);
      }
    });
    return map;
  }, [candidateDocs]);

  const completedCategoriesCount = REQUIRED_DOCS.filter(
    (req) => (docsGroupedByType[req.type] || []).length > 0
  ).length;
  const isDossierComplet = completedCategoriesCount === 4;
  const candidateDocsCount = completedCategoriesCount;
  const totalUploadedDocsCount = candidateDocs.length;

  // Scoped candidatures for current user
  const candidateApps = useMemo(() => {
    if (!currentUser) return [];
    return applications.filter(
      (a) =>
        (a.candidateEmail && a.candidateEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        a.candidateId === currentUser.id
    );
  }, [applications, currentUser]);

  const candidateAppsCount = candidateApps.length;
  const hasReachedMaxApplications = candidateAppsCount >= 3;

  // Sync profile fields if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileNom(currentUser.lastName || currentUser.name.split(' ').slice(1).join(' ') || '');
      setProfilePrenom(currentUser.firstName || currentUser.name.split(' ')[0] || '');
      setProfileCin(currentUser.cin || '');
      setProfilePhone(currentUser.phone || '');
      setProfileEmail(currentUser.email || '');
      setProfileEstablishment(currentUser.etablissementOrigine || currentUser.establishment || 'FST Fès');
      setProfileDiplome(currentUser.diplomeOrigine || 'Master de Recherche en Informatique & IA');
    }
  }, [currentUser]);

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Scroll to top automatically when active step or selected application changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeStep, selectedAppId]);

  // Filter topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.laboratory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesEstablishment =
        selectedEstablishment === 'Tous' || t.establishment === selectedEstablishment;

      return matchesSearch && matchesEstablishment;
    });
  }, [topics, searchQuery, selectedEstablishment]);

  // Exact 5 Progression Steps requested:
  // 1. Pièces scannées ➔ 2. Candidature soumise ➔ 3. Évaluation Directeur ➔ 4. Validation Structure ➔ 5. Admission
  const PROGRESS_STEPS: { step: ApplicationStep; label: string; desc: string }[] = [
    { step: 1, label: '1. Pièces scannées', desc: '4 pièces numérisées et certifiées' },
    { step: 2, label: '2. Candidature soumise', desc: 'Dossier transmis au directeur de thèse' },
    { step: 3, label: '3. Évaluation Directeur', desc: 'Avis motivé et appréciation pédagogique' },
    { step: 4, label: '4. Validation Structure', desc: 'Examen par la commission CED' },
    { step: 5, label: '5. Admission', desc: 'Inscription doctorale définitive validée' },
  ];

  const activeApp = useMemo(() => {
    if (selectedAppId) {
      const found = candidateApps.find((a) => a.id === selectedAppId);
      if (found) return found;
    }
    return candidateApps[0] || null;
  }, [candidateApps, selectedAppId]);



  // Current step calculation for the active application:
  let currentStep: number = 1;
  if (activeApp) {
    const sStr = String(activeApp.status || '').toUpperCase();
    if (sStr === 'ADMIS' || sStr === 'CED_APPROVED' || sStr === 'ACCEPTED' || sStr === 'VALIDE_STRUCTURE') {
      currentStep = 5;
    } else if (sStr === 'SUPERVISOR_APPROVED' || sStr === 'EVALUATED' || sStr === 'AVIS_FAVORABLE') {
      currentStep = 4;
    } else if (sStr === 'AVIS_DEFAVORABLE') {
      currentStep = 3;
    } else if (sStr === 'SOUMIS' || sStr === 'SUBMITTED' || sStr === 'A_CORRIGER') {
      currentStep = 2;
    } else if (typeof activeApp.currentStep === 'number') {
      currentStep = activeApp.currentStep;
    }
  } else if (isDossierComplet) {
    currentStep = 1;
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileNom.trim() || !profilePrenom.trim()) {
      showToast('Le nom et le prénom sont obligatoires.');
      return;
    }
    if (!profileCin.trim()) {
      showToast('Le code CIN est obligatoire.');
      return;
    }
    if (!profilePhone.trim()) {
      showToast('Le numéro de téléphone est obligatoire.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        name: `${profilePrenom.trim()} ${profileNom.trim()}`,
        firstName: profilePrenom.trim(),
        lastName: profileNom.trim(),
        cin: profileCin.trim().toUpperCase(),
        phone: profilePhone.trim(),
        etablissementOrigine: profileEstablishment,
        diplomeOrigine: profileDiplome.trim(),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const openUploadModal = (type: DocumentType, title: string) => {
    setScanningDocType(type);
    setScanningDocTitle(title);
  };

  const handleSaveUploadedDocument = async (
    type: DocumentType,
    fileName: string,
    fileSize: string,
    dataUrl: string,
    method: 'upload',
    customTitle?: string
  ) => {
    await uploadCandidateDocument(type, fileName, fileSize, dataUrl, method, customTitle);
    setScanningDocType(null);
  };

  const handleTopicApplyAttempt = (topic: ThesisTopic) => {
    if (!currentUser) {
      onOpenApply(topic);
      return;
    }
    if (!isDossierComplet) {
      showToast('Étape 1 obligatoire : Veuillez d’abord numériser ou importer vos 4 documents.');
      setActiveStep('documents');
      return;
    }
    if (hasReachedMaxApplications) {
      showToast('Vous avez atteint la limite maximale de 3 candidatures autorisées.');
      return;
    }
    onOpenApply(topic);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-white text-neutral-900">
      {/* Candidate Profile Header Card */}
      {currentUser && (
        <div className="p-4 sm:p-5 border border-neutral-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                Espace Candidat Doctorat
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-xs text-neutral-600 font-mono truncate max-w-[220px] sm:max-w-none">
                {currentUser.email}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
              {currentUser.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
              {currentUser.cin && (
                <span>
                  CIN : <strong className="font-mono text-neutral-800">{currentUser.cin}</strong>
                </span>
              )}
              {currentUser.phone && (
                <>
                  <span className="text-neutral-300 hidden sm:inline">·</span>
                  <span>
                    Tél : <strong className="font-mono text-neutral-800">{currentUser.phone}</strong>
                  </span>
                </>
              )}
              <span className="text-neutral-300 hidden sm:inline">·</span>
              <span>{currentUser.establishment || 'FST Fès'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenReReg}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors whitespace-nowrap shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réinscription annuelle</span>
            </button>
          </div>
        </div>
      )}

      {/* CHRONOLOGICAL CANDIDATE WIZARD STEPS NAVIGATION */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-2 sm:p-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {/* STEP 1: PROFIL & SCAN DES PIÈCES OBLIGATOIRES (EN PREMIER) */}
          <button
            type="button"
            onClick={() => setActiveStep('documents')}
            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              activeStep === 'documents'
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : isDossierComplet
                ? 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-300'
                : 'bg-white text-neutral-800 border-amber-300 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeStep === 'documents'
                    ? 'bg-white text-neutral-900'
                    : isDossierComplet
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isDossierComplet ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate">Étape 1 : Profil & 4 Pièces</div>
                <div
                  className={`text-[10px] truncate ${
                    activeStep === 'documents' ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {isDossierComplet ? 'Pièces 4/4 certifiées' : 'Obligatoire en premier'}
                </div>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-1 ${
                activeStep === 'documents'
                  ? 'bg-white/20 text-white'
                  : isDossierComplet
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {candidateDocsCount}/4 pièces
            </span>
          </button>

          {/* STEP 2: CONSULTATION & RECHERCHE DES SUJETS DE THÈSE */}
          <button
            type="button"
            onClick={() => {
              setActiveStep('catalogue');
              if (!isDossierComplet) {
                setPreviewCatalogueWithoutDocs(false);
              }
            }}
            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              activeStep === 'catalogue'
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeStep === 'catalogue'
                    ? 'bg-white text-neutral-900'
                    : isDossierComplet
                    ? 'bg-neutral-100 text-neutral-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isDossierComplet ? '2' : <Lock className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate flex items-center gap-1.5">
                  <span>Étape 2 : Sujets de Thèse</span>
                  {!isDossierComplet && (
                    <span className={`text-[9px] font-bold px-1 rounded ${activeStep === 'catalogue' ? 'bg-amber-400 text-neutral-900' : 'bg-amber-100 text-amber-800'}`}>
                      Verrouillé
                    </span>
                  )}
                </div>
                <div
                  className={`text-[10px] truncate ${
                    activeStep === 'catalogue' ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {isDossierComplet ? 'Recherche & Consultation' : 'Débloqué après 4/4 pièces'}
                </div>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-1 ${
                activeStep === 'catalogue'
                  ? 'bg-white/20 text-white'
                  : isDossierComplet
                  ? 'bg-neutral-100 text-neutral-700'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {isDossierComplet ? `${filteredTopics.length} sujets` : '🔒 4 pièces requises'}
            </span>
          </button>

          {/* STEP 3: POSTULATION & SUIVI DE PROGRESSION */}
          <button
            type="button"
            onClick={() => setActiveStep('suivi')}
            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              activeStep === 'suivi'
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeStep === 'suivi'
                    ? 'bg-white text-neutral-900'
                    : activeApp
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {activeApp ? <Check className="w-3.5 h-3.5" /> : '3'}
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate">Étape 3 : Suivi Progression</div>
                <div
                  className={`text-[10px] truncate ${
                    activeStep === 'suivi' ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {activeApp ? `Étape ${currentStep}/5 (${candidateAppsCount}/3)` : 'Suivi candidature'}
                </div>
              </div>
            </div>

            {activeApp ? (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-1 ${
                  activeStep === 'suivi'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {candidateAppsCount} dossier{candidateAppsCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-[10px] text-neutral-400 shrink-0 ml-1">
                En attente
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ÉTAPE 1 : PROFIL & SCAN DES PIÈCES OBLIGATOIRES (EN PREMIER) */}
      {/* ========================================================================= */}
      {activeStep === 'documents' && (
        <div className="space-y-6">
          {/* Status banner with progress bar */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDossierComplet
                ? 'bg-white border-neutral-200 shadow-xs'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isDossierComplet ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Dossier complet à 100% (4/4 pièces certifiées scannées)</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Étape 1 obligatoire : Enregistrez votre profil et scannez vos 4 documents</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
                  {isDossierComplet
                    ? 'Vos 4 pièces sont numérisées et certifiées conformes. Vous pouvez maintenant passer à l’Étape 2 pour sélectionner votre sujet de thèse et postuler.'
                    : 'Avant de pouvoir postuler à un sujet de recherche, le règlement doctoral de l’USMBA exige obligatoirement le scan de vos 4 pièces : Baccalauréat, Relevés de notes, Diplôme et Carte CIN.'}
                </p>
              </div>

              {isDossierComplet ? (
                <button
                  type="button"
                  onClick={() => setActiveStep('catalogue')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs shrink-0"
                >
                  <span>Passer à l’Étape 2 (Sujets de Thèse)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="text-xs font-bold text-amber-900 bg-white border border-amber-200 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0 shadow-2xs">
                  {candidateDocsCount} sur 4 pièces scannées
                </div>
              )}
            </div>

            {/* Visual completion progress bar */}
            <div className="mt-4 pt-3 border-t border-neutral-200/60">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1.5">
                <span>Progression de l'Étape 1 (Documents) :</span>
                <span className="font-bold text-neutral-900 font-mono">
                  {Math.round((candidateDocsCount / 4) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isDossierComplet ? 'bg-emerald-600' : 'bg-neutral-900'
                  }`}
                  style={{ width: `${(candidateDocsCount / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Section A: Profil Candidat */}
          {currentUser && (
            <div className="p-5 sm:p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-neutral-800" />
                  <h3 className="text-sm font-bold text-neutral-900">
                    A. Profil & Coordonnées du Candidat
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Compte : {currentUser.email}
                </span>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nom de famille *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileNom}
                      onChange={(e) => setProfileNom(e.target.value)}
                      placeholder="Ex: El Amrani"
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={profilePrenom}
                      onChange={(e) => setProfilePrenom(e.target.value)}
                      placeholder="Ex: Youssef"
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Code CIN *
                    </label>
                    <div className="relative">
                      <CreditCard className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={profileCin}
                        onChange={(e) => setProfileCin(e.target.value.toUpperCase())}
                        placeholder="Ex: CD654321"
                        className="w-full pl-9 pr-3 py-2 text-xs uppercase font-mono bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Téléphone *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+212 6..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Établissement d'origine
                    </label>
                    <select
                      value={profileEstablishment}
                      onChange={(e) => setProfileEstablishment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    >
                      {ESTABLISHMENTS.map((est) => (
                        <option key={est} value={est}>
                          {est}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Dernier diplôme préparé / obtenu
                    </label>
                    <input
                      type="text"
                      value={profileDiplome}
                      onChange={(e) => setProfileDiplome(e.target.value)}
                      placeholder="Ex: Master Recherche en IA"
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingProfile ? 'Enregistrement...' : 'Enregistrer mon profil'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section B: 4 Documents Grid */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neutral-800" />
                  <span>B. Dépôt des 4 Pièces Justificatives Obligatoires</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Importez vos documents certifiés au format PDF ou Image (JPEG, PNG).
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-xl border self-start sm:self-auto ${
                isDossierComplet
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-neutral-100 text-neutral-700 border-neutral-200'
              }`}>
                {candidateDocsCount} / 4 pièces enregistrées
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REQUIRED_DOCS.map((req) => {
                const typeDocs = docsGroupedByType[req.type] || [];
                const hasDocs = typeDocs.length > 0;
                const IconComp = req.icon;

                return (
                  <div
                    key={req.type}
                    className={`p-5 rounded-2xl border bg-white flex flex-col justify-between transition-all shadow-xs ${
                      hasDocs
                        ? 'border-neutral-200 hover:border-neutral-300'
                        : 'border-dashed border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Document Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              hasDocs
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-neutral-900">{req.label}</h4>
                            <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                              {req.description}
                            </p>
                          </div>
                        </div>

                        {hasDocs ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" />
                            <span>{typeDocs.length} fichier{typeDocs.length > 1 ? 's' : ''}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                            Obligatoire
                          </span>
                        )}
                      </div>

                      {/* Multiple Documents List */}
                      {hasDocs && (
                        <div className="space-y-2 pt-1">
                          {typeDocs.map((doc, docIdx) => (
                            <div
                              key={doc.id || docIdx}
                              className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2"
                            >
                              <div className="flex items-center gap-3">
                                {doc.dataUrl && doc.dataUrl.startsWith('data:image/') ? (
                                  <img
                                    src={doc.dataUrl}
                                    alt={doc.title}
                                    onClick={() =>
                                      openAttachment({
                                        title: doc.title,
                                        subtitle: `Document certifié — ${doc.fileName}`,
                                        content: `Document certifié conforme pour le candidat ${currentUser?.name} (${currentUser?.cin}).\n\nFichier : ${doc.fileName}\nTaille : ${doc.fileSize}\nDéposé le : ${doc.uploadedAt}`,
                                        author: currentUser?.name || 'Candidat',
                                        date: doc.uploadedAt,
                                        dataUrl: doc.dataUrl,
                                      })
                                    }
                                    className="w-10 h-10 object-cover rounded-lg border border-neutral-300 shadow-xs shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-neutral-200 flex flex-col items-center justify-center text-[10px] font-bold text-neutral-700 font-mono shrink-0 border border-neutral-300">
                                    <span>PDF</span>
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-mono text-neutral-900 font-bold truncate max-w-[150px] sm:max-w-[200px]">
                                      {doc.title || doc.fileName}
                                    </span>
                                    <span className="text-[10px] text-neutral-600 font-semibold bg-white border border-neutral-200 px-1.5 py-0.5 rounded-md shrink-0">
                                      {doc.fileSize}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5 truncate">
                                    <span className="font-mono truncate">{doc.fileName}</span>
                                    <span>·</span>
                                    <span>{doc.uploadedAt}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1.5 text-[11px] text-neutral-600 border-t border-neutral-200">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openAttachment({
                                      title: doc.title,
                                      subtitle: `Pièce justificative - ${doc.fileName}`,
                                      content: `Pièce certifiée conforme pour le candidat ${currentUser?.name} (CIN: ${currentUser?.cin}).\n\nFichier : ${doc.fileName}\nTaille : ${doc.fileSize}\nValidé au guichet numérique USMBA.`,
                                      author: currentUser?.name || 'Candidat',
                                      date: doc.uploadedAt,
                                      dataUrl: doc.dataUrl,
                                    })
                                  }
                                  className="text-neutral-900 font-semibold underline flex items-center gap-1 hover:text-black"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Consulter le fichier</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deleteCandidateDocument(doc.id)}
                                  className="text-rose-600 hover:text-rose-700 font-medium text-xs flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Retirer</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Trigger File Upload Modal (Add another or initial upload) */}
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => openUploadModal(req.type, req.label)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                          hasDocs
                            ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                      >
                        {hasDocs ? (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Ajouter un document ({req.label})</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Téléverser cette pièce (PDF / Image)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 2 : CONSULTATION & RECHERCHE DES SUJETS DE THÈSE */}
      {/* ========================================================================= */}
      {activeStep === 'catalogue' && (
        <div className="space-y-6">
          {/* EXPLICIT LOCK SCREEN IF STEP 1 (4 PIECES) IS INCOMPLETE */}
          {!isDossierComplet && !previewCatalogueWithoutDocs ? (
            <div className="p-8 sm:p-12 border-2 border-dashed border-amber-300 rounded-3xl bg-amber-50/60 text-center space-y-5 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-8 h-8 text-amber-800" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-md border border-amber-200">
                  Accès Réservé · Étape 1 Non Complétée
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mt-2">
                  Étape 2 Verrouillée : 4 Pièces Justificatives Obligatoires
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed max-w-lg mx-auto">
                  Conformément au règlement du cycle doctoral de l'Université Sidi Mohamed Ben Abdellah (USMBA), vous devez obligatoirement numériser vos <strong>4 pièces</strong> à l'<strong>Étape 1</strong> (Baccalauréat, Relevés de notes, Diplôme et Carte CIN) avant de pouvoir postuler à un sujet de thèse.
                </p>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-amber-900 shadow-2xs mt-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>État actuel de vos pièces : {candidateDocsCount} sur 4 scannées</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep('documents')}
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Aller à l'Étape 1 pour scanner mes 4 pièces</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewCatalogueWithoutDocs(true)}
                  className="w-full sm:w-auto px-4 py-3 bg-white border border-neutral-300 text-neutral-700 hover:text-neutral-900 rounded-xl text-xs font-medium hover:bg-neutral-50 transition-colors"
                >
                  Aperçu en lecture seule des sujets (postulation bloquée)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Banner depending on status */}
              {!isDossierComplet ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5 text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong>Mode consultation restreint ({candidateDocsCount}/4 pièces) :</strong> Vous
                      devez obligatoirement scanner vos 4 pièces pour débloquer la postulation.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep('documents')}
                    className="w-full sm:w-auto px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs"
                  >
                    Scanner mes 4 pièces (Étape 1)
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Dossier 4/4 complet et certifié :</strong> Choisissez votre sujet ci-dessous et cliquez sur "Postuler". Vos documents y seront automatiquement attachés.
                    </span>
                  </div>
                </div>
              )}

              {/* Quota & Maximum Applications Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-neutral-700 shrink-0" />
                  <span className="text-neutral-700">
                    Quota de candidatures : <strong className="text-neutral-900 font-mono">{candidateAppsCount} / 3 autorisées</strong>
                  </span>
                </div>
                {hasReachedMaxApplications ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Vous avez atteint la limite maximale de 3 candidatures autorisées
                  </span>
                ) : (
                  <span className="text-neutral-500">
                    Il vous reste <strong className="text-neutral-900">{3 - candidateAppsCount}</strong> candidature{3 - candidateAppsCount > 1 ? 's' : ''} possible{3 - candidateAppsCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

          {/* Search Bar & Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par mot-clé, titre, laboratoire ou encadrant..."
                className="w-full pl-10 sm:pl-12 pr-12 py-3 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl shadow-xs focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Establishment filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-neutral-400 mr-1 shrink-0 hidden sm:inline">Établissement :</span>
              {['Tous', ...ESTABLISHMENTS].map((est) => {
                const isSelected = selectedEstablishment === est;
                return (
                  <button
                    key={est}
                    onClick={() => setSelectedEstablishment(est)}
                    className={`px-3 py-1.5 sm:py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-neutral-900 text-white font-medium'
                        : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {est}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Topics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="tabular-nums font-medium text-neutral-800">
                {filteredTopics.length} sujet{filteredTopics.length > 1 ? 's' : ''} de thèse disponible{filteredTopics.length > 1 ? 's' : ''}
              </span>
              <span>Année Universitaire 2026-2027 · USMBA</span>
            </div>

            {filteredTopics.length === 0 ? (
              <div className="py-12 sm:py-16 text-center border border-dashed border-neutral-200 rounded-2xl bg-white px-4">
                <p className="text-sm text-neutral-500">Aucun sujet ne correspond à vos critères.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedEstablishment('Tous');
                  }}
                  className="mt-3 text-xs font-semibold text-neutral-900 underline underline-offset-4"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {filteredTopics.map((topic) => {
                  const alreadyApplied = applications.some(
                    (a) =>
                      a.topicId === topic.id &&
                      a.candidateEmail.toLowerCase() === currentUser?.email.toLowerCase()
                  );
                  const isAvailable = topic.slotsTaken < topic.slotsTotal && topic.status !== 'cloture';

                  return (
                    <article
                      key={topic.id}
                      className="p-4 sm:p-6 hover:bg-neutral-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight leading-snug">
                          {topic.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-neutral-600">
                          <span className="font-semibold text-neutral-900">{topic.establishment}</span>
                          <span aria-hidden="true" className="text-neutral-300">
                            ·
                          </span>
                          <span>{topic.laboratory}</span>
                          <span aria-hidden="true" className="text-neutral-300">
                            ·
                          </span>
                          <span>Dir. {topic.supervisorName}</span>
                          <span aria-hidden="true" className="text-neutral-300">
                            ·
                          </span>
                          <span className="text-emerald-700 font-semibold">Validé structure CED</span>
                        </div>

                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                          {topic.summary}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 pt-1">
                          {topic.keywords.map((k, idx) => (
                            <span key={k}>
                              {k}
                              {idx < topic.keywords.length - 1 && (
                                <span className="ml-1.5 text-neutral-300">/</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0 pt-2 md:pt-0 w-full sm:w-auto">
                        {alreadyApplied ? (
                          <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            <span>Candidature transmise</span>
                          </div>
                        ) : hasReachedMaxApplications ? (
                          <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-1">
                            <button
                              type="button"
                              disabled
                              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 text-xs font-semibold rounded-xl bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed shadow-none"
                              title="Vous avez atteint la limite maximale de 3 candidatures autorisées"
                            >
                              <Lock className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Limite atteinte (3/3)</span>
                            </button>
                            <span className="text-[10px] text-amber-700 font-medium text-center sm:text-right">
                              Max 3 candidatures autorisées
                            </span>
                          </div>
                        ) : isAvailable ? (
                          <button
                            type="button"
                            onClick={() => handleTopicApplyAttempt(topic)}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shadow-xs ${
                              isDossierComplet
                                ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            {!isDossierComplet && <Lock className="w-3.5 h-3.5 text-amber-700" />}
                            <span>
                              {isDossierComplet ? 'Postuler (Dossier prêt)' : 'Bloqué (4 pièces requises)'}
                            </span>
                            {isDossierComplet && <ArrowRight className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">Places déjà pourvues</span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 3 : POSTULATION & SUIVI DE LA PROGRESSION */}
      {/* ========================================================================= */}
      {activeStep === 'suivi' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Dossiers Switcher if multiple applications (1 to 3) */}
          {candidateApps.length > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl">
              <span className="text-xs font-semibold text-neutral-700">
                Vos candidatures actives ({candidateApps.length}/3) :
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {candidateApps.map((app, idx) => {
                  const isSelected = (activeApp?.id === app.id);
                  let stepBadge = 2;
                  const s = String(app.status || '').toUpperCase();
                  if (s === 'ADMIS' || s === 'CED_APPROVED' || s === 'ACCEPTED' || s === 'VALIDE_STRUCTURE') stepBadge = 5;
                  else if (s === 'SUPERVISOR_APPROVED' || s === 'EVALUATED' || s === 'AVIS_FAVORABLE') stepBadge = 4;
                  else if (s === 'AVIS_DEFAVORABLE') stepBadge = 3;
                  else if (typeof app.currentStep === 'number') stepBadge = app.currentStep;

                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedAppId(app.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <span className="font-bold">Choix #{idx + 1}</span>
                      <span className="max-w-[130px] truncate">{app.topicTitle}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        Étape {stepBadge}/5
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeApp ? (
            <div className="p-4 sm:p-6 md:p-8 border border-neutral-200 rounded-2xl bg-white space-y-6 sm:space-y-8 shadow-xs">
              {/* Alert si correction demandée */}
              {activeApp.status === 'a_corriger' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Correction requise par votre directeur de thèse :</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed pl-6">
                    "{activeApp.supervisorFeedback || 'Veuillez renouveler ou vérifier vos pièces scannées.'}"
                  </p>
                  <div className="pl-6 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveStep('documents')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Remplacer / importer à nouveau mes documents à l'Étape 1</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Application Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-100 pb-5">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Dossier de Candidature Doctorale Actif
                  </div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 leading-snug">
                    {activeApp.topicTitle}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 pt-1">
                    <span>{activeApp.establishment}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeApp.laboratory}</span>
                    <span aria-hidden="true">·</span>
                    <span>Directeur : {activeApp.supervisorName}</span>
                    <span aria-hidden="true">·</span>
                    <span>Déposé le {activeApp.submittedDate}</span>
                  </div>
                </div>

                <div className="w-full sm:w-auto pt-2 sm:pt-0">
                  {confirmDeleteAppId === activeApp.id ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <span className="text-xs text-rose-800 font-medium">
                        Confirmer le retrait du dossier ?
                      </span>
                      <div className="flex items-center gap-2 mt-1 sm:mt-0">
                        <button
                          onClick={() => {
                            deleteApplication(activeApp.id);
                            setConfirmDeleteAppId(null);
                          }}
                          className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
                        >
                          Oui, retirer
                        </button>
                        <button
                          onClick={() => setConfirmDeleteAppId(null)}
                          className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteAppId(activeApp.id)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Retirer ma candidature</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Exact 5-Step Progress Bar:
                  1. Pièces scannées ➔ 2. Candidature soumise ➔ 3. Évaluation Directeur ➔ 4. Validation Structure ➔ 5. Admission */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Barre de Progression Officielle (5 Jalons)
                  </h3>
                  <span className="text-xs font-medium text-neutral-600">
                    Statut actuel :{' '}
                    <strong className="text-neutral-900">
                      {PROGRESS_STEPS[currentStep - 1]?.label || 'Candidature soumise'}
                    </strong>{' '}
                    ({currentStep}/5)
                  </span>
                </div>

                {/* DESKTOP TIMELINE */}
                <div className="hidden sm:block relative pt-3 pb-4">
                  <div className="absolute top-7 left-8 right-8 h-1 bg-neutral-100 -z-0" />
                  <div
                    className="absolute top-7 left-8 h-1 bg-neutral-900 transition-all duration-500 -z-0"
                    style={{
                      width: `${
                        currentStep === 5 &&
                        (String(activeApp.status || '').toUpperCase() === 'CED_APPROVED' ||
                          String(activeApp.status || '').toUpperCase() === 'ADMIS' ||
                          String(activeApp.status || '').toUpperCase() === 'ACCEPTED')
                          ? 100
                          : Math.min(100, Math.max(0, ((currentStep - 1) / (PROGRESS_STEPS.length - 1)) * 100))
                      }%`,
                    }}
                  />

                  <div className="grid grid-cols-5 gap-2 relative z-10">
                    {PROGRESS_STEPS.map((s) => {
                      const isCompleted =
                        currentStep > s.step ||
                        (s.step === 5 &&
                          currentStep === 5 &&
                          (String(activeApp.status || '').toUpperCase() === 'CED_APPROVED' ||
                            String(activeApp.status || '').toUpperCase() === 'ADMIS' ||
                            String(activeApp.status || '').toUpperCase() === 'ACCEPTED'));
                      const isCurrent = currentStep === s.step && !isCompleted;

                      return (
                        <div key={s.step} className="flex flex-col items-center text-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted
                                ? 'bg-neutral-900 text-white'
                                : isCurrent
                                ? 'border-2 border-neutral-900 bg-white text-neutral-900 ring-4 ring-neutral-100 shadow-xs'
                                : 'border border-neutral-300 bg-white text-neutral-400'
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4" /> : s.step}
                          </div>
                          <span
                            className={`mt-2.5 text-xs font-semibold ${
                              isCurrent
                                ? 'text-neutral-900'
                                : isCompleted
                                ? 'text-neutral-800'
                                : 'text-neutral-400'
                            }`}
                          >
                            {s.label}
                          </span>
                          <span className="text-[10px] text-neutral-400 hidden md:block mt-0.5 leading-tight">
                            {s.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MOBILE TIMELINE */}
                <div className="block sm:hidden space-y-2 pt-2">
                  {PROGRESS_STEPS.map((s) => {
                    const isCompleted =
                      currentStep > s.step ||
                      (s.step === 5 &&
                        currentStep === 5 &&
                        (String(activeApp.status || '').toUpperCase() === 'CED_APPROVED' ||
                          String(activeApp.status || '').toUpperCase() === 'ADMIS' ||
                          String(activeApp.status || '').toUpperCase() === 'ACCEPTED'));
                    const isCurrent = currentStep === s.step && !isCompleted;

                    return (
                      <div
                        key={s.step}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-neutral-50 border-neutral-900 shadow-xs ring-1 ring-neutral-900'
                            : isCompleted
                            ? 'bg-white border-neutral-200'
                            : 'bg-white border-neutral-100 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCompleted
                              ? 'bg-neutral-900 text-white'
                              : isCurrent
                              ? 'bg-neutral-900 text-white ring-2 ring-neutral-300'
                              : 'border border-neutral-300 text-neutral-400'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold ${
                                isCurrent ? 'text-neutral-900' : 'text-neutral-700'
                              }`}
                            >
                              {s.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-neutral-900 bg-white border border-neutral-300 px-1.5 py-0.5 rounded-md">
                                En cours
                              </span>
                            )}
                            {isCompleted && (
                              <span className="text-[10px] font-medium text-emerald-700">
                                Validé
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 truncate">{s.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feedback from Supervisor */}
              {activeApp.supervisorFeedback && (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
                  <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Avis du Directeur de thèse :</span>
                    </span>
                    {activeApp.supervisorGrade && (
                      <span className="font-mono text-[11px] bg-white border border-neutral-200 px-2 py-0.5 rounded-md text-neutral-800">
                        Appréciation : {activeApp.supervisorGrade}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed pl-5">
                    "{activeApp.supervisorFeedback}"
                  </p>
                </div>
              )}

              {/* Summary table */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Fiche synthétique du dossier
                </div>

                <div className="block sm:hidden border border-neutral-200 rounded-xl bg-white p-4 space-y-3 shadow-xs">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Intitulé Thèse
                    </span>
                    <h4 className="text-xs font-bold text-neutral-900 mt-0.5">
                      {activeApp.topicTitle}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Établissement</span>
                      <span className="font-medium text-neutral-800">
                        {activeApp.establishment}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Laboratoire</span>
                      <span className="font-medium text-neutral-800">
                        {activeApp.laboratory}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Directeur</span>
                      <span className="font-medium text-neutral-800">
                        {activeApp.supervisorName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Progression</span>
                      <span className="font-semibold text-neutral-900">
                        Étape {currentStep}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-xs">
                  <table className="w-full text-left text-xs min-w-[580px]">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3.5">Intitulé Thèse</th>
                        <th className="py-2.5 px-3.5">Établissement & Labo</th>
                        <th className="py-2.5 px-3.5">Directeur</th>
                        <th className="py-2.5 px-3.5">Étape</th>
                        <th className="py-2.5 px-3.5">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-3 px-3.5 font-bold text-neutral-900 max-w-xs">
                          {activeApp.topicTitle}
                        </td>
                        <td className="py-3 px-3.5 text-neutral-700">
                          {activeApp.establishment} · {activeApp.laboratory}
                        </td>
                        <td className="py-3 px-3.5 font-medium text-neutral-800">
                          {activeApp.supervisorName}
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-neutral-900">
                          Étape {currentStep}/5
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                            {activeApp.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center border border-dashed border-neutral-200 rounded-2xl bg-white space-y-4">
              <p className="text-sm text-neutral-600">
                Vous n'avez pas encore de candidature de thèse active.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(isDossierComplet ? 'catalogue' : 'documents')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  {isDossierComplet
                    ? 'Choisir un sujet de thèse (Étape 2)'
                    : 'Numériser mes 4 pièces d’abord (Étape 1)'}
                </button>
              </div>
            </div>
          )}

          {/* Section: Réinscription Annuelle */}
          <div className="p-4 sm:p-6 border border-neutral-200 rounded-2xl bg-white space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Réinscription Annuelle en Doctorat
                </h3>
                <p className="text-xs text-neutral-500">
                  Déposez votre rapport d'activité annuel pour renouveler votre inscription auprès du CED.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenReReg}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Déposer réinscription (Rapport)</span>
              </button>
            </div>

            {currentCandidateReReg ? (
              <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-xl space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-neutral-900">
                    Demande de réinscription en {currentCandidateReReg.year}ème année
                  </span>
                  <span className="text-emerald-700 font-semibold">
                    {currentCandidateReReg.status === 'valide_structure'
                      ? 'Validée par la structure'
                      : currentCandidateReReg.status === 'valide_encadrant'
                      ? 'Avis favorable Encadrant'
                      : 'En cours d’examen'}
                  </span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  {currentCandidateReReg.activityReport.summary}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-neutral-200 text-neutral-500">
                  <div className="flex items-center gap-3">
                    <span>
                      Publications :{' '}
                      <strong className="text-neutral-900">
                        {currentCandidateReReg.activityReport.publicationsCount}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Avancement :{' '}
                      <strong className="text-neutral-900">
                        {currentCandidateReReg.activityReport.progressPercentage}%
                      </strong>
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      openAttachment({
                        title: currentCandidateReReg.activityReport.fileName,
                        subtitle: `Rapport annuel — ${currentCandidateReReg.candidateName}`,
                        content: currentCandidateReReg.activityReport.summary,
                        author: currentCandidateReReg.candidateName,
                        date: currentCandidateReReg.submittedDate,
                      })
                    }
                    className="text-neutral-900 underline font-semibold text-left sm:text-right"
                  >
                    Voir le document PDF
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                Aucun dossier de réinscription annuelle déposé pour l'année en cours.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={scanningDocType !== null}
        docType={scanningDocType}
        docTitle={scanningDocTitle}
        onClose={() => setScanningDocType(null)}
        onSave={handleSaveUploadedDocument}
      />
    </div>
  );
};
