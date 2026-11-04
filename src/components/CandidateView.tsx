import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ThesisTopic, DocumentType, ApplicationStep } from '../types';
import {
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  Check,
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Building2,
  CreditCard,
  GraduationCap,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { ESTABLISHMENTS } from '../data/mockData';

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

  // Confirmation state for deleting application
  const [confirmDeleteAppId, setConfirmDeleteAppId] = useState<string | null>(null);

  // Upload modal / trigger simulation
  const [uploadingDocType, setUploadingDocType] = useState<DocumentType | null>(null);

  // Filter topics cleanly
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

  // Steps definition for the 5-step progress bar required by prompt:
  // Dossier soumis ➔ Validation structure ➔ Sélection ➔ Entretien ➔ Admis
  const PROGRESS_STEPS: { step: ApplicationStep; label: string; desc: string }[] = [
    { step: 1, label: 'Dossier soumis', desc: 'Dépôt des pièces initial' },
    { step: 2, label: 'Validation structure', desc: 'Examen de conformité du labo' },
    { step: 3, label: 'Sélection', desc: 'Présélection sur dossier' },
    { step: 4, label: 'Entretien', desc: 'Audition devant la commission' },
    { step: 5, label: 'Admis', desc: 'Inscription définitive validée' },
  ];

  const currentStep: number = currentCandidateApp?.currentStep || 0;

  // Documents mandatory types
  const REQUIRED_DOCS: { type: DocumentType; label: string; description: string; icon: any }[] = [
    {
      type: 'baccalaureat',
      label: 'Baccalauréat',
      description: 'Copie certifiée conforme du diplôme de baccalauréat',
      icon: GraduationCap,
    },
    {
      type: 'releve_notes',
      label: 'Fiches de notes',
      description: 'Relevés de notes de toutes les années universitaires (Licence & Master)',
      icon: FileText,
    },
    {
      type: 'diplomes',
      label: 'Diplômes universitaires',
      description: 'Attestations de réussite et diplômes de Licence et Master / Ingénieur',
      icon: FileCheck,
    },
    {
      type: 'cin',
      label: 'Carte Nationale (CIN)',
      description: 'Scan recto/verso net de la Carte d’Identité Nationale en cours de validité',
      icon: CreditCard,
    },
  ];

  const handleSimulateUpload = (type: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} Mo`;
      uploadCandidateDocument(type, file.name, sizeStr);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 bg-white text-neutral-900">
      {/* Candidate Header Summary */}
      {currentUser && (
        <div className="p-4 sm:p-5 border border-neutral-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Espace Candidat
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-xs text-neutral-600 font-mono">{currentUser.email}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
              {currentUser.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              {currentUser.cin && <span>CIN : <strong className="font-mono text-neutral-800">{currentUser.cin}</strong></span>}
              {currentUser.phone && (
                <>
                  <span className="text-neutral-300">·</span>
                  <span>Tél : <strong className="font-mono text-neutral-800">{currentUser.phone}</strong></span>
                </>
              )}
              <span className="text-neutral-300">·</span>
              <span>{currentUser.establishment || 'FST Fès'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onOpenReReg}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Se réinscrire (Annuel)</span>
            </button>
          </div>
        </div>
      )}

      {/* Clean Navigation Sub-Tabs */}
      <div className="flex items-center gap-8 border-b border-neutral-200 pb-3 text-sm">
        <button
          onClick={() => setActiveTab('catalogue')}
          className={`font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 ${
            activeTab === 'catalogue'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          1. Recherche de Sujets
        </button>

        <button
          onClick={() => setActiveTab('suivi')}
          className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 ${
            activeTab === 'suivi'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <span>2. Mes Candidatures & Avancement</span>
          {currentCandidateApp && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 ${
            activeTab === 'documents'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <span>3. Gestion des Documents (Scans)</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-neutral-100 rounded-md font-mono text-neutral-600">
            {documents.filter((d) => d.candidateEmail === currentUser?.email).length}/4
          </span>
        </button>
      </div>

      {/* TAB 1: RECHERCHE DE SUJETS */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          {/* Dynamic Search Bar */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dynamiquement un sujet par mot-clé, titre, laboratoire ou encadrant..."
                className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-neutral-200 rounded-xl shadow-xs focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Filter buttons by establishment */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-neutral-400 mr-1 shrink-0">Établissement :</span>
              {['Tous', ...ESTABLISHMENTS].map((est) => {
                const isSelected = selectedEstablishment === est;
                return (
                  <button
                    key={est}
                    onClick={() => setSelectedEstablishment(est)}
                    className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
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
              <span className="tabular-nums">
                {filteredTopics.length} sujet{filteredTopics.length > 1 ? 's' : ''} ouvert{filteredTopics.length > 1 ? 's' : ''} à la candidature
              </span>
              <span>Session Doctorale 2026-2027</span>
            </div>

            {filteredTopics.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-neutral-200 rounded-2xl bg-white">
                <p className="text-sm text-neutral-500">Aucun sujet ne correspond à votre recherche.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedEstablishment('Tous');
                  }}
                  className="mt-3 text-xs font-semibold text-neutral-900 underline underline-offset-4"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                {filteredTopics.map((topic) => {
                  const alreadyApplied = applications.some(
                    (a) => a.topicId === topic.id && a.candidateEmail === currentUser?.email
                  );
                  const isAvailable = topic.slotsTaken < topic.slotsTotal && topic.status !== 'cloture';

                  return (
                    <article
                      key={topic.id}
                      className="p-5 sm:p-6 hover:bg-neutral-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight leading-snug">
                          {topic.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-neutral-600">
                          <span className="font-semibold text-neutral-900">{topic.establishment}</span>
                          <span aria-hidden="true" className="text-neutral-300">·</span>
                          <span>{topic.laboratory}</span>
                          <span aria-hidden="true" className="text-neutral-300">·</span>
                          <span>Dir. {topic.supervisorName}</span>
                          <span aria-hidden="true" className="text-neutral-300">·</span>
                          <span className="text-emerald-700 font-medium">Validé par la structure</span>
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

                      <div className="flex items-center gap-3 shrink-0">
                        {alreadyApplied ? (
                          <div className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            <span>Candidature active</span>
                          </div>
                        ) : isAvailable ? (
                          <button
                            onClick={() => onOpenApply(topic)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap"
                          >
                            <span>Postuler en 1 clic</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">Places pourvues</span>
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

      {/* TAB 2: SUIVI DE L'AVANCEMENT & GESTION DE LA CANDIDATURE */}
      {activeTab === 'suivi' && (
        <div className="space-y-8">
          {currentCandidateApp ? (
            <div className="p-6 sm:p-8 border border-neutral-200 rounded-2xl bg-white space-y-8 shadow-xs">
              {/* Header with Title and Delete action */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-100 pb-5">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Dossier de Thèse en cours d'instruction
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug">
                    {currentCandidateApp.topicTitle}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 pt-1">
                    <span>{currentCandidateApp.establishment}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentCandidateApp.laboratory}</span>
                    <span aria-hidden="true">·</span>
                    <span>Directeur de thèse : {currentCandidateApp.supervisorName}</span>
                    <span aria-hidden="true">·</span>
                    <span>Déposé le {currentCandidateApp.submittedDate}</span>
                  </div>
                </div>

                {/* Possibilité de supprimer sa candidature */}
                <div>
                  {confirmDeleteAppId === currentCandidateApp.id ? (
                    <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-xl">
                      <span className="text-xs text-rose-800 font-medium">Confirmer le désistement ?</span>
                      <button
                        onClick={() => {
                          deleteApplication(currentCandidateApp.id);
                          setConfirmDeleteAppId(null);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
                      >
                        Oui, supprimer
                      </button>
                      <button
                        onClick={() => setConfirmDeleteAppId(null)}
                        className="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteAppId(currentCandidateApp.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl transition-colors"
                      title="Se désister de cette candidature"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer ma candidature</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Graphical Linear Progress Bar (Dossier soumis ➔ Validation structure ➔ Sélection ➔ Entretien ➔ Admis) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Progression linéaire du dossier
                  </h3>
                  <span className="text-xs font-medium text-neutral-500">
                    Étape actuelle : <strong className="text-neutral-900">{PROGRESS_STEPS[currentStep - 1]?.label || 'En cours'}</strong> ({currentStep}/5)
                  </span>
                </div>

                <div className="relative pt-3 pb-4">
                  {/* Background Track Line */}
                  <div className="absolute top-7 left-8 right-8 h-1 bg-neutral-100 -z-0" />
                  {/* Active Progress Fill */}
                  <div
                    className="absolute top-7 left-8 h-1 bg-neutral-900 transition-all duration-500 -z-0"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((currentStep - 1) / (PROGRESS_STEPS.length - 1)) * 100))}%`,
                    }}
                  />

                  {/* 5 Progression Steps Nodes */}
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
                          <span className="text-[11px] text-neutral-400 hidden sm:block mt-0.5 leading-tight">
                            {s.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Status Note or Next Action */}
              <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl space-y-1">
                <div className="text-xs font-semibold text-neutral-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Détail d'instruction :</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed pl-6">
                  {currentCandidateApp.notes || 'Votre dossier est en cours de traitement par les instances du Centre d’Études Doctorales.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-neutral-200 rounded-2xl bg-white space-y-4">
              <p className="text-sm text-neutral-600">
                Vous n'avez aucune candidature de thèse active pour le moment.
              </p>
              <button
                onClick={() => setActiveTab('catalogue')}
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Consulter les sujets et postuler
              </button>
            </div>
          )}

          {/* Suivi de la Réinscription Annuelle */}
          <div className="p-6 border border-neutral-200 rounded-2xl bg-white space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Réinscription Annuelle en Doctorat
                </h3>
                <p className="text-xs text-neutral-500">
                  Obligatoire au début de chaque année universitaire avec dépôt du rapport d'activité annuel.
                </p>
              </div>

              <button
                onClick={onOpenReReg}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Se réinscrire (Déposer rapport)</span>
              </button>
            </div>

            {currentCandidateReReg ? (
              <div className="p-4 border border-neutral-100 bg-neutral-50 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">
                    Demande de réinscription en {currentCandidateReReg.year}ème année
                  </span>
                  <span className="text-emerald-700 font-medium">
                    {currentCandidateReReg.status === 'valide_structure'
                      ? 'Validée par la structure'
                      : currentCandidateReReg.status === 'valide_encadrant'
                      ? 'Avis favorable Encadrant'
                      : 'En cours d’examen'}
                  </span>
                </div>
                <p className="text-neutral-600">
                  {currentCandidateReReg.activityReport.summary}
                </p>
                <div className="flex items-center gap-4 text-neutral-500 pt-1 border-t border-neutral-200/60">
                  <span>Publications : <strong>{currentCandidateReReg.activityReport.publicationsCount}</strong></span>
                  <span>Communications : <strong>{currentCandidateReReg.activityReport.communicationsCount}</strong></span>
                  <span>Avancement : <strong>{currentCandidateReReg.activityReport.progressPercentage}%</strong></span>
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
                    className="ml-auto text-neutral-900 underline font-medium"
                  >
                    Voir le document
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

      {/* TAB 3: GESTION DES DOCUMENTS (SCANS / DÉPÔTS) */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-neutral-900">
              Pièces justificatives obligatoires (Scans & Dépôts)
            </h2>
            <p className="text-xs text-neutral-500">
              Téléversez vos documents au format PDF ou image haute définition. Ces pièces sont examinées par la structure et le jury de sélection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REQUIRED_DOCS.map((req) => {
              const uploadedDoc = documents.find(
                (d) => d.candidateEmail === currentUser?.email && d.type === req.type
              );
              const IconComp = req.icon;

              return (
                <div
                  key={req.type}
                  className="p-5 border border-neutral-200 rounded-2xl bg-white space-y-4 hover:border-neutral-300 transition-colors"
                >
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

                  {uploadedDoc ? (
                    <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-neutral-900 font-medium truncate max-w-[200px]">
                          {uploadedDoc.fileName}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Déposé ({uploadedDoc.fileSize})</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500 border-t border-neutral-200/50">
                        <span>Horodaté le {uploadedDoc.uploadedAt}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              openAttachment({
                                title: uploadedDoc.title,
                                subtitle: `Pièce justificative - ${uploadedDoc.fileName}`,
                                content: `Scan certifié conforme du document [${uploadedDoc.title}] pour le candidat ${currentUser?.name} (${currentUser?.cin}).\n\nFichier numérique : ${uploadedDoc.fileName}\nTaille : ${uploadedDoc.fileSize}\nValidé au guichet numérique USMBA.`,
                                author: currentUser?.name || 'Candidat',
                                date: uploadedDoc.uploadedAt,
                              })
                            }
                            className="text-neutral-900 font-medium underline"
                          >
                            Prévisualiser
                          </button>
                          <span>·</span>
                          <button
                            onClick={() => deleteCandidateDocument(uploadedDoc.id)}
                            className="text-rose-600 hover:text-rose-700"
                          >
                            Remplacer
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <label className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 transition-colors cursor-pointer group">
                        <Upload className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                        <span className="text-xs font-semibold text-neutral-800 mt-2">
                          Importer ou scanner la pièce
                        </span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">
                          PDF ou image haute résolution (max 10 Mo)
                        </span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="sr-only"
                          onChange={(e) => handleSimulateUpload(req.type, e)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
