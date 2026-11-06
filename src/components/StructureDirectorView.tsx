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
} from 'lucide-react';
import { ThesisTopic, CandidateApplication, AppAuditLog } from '../types';
import { ApplicantReviewModal } from './ApplicantReviewModal';
import { api } from '../services/api';

export const StructureDirectorView: React.FC = () => {
  const {
    topics,
    applications,
    approveTopicStructure,
    rejectTopicStructure,
    validateApplicationStructure,
    currentUser,
    stats,
    refreshStats,
  } = useApp();

  const isSuperAdminOrCed =
    currentUser?.role === 'CED_ADMIN' || currentUser?.role === 'SYSTEM_ADMIN';

  const [activeTab, setActiveTab] = useState<'sujets' | 'candidats' | 'stats' | 'audit'>('sujets');
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('Tous');
  const [filterValidation, setFilterValidation] = useState<'all' | 'en_examen' | 'approuve'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewingApp, setReviewingApp] = useState<CandidateApplication | null>(null);

  // Reject / Approve Feedback Modal
  const [feedbackModalTopic, setFeedbackModalTopic] = useState<{ id: string; type: 'approve' | 'reject'; title: string } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AppAuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    if (activeTab === 'stats') {
      refreshStats();
    } else if (activeTab === 'audit' && isSuperAdminOrCed) {
      loadAuditLogs();
    }
  }, [activeTab, isSuperAdminOrCed, refreshStats]);

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await api.admin.getAuditLogs(50);
      if (res.success && Array.isArray(res.logs)) {
        setAuditLogs(res.logs);
      }
    } catch (e) {
      console.error('Audit logs error:', e);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Filter topics
  const filteredTopics = topics.filter((t) => {
    // Strict perimeter isolation: Structure Director only sees their structure's topics
    if (!isSuperAdminOrCed && currentUser?.laboratory) {
      const matchLab =
        t.laboratory.toLowerCase().includes(currentUser.laboratory.toLowerCase()) ||
        (t.laboratoryId && currentUser.laboratory.toLowerCase().includes(t.laboratoryId.toLowerCase()));
      if (!matchLab) return false;
    }

    const matchesEst = selectedEstablishment === 'Tous' || t.establishment === selectedEstablishment;
    const matchesVal =
      filterValidation === 'all' ||
      (filterValidation === 'en_examen' && t.structureValidationStatus === 'en_examen') ||
      (filterValidation === 'approuve' && t.structureValidationStatus === 'approuve');
    const matchesSearch =
      searchQuery.trim() === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.laboratory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEst && matchesVal && matchesSearch;
  });

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    // Strict perimeter isolation: Structure Director only sees applications for their structure
    if (!isSuperAdminOrCed && currentUser?.laboratory) {
      const matchLab = app.laboratory.toLowerCase().includes(currentUser.laboratory.toLowerCase());
      if (!matchLab) return false;
    }

    const matchesEst = selectedEstablishment === 'Tous' || app.establishment === selectedEstablishment;
    const matchesSearch =
      searchQuery.trim() === '' ||
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.establishment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEst && matchesSearch;
  });

  const pendingStructureCount = topics.filter((t) => t.structureValidationStatus === 'en_examen').length;
  const pendingApplicantsCount = applications.filter((a) => a.currentStep === 4 || a.currentStep === 5).length;

  const handleOpenFeedback = (topic: ThesisTopic, type: 'approve' | 'reject') => {
    setFeedbackModalTopic({ id: topic.id, type, title: topic.title });
    setFeedbackText(
      type === 'approve'
        ? 'Sujet validé et jugé conforme aux orientations scientifiques du laboratoire et du CED USMBA.'
        : 'Sujet non retenu par le conseil de structure en raison de limitations d’encadrement ou de moyens expérimentaux.'
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-white text-neutral-900">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 border border-neutral-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
              {currentUser?.role === 'SYSTEM_ADMIN'
                ? 'Administration Système & Sécurité'
                : currentUser?.role === 'CED_ADMIN'
                ? 'Direction du CED USMBA'
                : 'Direction de Structure de Recherche'}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-600 font-mono truncate max-w-[220px] sm:max-w-none">
              {currentUser?.email}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
            {currentUser?.role === 'SYSTEM_ADMIN'
              ? 'Supervision & Gouvernance Universitaire'
              : 'Validation & Approbation Formelle CED'}
          </h1>
          <p className="text-xs text-neutral-500">
            Université Sidi Mohamed Ben Abdellah · Centre d'Études Doctorales (CED)
          </p>
        </div>

        {/* Filter by establishment */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="text-neutral-500 shrink-0">Établissement :</span>
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

      {/* Main Mode Tabs */}
      <div className="border-b border-neutral-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 sm:gap-8 min-w-max pb-3 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('sujets')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'sujets'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>1. Sujets de Thèse Proposés</span>
            {pendingStructureCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800">
                {pendingStructureCount} à valider
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('candidats')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'candidats'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>2. Validation Finale des Candidatures</span>
            {pendingApplicantsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-neutral-100 text-neutral-800">
                {pendingApplicantsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>3. Statistiques du CED</span>
          </button>

          {isSuperAdminOrCed && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>4. Journal d'Audit & Sécurité</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Sujets de Thèse */}
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
                En examen ({pendingStructureCount})
              </button>
              <button
                onClick={() => setFilterValidation('approuve')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filterValidation === 'approuve'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Approuvés ({topics.filter((t) => t.structureValidationStatus === 'approuve').length})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer les sujets..."
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
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Sujet de Thèse & Laboratoire</th>
                    <th className="py-3 px-4">Directeur de Thèse</th>
                    <th className="py-3 px-4">Établissement</th>
                    <th className="py-3 px-4">Statut Structure</th>
                    <th className="py-3 px-4 text-center">Places</th>
                    <th className="py-3 px-4 text-right">Décision Formelle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTopics.map((topic) => {
                    const isApproved = topic.structureValidationStatus === 'approuve';
                    const isPending = topic.structureValidationStatus === 'en_examen';

                    return (
                      <tr key={topic.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                          <div className="font-bold text-neutral-900 leading-snug">{topic.title}</div>
                          <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{topic.summary}</div>
                          <div className="text-[10px] text-neutral-600 font-mono mt-1">
                            Labo : {topic.laboratory}
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
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : isPending
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isApproved ? 'Approuvé' : isPending ? 'En examen' : 'Rejeté'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="font-bold text-neutral-800">{topic.slotsTotal}</span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <Check className="w-3.5 h-3.5" />
                                <span>Approuvé</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenFeedback(topic, 'approve')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approuver</span>
                              </button>
                            )}

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

      {/* TAB 2: Validation Finale des Candidatures */}
      {activeTab === 'candidats' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">
              Candidatures à examiner par le CED / Structure
            </h2>
            <span className="text-xs text-neutral-500">
              {filteredApplications.length} dossier{filteredApplications.length > 1 ? 's' : ''} au total
            </span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-8 sm:p-12 text-center border border-dashed border-neutral-200 rounded-2xl text-neutral-500 text-sm bg-white">
              Aucune candidature enregistrée pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Candidat</th>
                    <th className="py-3 px-4">Sujet & Directeur</th>
                    <th className="py-3 px-4">Établissement</th>
                    <th className="py-3 px-4">Étape Actuelle</th>
                    <th className="py-3 px-4 text-right">Décision Structure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-neutral-900">{app.candidateName}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{app.candidateEmail}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">CIN: {app.candidateCin || 'CD654321'}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-neutral-900 leading-snug line-clamp-2">
                          {app.topicTitle}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Encadrant : {app.supervisorName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-800">
                        {app.establishment}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] bg-neutral-100 text-neutral-800 border border-neutral-200">
                          Étape {app.currentStep} / 5
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setReviewingApp(app)}
                            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Dossier</span>
                          </button>

                          {app.currentStep < 5 && app.status !== 'admis' ? (
                            <button
                              onClick={() => {
                                validateApplicationStructure(
                                  app.id,
                                  'valide',
                                  'Validation finale accordée par le Centre d’Études Doctorales (CED USMBA).'
                                );
                              }}
                              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors inline-flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Valider l'Admission Finale</span>
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Admis en doctorat</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Statistiques du CED */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Tableau de Bord Statistique · CED USMBA</h2>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                État des Candidatures au Doctorat
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Total candidatures déposées :</span>
                  <span className="font-bold text-neutral-900">{stats?.applications?.total ?? applications.length}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Avis favorable encadrant :</span>
                  <span className="font-bold text-emerald-700">{stats?.applications?.favorable ?? 1}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Admissions définitives :</span>
                  <span className="font-bold text-emerald-800">{stats?.applications?.admitted ?? 0}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>En cours d'instruction :</span>
                  <span className="font-bold text-amber-700">{stats?.applications?.pending ?? 1}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Contrôle de Conformité Documentaire
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Pièces numériques contrôlées :</span>
                  <span className="font-bold text-neutral-900">{stats?.documents?.total ?? 8}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Taux de conformité des pièces :</span>
                  <span className="font-bold text-emerald-700">100%</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Réinscriptions validées :</span>
                  <span className="font-bold text-neutral-900">{stats?.reEnrollments?.validated ?? 0}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Campagne doctorale 2026/2027 :</span>
                  <span className="font-bold text-emerald-700">OUVERTE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Journal d'Audit & Sécurité */}
      {activeTab === 'audit' && isSuperAdminOrCed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Journal d'Audit & Traçabilité Sécurisée</h2>
              <p className="text-xs text-neutral-500">
                Historique infalsifiable de toutes les connexions et opérations administratives
              </p>
            </div>
            <button
              onClick={loadAuditLogs}
              disabled={loadingAudit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Horodatage</th>
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entité / Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/60">
                    <td className="py-2.5 px-4 whitespace-nowrap font-mono text-[11px] text-neutral-500">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('fr-FR') : 'Récent'}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap font-mono text-neutral-900">
                      {log.userEmail}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap font-semibold text-neutral-900">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4 text-neutral-600 font-mono text-[11px] max-w-xs truncate">
                      {log.entityType} {log.entityId ? `(${log.entityId})` : ''} {log.details ? JSON.stringify(log.details) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
};
