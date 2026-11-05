import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ThesisTopic, DocumentType, ApplicationStep, ApplicationStatus } from '../types';
import {
  Search,
  ArrowRight,
  CheckCircle2,
  Check,
  FileText,
  Upload,
  Camera,
  Trash2,
  RefreshCw,
  CreditCard,
  GraduationCap,
  FileCheck,
  Building2,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Clock,
  Award,
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
    currentCandidateReReg,
    currentUser,
    applications,
    deleteApplication,
    documents,
    uploadCandidateDocument,
    deleteCandidateDocument,
    openAttachment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('Tous');
  const [activeTab, setActiveTab] = useState<'catalogue' | 'suivi' | 'documents'>('catalogue');

  // Scanner modal state
  const [scanningDocType, setScanningDocType] = useState<DocumentType | null>(null);
  const [scanningDocTitle, setScanningDocTitle] = useState<string>('');

  // Confirmation state for deleting application
  const [confirmDeleteAppId, setConfirmDeleteAppId] = useState<string | null>(null);

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

  // Exact 5 progression steps according to requirements:
  // 1. Inscription Dossier ➔ 2. Vérification Pièces ➔ 3. Evaluation Directeur Thèse ➔ 4. Validation Structure ➔ 5. Admission Finale
  const PROGRESS_STEPS: { step: ApplicationStep; label: string; desc: string }[] = [
    { step: 1, label: '1. Inscription Dossier', desc: 'Dépôt du profil et du sujet' },
    { step: 2, label: '2. Vérification Pièces', desc: 'Conformité des 4 scans' },
    { step: 3, label: '3. Evaluation Directeur', desc: 'Avis motivé du directeur de thèse' },
    { step: 4, label: '4. Validation Structure', desc: 'Approbation du conseil du CED' },
    { step: 5, label: '5. Admission Finale', desc: 'Inscription doctorale validée' },
  ];

  const currentStep: number = currentCandidateApp?.currentStep || 0;

  // Documents mandatory types
  const REQUIRED_DOCS: { type: DocumentType; label: string; description: string; icon: any }[] = [
    {
      type: 'baccalaureat',
      label: 'Baccalauréat',
      description: 'Diplôme du Baccalauréat certifié',
      icon: GraduationCap,
    },
    {
      type: 'releve_notes',
      label: 'Fiches et Relevés de Notes',
      description: 'Relevés de notes universitaires de Licence et Master',
      icon: FileText,
    },
    {
      type: 'diplomes',
      label: 'Diplômes universitaires',
      description: 'Diplômes ou attestations (Licence, Master / Ingénieur)',
      icon: FileCheck,
    },
    {
      type: 'cin',
      label: 'Carte Nationale (CIN)',
      description: 'Scan recto/verso net de la CIN en cours de validité',
      icon: CreditCard,
    },
  ];

  const openScanner = (type: DocumentType, title: string) => {
    setScanningDocType(type);
    setScanningDocTitle(title);
  };

  const handleSaveScannedDocument = (
    type: DocumentType,
    fileName: string,
    fileSize: string,
    dataUrl: string,
    method: 'camera' | 'upload'
  ) => {
    uploadCandidateDocument(type, fileName, fileSize, dataUrl, method);
    setScanningDocType(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-white text-neutral-900">
      {/* Candidate Profile Header Card */}
      {currentUser && (
        <div className="p-4 sm:p-5 border border-neutral-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                Espace Candidat Doctorant
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
                <span>CIN : <strong className="font-mono text-neutral-800">{currentUser.cin}</strong></span>
              )}
              {currentUser.phone && (
                <>
                  <span className="text-neutral-300 hidden sm:inline">·</span>
                  <span>Tél : <strong className="font-mono text-neutral-800">{currentUser.phone}</strong></span>
                </>
              )}
              <span className="text-neutral-300 hidden sm:inline">·</span>
              <span>{currentUser.establishment || 'FST Fès'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenReReg}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors whitespace-nowrap shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Déposer réinscription</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="border-b border-neutral-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 sm:gap-8 min-w-max pb-3 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'catalogue'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            1. Recherche de Sujets
          </button>

          <button
            onClick={() => setActiveTab('suivi')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'suivi'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>2. Ma Candidature & Progression</span>
            {currentCandidateApp && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>3. Mes Pièces Justificatives (4 Scans)</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-neutral-100 rounded-md font-mono text-neutral-700">
              {documents.filter((d) => d.candidateEmail.toLowerCase() === currentUser?.email.toLowerCase()).length}/4
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: RECHERCHE DE SUJETS */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          {/* Dynamic Search Bar & Filters */}
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

            {/* Filter buttons by establishment */}
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
                {filteredTopics.length} sujet{filteredTopics.length > 1 ? 's' : ''} disponible{filteredTopics.length > 1 ? 's' : ''}
              </span>
              <span>Année Universitaire 2026-2027 · USMBA</span>
            </div>

            {filteredTopics.length === 0 ? (
              <div className="py-12 sm:py-16 text-center border border-dashed border-neutral-200 rounded-2xl bg-white px-4">
                <p className="text-sm text-neutral-500">Aucun sujet ne correspond à vos filtres.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedEstablishment('Tous');
                  }}
                  className="mt-3 text-xs font-semibold text-neutral-900 underline underline-offset-4"
                >
                  Réinitialiser les critères
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {filteredTopics.map((topic) => {
                  const alreadyApplied = applications.some(
                    (a) => a.topicId === topic.id && a.candidateEmail.toLowerCase() === currentUser?.email.toLowerCase()
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
                          <span aria-hidden="true" className="text-neutral-300">·</span>
                          <span>{topic.laboratory}</span>
                          <span aria-hidden="true" className="text-neutral-300">·</span>
                          <span>Dir. {topic.supervisorName}</span>
                          <span aria-hidden="true" className="text-neutral-300">·</span>
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
                          <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            <span>Candidature transmise</span>
                          </div>
                        ) : isAvailable ? (
                          <button
                            onClick={() => onOpenApply(topic)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs"
                          >
                            <span>Postuler au sujet</span>
                            <ArrowRight className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB 2: SUIVI PAR PROGRESSION (5 ÉTAPES CLÉS) */}
      {activeTab === 'suivi' && (
        <div className="space-y-6 sm:space-y-8">
          {currentCandidateApp ? (
            <div className="p-4 sm:p-6 md:p-8 border border-neutral-200 rounded-2xl bg-white space-y-6 sm:space-y-8 shadow-xs">
              {/* Alert: Demande de correction si statut a_corriger */}
              {currentCandidateApp.status === 'a_corriger' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Correction requise par votre directeur de thèse :</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed pl-6">
                    "{currentCandidateApp.supervisorFeedback || currentCandidateApp.notes || 'Veuillez renouveler ou vérifier vos pièces scannées.'}"
                  </p>
                  <div className="pl-6 pt-1">
                    <button
                      onClick={() => setActiveTab('documents')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Remplacer / re-scanner mes documents</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Header with Title and Delete action */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-100 pb-5">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Dossier de Candidature Doctorale Actif
                  </div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 leading-snug">
                    {currentCandidateApp.topicTitle}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 pt-1">
                    <span>{currentCandidateApp.establishment}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentCandidateApp.laboratory}</span>
                    <span aria-hidden="true">·</span>
                    <span>Directeur : {currentCandidateApp.supervisorName}</span>
                    <span aria-hidden="true">·</span>
                    <span>Déposé le {currentCandidateApp.submittedDate}</span>
                  </div>
                </div>

                <div className="w-full sm:w-auto pt-2 sm:pt-0">
                  {confirmDeleteAppId === currentCandidateApp.id ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <span className="text-xs text-rose-800 font-medium">Confirmer le retrait du dossier ?</span>
                      <div className="flex items-center gap-2 mt-1 sm:mt-0">
                        <button
                          onClick={() => {
                            deleteApplication(currentCandidateApp.id);
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
                      onClick={() => setConfirmDeleteAppId(currentCandidateApp.id)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Retirer ma candidature</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 5-Step Dynamic Progress Bar */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Barre de Progression Officielle (5 Étapes)
                  </h3>
                  <span className="text-xs font-medium text-neutral-600">
                    Statut actuel : <strong className="text-neutral-900">{PROGRESS_STEPS[currentStep - 1]?.label || 'Dossier soumis'}</strong> ({currentStep}/5)
                  </span>
                </div>

                {/* DESKTOP VIEW (Horizontal timeline with connector bar) */}
                <div className="hidden sm:block relative pt-3 pb-4">
                  {/* Background Track Line */}
                  <div className="absolute top-7 left-8 right-8 h-1 bg-neutral-100 -z-0" />
                  {/* Active Progress Fill */}
                  <div
                    className="absolute top-7 left-8 h-1 bg-neutral-900 transition-all duration-500 -z-0"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((currentStep - 1) / (PROGRESS_STEPS.length - 1)) * 100))}%`,
                    }}
                  />

                  {/* 5 Step Nodes */}
                  <div className="grid grid-cols-5 gap-2 relative z-10">
                    {PROGRESS_STEPS.map((s) => {
                      const isCompleted = currentStep > s.step;
                      const isCurrent = currentStep === s.step;

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

                {/* MOBILE VIEW (Vertical Step Cards) */}
                <div className="block sm:hidden space-y-2 pt-2">
                  {PROGRESS_STEPS.map((s) => {
                    const isCompleted = currentStep > s.step;
                    const isCurrent = currentStep === s.step;

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
                            <span className={`text-xs font-bold ${isCurrent ? 'text-neutral-900' : 'text-neutral-700'}`}>
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

              {/* Feedback and Notes from Supervisor */}
              {currentCandidateApp.supervisorFeedback && (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
                  <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Avis du Directeur de thèse :</span>
                    </span>
                    {currentCandidateApp.supervisorGrade && (
                      <span className="font-mono text-[11px] bg-white border border-neutral-200 px-2 py-0.5 rounded-md text-neutral-800">
                        Appréciation : {currentCandidateApp.supervisorGrade}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed pl-5">
                    "{currentCandidateApp.supervisorFeedback}"
                  </p>
                </div>
              )}

              {/* Summary Table / Card */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Fiche synthétique du dossier
                </div>
                <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-xs">
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
                        <td className="py-3 px-3.5 font-bold text-neutral-900 max-w-xs">{currentCandidateApp.topicTitle}</td>
                        <td className="py-3 px-3.5 text-neutral-700">{currentCandidateApp.establishment} · {currentCandidateApp.laboratory}</td>
                        <td className="py-3 px-3.5 font-medium text-neutral-800">{currentCandidateApp.supervisorName}</td>
                        <td className="py-3 px-3.5 font-semibold text-neutral-900">Étape {currentCandidateApp.currentStep}/5</td>
                        <td className="py-3 px-3.5">
                          <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                            {currentCandidateApp.status.replace('_', ' ')}
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
                Vous n'avez aucune candidature de thèse active pour le moment.
              </p>
              <button
                onClick={() => setActiveTab('catalogue')}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
              >
                Parcourir les sujets disponibles
              </button>
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
                    <span>Publications : <strong className="text-neutral-900">{currentCandidateReReg.activityReport.publicationsCount}</strong></span>
                    <span>·</span>
                    <span>Avancement : <strong className="text-neutral-900">{currentCandidateReReg.activityReport.progressPercentage}%</strong></span>
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

      {/* TAB 3: GESTION ET SCAN DES DOCUMENTS (Webcam / Upload) */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Pièces justificatives obligatoires (4 Scans Certifiés)
              </h2>
              <p className="text-xs text-neutral-500">
                Scannez directement vos pièces avec votre webcam/caméra mobile ou téléversez vos fichiers.
              </p>
            </div>
            <div className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200 self-start sm:self-auto">
              {documents.filter((d) => d.candidateEmail.toLowerCase() === currentUser?.email.toLowerCase()).length} / 4 pièces certifiées
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REQUIRED_DOCS.map((req) => {
              const uploadedDoc = documents.find(
                (d) => d.candidateEmail.toLowerCase() === currentUser?.email.toLowerCase() && d.type === req.type
              );
              const IconComp = req.icon;

              return (
                <div
                  key={req.type}
                  className="p-4 sm:p-5 border border-neutral-200 rounded-2xl bg-white space-y-4 hover:border-neutral-300 transition-colors shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-neutral-900">{req.label}</h3>
                          <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                            {req.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {uploadedDoc && (
                      <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-neutral-900 font-medium truncate max-w-[180px] sm:max-w-[220px]">
                            {uploadedDoc.fileName}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" />
                            <span>Déposé ({uploadedDoc.fileSize})</span>
                          </span>
                        </div>

                        {uploadedDoc.captureMethod === 'camera' && (
                          <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <Camera className="w-3 h-3 text-neutral-400" />
                            <span>Numérisé via caméra directe</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500 border-t border-neutral-200">
                          <span>{uploadedDoc.uploadedAt}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                openAttachment({
                                  title: uploadedDoc.title,
                                  subtitle: `Pièce justificative - ${uploadedDoc.fileName}`,
                                  content: `Scan certifié conforme du document [${uploadedDoc.title}] pour le candidat ${currentUser?.name} (${currentUser?.cin}).\n\nFichier numérique : ${uploadedDoc.fileName}\nTaille : ${uploadedDoc.fileSize}\nValidé au guichet numérique USMBA.`,
                                  author: currentUser?.name || 'Candidat',
                                  date: uploadedDoc.uploadedAt,
                                  dataUrl: uploadedDoc.dataUrl,
                                })
                              }
                              className="text-neutral-900 font-semibold underline flex items-center gap-1"
                            >
                              <span>Voir le scan</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                            <span>·</span>
                            <button
                              onClick={() => deleteCandidateDocument(uploadedDoc.id)}
                              className="text-rose-600 hover:text-rose-700 font-medium"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions to Scan or Upload */}
                  <div className="pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openScanner(req.type, req.label)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors border border-neutral-200"
                      >
                        <Camera className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Scanner direct</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openScanner(req.type, req.label)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Téléverser</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={scanningDocType !== null}
        docType={scanningDocType}
        docTitle={scanningDocTitle}
        onClose={() => setScanningDocType(null)}
        onSave={handleSaveScannedDocument}
      />
    </div>
  );
};
