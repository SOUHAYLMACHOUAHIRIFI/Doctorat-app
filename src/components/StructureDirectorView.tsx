import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ESTABLISHMENTS } from '../data/mockData';
import {
  Check,
  X,
  Shield,
  Building2,
  Search,
  Filter,
  UserCheck,
  Eye,
  FileText,
  CheckCircle2,
  BarChart3,
  ShieldAlert,
  GraduationCap,
  Users,
  Clock,
  AlertTriangle,
  RefreshCw,
  Send,
  Award,
  Calendar,
  ArrowUpRight,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { ThesisTopic, CandidateApplication, AppAuditLog } from '../types';
import { ApplicantReviewModal } from './ApplicantReviewModal';
import { TopicDetailModal } from './TopicDetailModal';
import { api } from '../services/api';

export const StructureDirectorView: React.FC = () => {
  const {
    topics,
    applications,
    approveTopicStructure,
    rejectTopicStructure,
    signTopicStructure,
    validateApplicationStructure,
    decideFinalAdmission,
    promoteWaitlist,
    currentUser,
    stats,
    refreshStats,
    refreshTopics,
    refreshApplications,
    showToast,
  } = useApp();

  const isSuperAdminOrCed =
    currentUser?.role === 'CED' ||
    currentUser?.role === 'CED_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SYSTEM_ADMIN';

  const [activeTab, setActiveTab] = useState<'sujets' | 'suivi_dossiers' | 'resultats' | 'delais_waitlist' | 'stats'>('sujets');
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('Tous');
  const [filterValidation, setFilterValidation] = useState<'all' | 'en_examen' | 'approuve' | 'rejete'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewingApp, setReviewingApp] = useState<CandidateApplication | null>(null);
  const [viewingTopic, setViewingTopic] = useState<ThesisTopic | null>(null);

  // Official Signature Modal for Thesis Topic
  const [signingTopic, setSigningTopic] = useState<ThesisTopic | null>(null);
  const [signatureComments, setSignatureComments] = useState('');
  const [signatoryName, setSignatoryName] = useState(currentUser?.name || 'Pr. Directeur de Structure');
  const [signatoryRole, setSignatoryRole] = useState(
    currentUser?.role === 'CED' || currentUser?.role === 'CED_ADMIN'
      ? 'Directeur du Pôle Doctoral (CED USMBA)'
      : 'Directeur de Structure de Recherche'
  );

  // Reject / Approve Feedback Modal
  const [feedbackModalTopic, setFeedbackModalTopic] = useState<{ id: string; type: 'approve' | 'reject'; title: string } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Official Admission Decision Modal
  const [decisionModalApp, setDecisionModalApp] = useState<CandidateApplication | null>(null);
  const [decisionType, setDecisionType] = useState<'ADMIS' | 'LISTE_ATTENTE' | 'REFUSE'>('ADMIS');
  const [decisionFeedback, setDecisionFeedback] = useState('');
  const [waitlistRank, setWaitlistRank] = useState<number>(1);

  // Campaign deadlines administrative management
  const [campaignDeadline, setCampaignDeadline] = useState('2026-11-30');
  const [campaignOpen, setCampaignOpen] = useState(true);
  const [savingCampaign, setSavingCampaign] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (typeof document !== 'undefined') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    if (activeTab === 'stats') {
      refreshStats();
    }
  }, [activeTab, refreshStats]);

  // Load campaign settings if tab is opened
  useEffect(() => {
    if (activeTab === 'delais_waitlist') {
      api.admin.getSettings().then((res) => {
        if (res.success && res.settings) {
          if (res.settings.campaignEndDate) setCampaignDeadline(res.settings.campaignEndDate);
        }
      }).catch(() => {});
    }
  }, [activeTab]);

  // Filter topics
  const filteredTopics = topics.filter((t) => {
    // Isolated perimeter: Structure Director only sees their structure's topics if not super admin
    if (!isSuperAdminOrCed && currentUser?.laboratory) {
      const matchLab =
        t.laboratory.toLowerCase().includes(currentUser.laboratory.toLowerCase()) ||
        (t.laboratoryId && currentUser.laboratory.toLowerCase().includes(t.laboratoryId.toLowerCase()));
      if (!matchLab) return false;
    }

    const matchesEst = selectedEstablishment === 'Tous' || t.establishment === selectedEstablishment;
    const isApproved = t.structureValidationStatus === 'approuve' || t.status === 'VALIDE' || t.status === 'valide';
    const isPending = t.structureValidationStatus === 'en_examen' || t.status === 'en_attente' || t.status === 'EN_EXAMEN_STRUCTURE';
    const isRejected = t.structureValidationStatus === 'rejete' || t.status === 'REJETE';

    const matchesVal =
      filterValidation === 'all' ||
      (filterValidation === 'en_examen' && isPending) ||
      (filterValidation === 'approuve' && isApproved) ||
      (filterValidation === 'rejete' && isRejected);

    const matchesSearch =
      searchQuery.trim() === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.laboratory.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesEst && matchesVal && matchesSearch;
  });

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    if (!isSuperAdminOrCed && currentUser?.laboratory) {
      const matchLab = app.laboratory.toLowerCase().includes(currentUser.laboratory.toLowerCase());
      if (!matchLab) return false;
    }

    const matchesEst = selectedEstablishment === 'Tous' || app.establishment === selectedEstablishment;
    const matchesSearch =
      searchQuery.trim() === '' ||
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.candidateCin && app.candidateCin.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesEst && matchesSearch;
  });

  // Filter waitlist candidates
  const waitlistedApplications = applications.filter(
    (app) => app.status === 'LISTE_ATTENTE' || (app as any).structureDecision === 'LISTE_ATTENTE'
  );

  const pendingStructureCount = topics.filter(
    (t) => t.structureValidationStatus === 'en_examen' || t.status === 'en_attente' || t.status === 'EN_EXAMEN_STRUCTURE'
  ).length;

  const pendingDecisionCount = applications.filter(
    (a) => a.currentStep === 4 || a.status === 'SUPERVISOR_APPROVED' || a.status === 'AVIS_FAVORABLE'
  ).length;

  const handleOpenSigning = (topic: ThesisTopic) => {
    setSigningTopic(topic);
    setSignatoryName(currentUser?.name || 'Pr. Directeur de Structure');
    setSignatureComments('Sujet conforme aux axes scientifiques d’excellence de l’Université Sidi Mohamed Ben Abdellah.');
  };

  const handleConfirmSigning = async () => {
    if (!signingTopic) return;
    await signTopicStructure(signingTopic.id, signatureComments);
    setSigningTopic(null);
  };

  const handleOpenFeedback = (topic: ThesisTopic, type: 'approve' | 'reject') => {
    setFeedbackModalTopic({ id: topic.id, type, title: topic.title });
    setFeedbackText(
      type === 'approve'
        ? 'Sujet validé et jugé conforme aux orientations scientifiques du laboratoire et du CED USMBA.'
        : 'Sujet non retenu par le conseil de structure en raison de limitations de charge d’encadrement.'
    );
  };

  const handleConfirmDecision = async () => {
    if (!feedbackModalTopic) return;
    if (feedbackModalTopic.type === 'approve') {
      await approveTopicStructure(feedbackModalTopic.id, feedbackText);
    } else {
      await rejectTopicStructure(feedbackModalTopic.id, feedbackText);
    }
    setFeedbackModalTopic(null);
  };

  const handleOpenAdmissionModal = (app: CandidateApplication) => {
    setDecisionModalApp(app);
    setDecisionType('ADMIS');
    setDecisionFeedback('Avis favorable émis par la commission doctorale. Inscription validée.');
    setWaitlistRank(waitlistedApplications.length + 1);
  };

  const handleConfirmAdmission = async () => {
    if (!decisionModalApp) return;
    await decideFinalAdmission(
      decisionModalApp.id,
      decisionType,
      decisionFeedback,
      decisionType === 'LISTE_ATTENTE' ? waitlistRank : undefined
    );
    setDecisionModalApp(null);
  };

  const handleSaveCampaignDeadlines = async () => {
    setSavingCampaign(true);
    try {
      await api.admin.updateSettings({
        campaignEndDate: campaignDeadline,
      });
      showToast('Date limite de dépôt des candidatures mise à jour avec succès.');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour des délais.');
    } finally {
      setSavingCampaign(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-white text-neutral-900">
      {/* Top Header Card */}
      <div className="p-5 border border-neutral-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
              {currentUser?.role === 'CED' || currentUser?.role === 'CED_ADMIN'
                ? 'Pôle Doctoral CED USMBA'
                : 'Direction de Structure de Recherche'}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-600 font-mono">
              {currentUser?.email}
            </span>
            {currentUser?.laboratory && (
              <>
                <span className="text-neutral-300">·</span>
                <span className="text-xs text-neutral-700 font-medium">{currentUser.laboratory}</span>
              </>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
            Supervision & Gouvernance des Admissions Doctorales
          </h1>
          <p className="text-xs text-neutral-500">
            Université Sidi Mohamed Ben Abdellah · Centre d'Études Doctorales (CED)
          </p>
        </div>

        {/* Filter by establishment */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="text-neutral-500 shrink-0 font-medium">Établissement :</span>
          <select
            value={selectedEstablishment}
            onChange={(e) => setSelectedEstablishment(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
          >
            <option value="Tous">Tous les établissements</option>
            {ESTABLISHMENTS.map((est) => (
              <option key={est} value={est}>
                {est}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Mode Tabs corresponding strictly to the 5 requested areas */}
      <div className="border-b border-neutral-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 sm:gap-6 min-w-max pb-3 text-xs sm:text-sm">
          {/* Tab 1: Sujets */}
          <button
            onClick={() => setActiveTab('sujets')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'sujets'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>1. Sujets & Validation Officielle</span>
            {pendingStructureCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800">
                {pendingStructureCount} à valider
              </span>
            )}
          </button>

          {/* Tab 2: Suivi dossiers */}
          <button
            onClick={() => setActiveTab('suivi_dossiers')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'suivi_dossiers'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>2. Suivi des Dossiers & Avis Encadrants</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-neutral-100 text-neutral-700">
              {filteredApplications.length}
            </span>
          </button>

          {/* Tab 3: Notification Résultats */}
          <button
            onClick={() => setActiveTab('resultats')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'resultats'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>3. Notification des Résultats</span>
            {pendingDecisionCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                {pendingDecisionCount} délibérations
              </span>
            )}
          </button>

          {/* Tab 4: Gestion administrative & Listes d'attente */}
          <button
            onClick={() => setActiveTab('delais_waitlist')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'delais_waitlist'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>4. Délais & Listes d'Attente</span>
            {waitlistedApplications.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                {waitlistedApplications.length} en attente
              </span>
            )}
          </button>

          {/* Tab 5: Statistiques */}
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>5. Métriques & Bilan CED</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: CONSULTATION & VALIDATION OFFICIELLE DES SUJETS     */}
      {/* ============================================================== */}
      {activeTab === 'sujets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 text-xs overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setFilterValidation('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filterValidation === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Tous ({topics.length})
              </button>
              <button
                onClick={() => setFilterValidation('en_examen')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filterValidation === 'en_examen'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                À examiner ({pendingStructureCount})
              </button>
              <button
                onClick={() => setFilterValidation('approuve')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filterValidation === 'approuve'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Validés & Signés
              </button>
              <button
                onClick={() => setFilterValidation('rejete')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filterValidation === 'rejete'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Non retenus
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher sujet, labo, encadrant..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="p-8 sm:p-12 text-center border border-dashed border-neutral-200 rounded-2xl text-neutral-500 text-sm bg-white">
              Aucun sujet ne correspond aux critères de sélection.
            </div>
          ) : (
            <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Sujet de Thèse & Laboratoire</th>
                    <th className="py-3 px-4">Directeur de Thèse</th>
                    <th className="py-3 px-4">Établissement</th>
                    <th className="py-3 px-4">Statut & Visa</th>
                    <th className="py-3 px-4 text-center">Places</th>
                    <th className="py-3 px-4 text-right">Validation & Visa Officiel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTopics.map((topic) => {
                    const isApproved = topic.structureValidationStatus === 'approuve' || topic.status === 'VALIDE' || topic.status === 'valide';
                    const isPending = topic.structureValidationStatus === 'en_examen' || topic.status === 'en_attente' || topic.status === 'EN_EXAMEN_STRUCTURE';
                    const hasDigitalSign = topic.structureFeedback?.includes('SIGNATURE OFFICIELLE') || topic.structureFeedback?.includes('VISA');

                    return (
                      <tr key={topic.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                          <div className="font-bold text-neutral-900 leading-snug">{topic.title}</div>
                          <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{topic.summary}</div>
                          <div className="text-[10px] text-neutral-600 font-mono mt-1 flex items-center gap-1.5">
                            <span className="font-semibold">Labo :</span>
                            <span>{topic.laboratory}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-medium text-neutral-900">{topic.supervisorName}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">Dépôt : {topic.createdAt}</div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-neutral-800">
                          {topic.establishment}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{hasDigitalSign ? 'Signé & Visa Certifié' : 'Approuvé'}</span>
                            </span>
                          ) : isPending ? (
                            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              En attente visa
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              Non retenu
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="font-bold text-neutral-800">{topic.slotsTotal}</span>
                          <span className="text-[10px] text-neutral-400 block">{topic.slotsTaken} pourvue(s)</span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingTopic(topic)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors border border-neutral-200"
                              title="Visualiser le descriptif scientifique"
                            >
                              <Eye className="w-3.5 h-3.5 text-neutral-600" />
                              <span>Voir</span>
                            </button>

                            {/* Official Signature Button */}
                            <button
                              onClick={() => handleOpenSigning(topic)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
                              title="Signer officiellement et apposer le visa CED"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-300" />
                              <span>Signer & Valider</span>
                            </button>

                            {!isApproved && (
                              <button
                                onClick={() => handleOpenFeedback(topic, 'reject')}
                                className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 border border-neutral-200 rounded-xl hover:bg-rose-50 transition-colors"
                              >
                                Rejeter
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: SUIVI DES DOSSIERS & AVIS DES DIRECTEURS DE THÈSE   */}
      {/* ============================================================== */}
      {activeTab === 'suivi_dossiers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Suivi Pédagogique & Dossiers Transmis par les Encadrants
              </h2>
              <p className="text-xs text-neutral-500">
                Consultez les 4 pièces certifiées et les avis émis par les directeurs de thèse
              </p>
            </div>
            <span className="text-xs text-neutral-600 font-mono">
              {filteredApplications.length} candidature(s)
            </span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-8 sm:p-12 text-center border border-dashed border-neutral-200 rounded-2xl text-neutral-500 text-sm bg-white">
              Aucun dossier de candidature enregistré dans ce périmètre.
            </div>
          ) : (
            <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Candidat & CIN</th>
                    <th className="py-3 px-4">Diplôme & Origine</th>
                    <th className="py-3 px-4">Sujet Postulé</th>
                    <th className="py-3 px-4">Avis Directeur de Thèse</th>
                    <th className="py-3 px-4 text-center">4 Pièces Scannées</th>
                    <th className="py-3 px-4 text-right">Action Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredApplications.map((app) => {
                    const isFavorable =
                      app.status === 'SUPERVISOR_APPROVED' ||
                      app.status === 'AVIS_FAVORABLE' ||
                      app.supervisorDecision === 'FAVORABLE' ||
                      app.supervisorDecision === 'favorable';

                    const isDefavorable =
                      app.status === 'AVIS_DEFAVORABLE' ||
                      app.supervisorDecision === 'DEFAVORABLE' ||
                      app.supervisorDecision === 'defavorable';

                    return (
                      <tr key={app.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-neutral-900">{app.candidateName}</div>
                          <div className="text-[11px] text-neutral-500 font-mono">{app.candidateEmail}</div>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            CIN: <span className="font-semibold text-neutral-800">{app.candidateCin || 'CD654321'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-neutral-900 leading-snug">
                            {app.diplomeOrigine || 'Master de Recherche'}
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            {app.etablissementOrigine || app.establishment}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-neutral-900 leading-snug line-clamp-2">
                            {app.topicTitle}
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            Encadrant : <span className="font-medium text-neutral-800">{app.supervisorName}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isFavorable ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Avis Favorable</span>
                              </span>
                              {app.supervisorGrade && (
                                <div className="text-[10px] font-mono text-neutral-600">
                                  Note : {app.supervisorGrade}
                                </div>
                              )}
                            </div>
                          ) : isDefavorable ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              Avis Défavorable
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700">
                              En attente d'évaluation
                            </span>
                          )}
                          {app.supervisorFeedback && (
                            <div className="text-[10px] text-neutral-500 italic truncate max-w-[180px] mt-0.5">
                              "{app.supervisorFeedback}"
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 font-mono">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{app.documents?.length || 4} pièces conformes</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setReviewingApp(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors border border-neutral-200"
                          >
                            <Eye className="w-3.5 h-3.5 text-neutral-600" />
                            <span>Consulter Dossier</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: NOTIFICATION DES RÉSULTATS D'ADMISSION OU REJET     */}
      {/* ============================================================== */}
      {activeTab === 'resultats' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Délibérations & Notification des Résultats aux Candidats
              </h2>
              <p className="text-xs text-neutral-500">
                Prononcez et notifiez officiellement les admissions (Liste Principale), mises en liste d'attente ou rejets
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Candidat</th>
                  <th className="py-3 px-4">Sujet & Directeur</th>
                  <th className="py-3 px-4">Avis Encadrant</th>
                  <th className="py-3 px-4">Statut Actuel</th>
                  <th className="py-3 px-4 text-right">Délibération CED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredApplications.map((app) => {
                  const isAdmitted = app.status === 'CED_APPROVED' || app.status === 'ADMIS' || app.status === 'ACCEPTED';
                  const isWaitlisted = app.status === 'LISTE_ATTENTE' || (app as any).structureDecision === 'LISTE_ATTENTE';
                  const isRejected = app.status === 'REFUSE' || (app as any).structureDecision === 'REJETE';

                  return (
                    <tr key={app.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-neutral-900">{app.candidateName}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{app.candidateEmail}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">CIN : {app.candidateCin || 'CD654321'}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-neutral-900 leading-snug line-clamp-2">
                          {app.topicTitle}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          Directeur : {app.supervisorName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800">
                          {app.supervisorDecision || 'Avis en attente'}
                        </span>
                        {app.supervisorGrade && (
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            Note : {app.supervisorGrade}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isAdmitted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Admis en 1ère Année</span>
                          </span>
                        ) : isWaitlisted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Liste d'Attente</span>
                          </span>
                        ) : isRejected ? (
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            Candidature non retenue
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 text-neutral-700">
                            En cours d'examen (Étape {app.currentStep}/5)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAdmissionModal(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Notifier Résultat</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: GESTION ADMINISTRATIVE DES DÉLAIS & LISTE D'ATTENTE */}
      {/* ============================================================== */}
      {activeTab === 'delais_waitlist' && (
        <div className="space-y-6">
          {/* Delais & Calendrier Administratif */}
          <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-800" />
              <h3 className="text-sm font-bold text-neutral-900">
                Gestion des Délais & Calendrier de Postulation / Inscription
              </h3>
            </div>
            <p className="text-xs text-neutral-500">
              Fixez la date limite officielle de soumission des candidatures et réinscriptions pour la session en cours.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Date Limite de Dépôt des Dossiers</label>
                <input
                  type="date"
                  value={campaignDeadline}
                  onChange={(e) => setCampaignDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Statut de la Campagne Doctorale</label>
                <select
                  value={campaignOpen ? 'OPEN' : 'CLOSED'}
                  onChange={(e) => setCampaignOpen(e.target.value === 'OPEN')}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                >
                  <option value="OPEN">Campagne Ouverte aux Dépôts</option>
                  <option value="CLOSED">Campagne Clôturée (Délibérations)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSaveCampaignDeadlines}
                  disabled={savingCampaign}
                  className="w-full sm:w-auto px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  {savingCampaign ? 'Enregistrement...' : 'Enregistrer les Délais'}
                </button>
              </div>
            </div>
          </div>

          {/* Administration de la Liste d'Attente */}
          <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Administration des Listes d'Attente
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                {waitlistedApplications.length} candidat(s) en attente
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              En cas de désistement sur la liste principale, vous pouvez promouvoir immédiatement un candidat de la liste d'attente vers l'admission définitive.
            </p>

            {waitlistedApplications.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-neutral-200 rounded-xl text-neutral-400 text-xs">
                Aucun candidat n'est actuellement inscrit sur la liste d'attente.
              </div>
            ) : (
              <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Candidat</th>
                      <th className="py-2.5 px-3">Sujet de Thèse</th>
                      <th className="py-2.5 px-3">Directeur</th>
                      <th className="py-2.5 px-3">Avis / Mention</th>
                      <th className="py-2.5 px-3 text-right">Promotion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {waitlistedApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-neutral-50/60">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-bold text-neutral-900">{app.candidateName}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{app.candidateEmail}</div>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate font-medium text-neutral-900">
                          {app.topicTitle}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-neutral-700">
                          {app.supervisorName}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-neutral-600 text-[11px]">
                          {app.structureFeedback || 'Classé sur liste d’attente'}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => promoteWaitlist(app.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs"
                            title="Promouvoir en liste principale"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Promouvoir en Admis</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 5: STATISTIQUES DU CED & BILAN DU CYCLE DOCTORAL       */}
      {/* ============================================================== */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Tableau de Bord Statistique & Bilan CED</h2>
              <p className="text-xs text-neutral-500">Données agrégées centralisées en temps réel</p>
            </div>
            <button
              onClick={() => refreshStats()}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-500">Candidats Inscrits</span>
              <div className="text-2xl font-bold text-neutral-900">{stats?.candidates ?? 2}</div>
              <span className="text-[10px] text-emerald-600 font-medium">Session 2026/2027</span>
            </div>

            <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-500">Doctorants Actifs</span>
              <div className="text-2xl font-bold text-neutral-900">{stats?.doctoralStudents ?? 1}</div>
              <span className="text-[10px] text-neutral-400">Inscrits en thèse</span>
            </div>

            <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-500">Directeurs de Thèse</span>
              <div className="text-2xl font-bold text-neutral-900">{stats?.supervisors ?? 2}</div>
              <span className="text-[10px] text-neutral-400">Corps professoral USMBA</span>
            </div>

            <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-500">Sujets de Thèse</span>
              <div className="text-2xl font-bold text-neutral-900">{stats?.topics?.total ?? topics.length}</div>
              <span className="text-[10px] text-neutral-500">
                {stats?.topics?.validated ?? 3} validés · {stats?.topics?.pending ?? 1} en examen
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Official Signature Modal */}
      {signingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-neutral-900">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold">
                Validation & Signature Officielle du Sujet de Thèse
              </h3>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
              <div className="font-bold text-neutral-900">{signingTopic.title}</div>
              <div className="text-neutral-500">Encadrant : {signingTopic.supervisorName} · {signingTopic.laboratory}</div>
              <div className="text-neutral-500 font-mono">Établissement : {signingTopic.establishment}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-800 block mb-1">Nom du Signataire Autorisé *</label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-neutral-900 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-800 block mb-1">Titre / Qualité Institutionnelle *</label>
                <input
                  type="text"
                  value={signatoryRole}
                  onChange={(e) => setSignatoryRole(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-neutral-900 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-800 block mb-1">Avis Officiel & Visa de la Commission *</label>
                <textarea
                  rows={3}
                  value={signatureComments}
                  onChange={(e) => setSignatureComments(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-neutral-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSigningTopic(null)}
                className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmSigning}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 shadow-xs inline-flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>Apposer la Signature & le Visa CED</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Notification Modal */}
      {decisionModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-neutral-900">
              <Send className="w-5 h-5 text-neutral-800" />
              <h3 className="text-base font-bold">
                Notification Formelle de la Décision d'Admission
              </h3>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
              <div className="font-bold text-neutral-900">{decisionModalApp.candidateName} ({decisionModalApp.candidateCin})</div>
              <div className="text-neutral-600">{decisionModalApp.topicTitle}</div>
              <div className="text-[11px] text-neutral-500">Encadrant : {decisionModalApp.supervisorName} · Avis : {decisionModalApp.supervisorDecision || 'Favorable'}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-800 block mb-1">Décision Finale de la Commission *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionType('ADMIS')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-colors ${
                      decisionType === 'ADMIS'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    1. ADMIS (Liste Principale)
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionType('LISTE_ATTENTE')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-colors ${
                      decisionType === 'LISTE_ATTENTE'
                        ? 'border-amber-600 bg-amber-50 text-amber-900'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    2. Liste d'Attente
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionType('REFUSE')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-colors ${
                      decisionType === 'REFUSE'
                        ? 'border-rose-600 bg-rose-50 text-rose-900'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    3. Non Retenu
                  </button>
                </div>
              </div>

              {decisionType === 'LISTE_ATTENTE' && (
                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">Rang sur la Liste d'Attente</label>
                  <input
                    type="number"
                    min={1}
                    value={waitlistRank}
                    onChange={(e) => setWaitlistRank(parseInt(e.target.value, 10) || 1)}
                    className="w-24 p-2 bg-white border border-neutral-200 rounded-xl text-neutral-900 font-bold"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-neutral-800 block mb-1">Message Officiel / Motif de Délibération *</label>
                <textarea
                  rows={3}
                  value={decisionFeedback}
                  onChange={(e) => setDecisionFeedback(e.target.value)}
                  className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDecisionModalApp(null)}
                className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmAdmission}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 shadow-xs inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirmer et Transmettre au Candidat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback modal for Approving / Rejecting Topic */}
      {feedbackModalTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">
              {feedbackModalTopic.type === 'approve'
                ? 'Approuver le sujet de thèse'
                : 'Rejeter le sujet de thèse'}
            </h3>
            <p className="text-xs text-neutral-600 line-clamp-2">
              Sujet : <strong>{feedbackModalTopic.title}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Motif / Avis officiel de la commission *
              </label>
              <textarea
                rows={3}
                required
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackModalTopic(null)}
                className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs ${
                  feedbackModalTopic.type === 'approve' ? 'bg-neutral-900 hover:bg-neutral-800' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirmer la décision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Dossier Modal */}
      <ApplicantReviewModal
        application={reviewingApp}
        onClose={() => setReviewingApp(null)}
      />

      {/* Topic Detailed Preview Modal */}
      <TopicDetailModal
        topic={viewingTopic}
        onClose={() => setViewingTopic(null)}
        onApprove={(t) => handleOpenFeedback(t, 'approve')}
        onReject={(t) => handleOpenFeedback(t, 'reject')}
      />
    </div>
  );
};
