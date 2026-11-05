import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ESTABLISHMENTS } from '../data/mockData';
import { Check, X, Shield, Building2, Search, Filter, UserCheck, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { ThesisTopic, CandidateApplication, ApplicationStep, ApplicationStatus } from '../types';
import { ApplicantReviewModal } from './ApplicantReviewModal';

export const StructureDirectorView: React.FC = () => {
  const {
    topics,
    applications,
    approveTopicStructure,
    rejectTopicStructure,
    updateApplicationProgress,
    currentUser,
    documents,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sujets' | 'candidats'>('sujets');
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('Tous');
  const [filterValidation, setFilterValidation] = useState<'all' | 'en_examen' | 'approuve'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewingApp, setReviewingApp] = useState<CandidateApplication | null>(null);

  // Filter topics
  const filteredTopics = topics.filter((t) => {
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

  // Filter applications for structure validation (e.g. stage 3 or 4)
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.establishment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const pendingStructureCount = topics.filter((t) => t.structureValidationStatus === 'en_examen').length;
  const pendingApplicantsCount = applications.filter((a) => a.currentStep === 3 || a.currentStep === 4).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-white text-neutral-900">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 border border-neutral-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
              Direction de la Structure · CED USMBA
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-600 font-mono truncate max-w-[220px] sm:max-w-none">
              {currentUser?.email}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
            Validation & Approbation Formelle
          </h1>
          <p className="text-xs text-neutral-500">
            Centre d’Études Doctorales (CED) & Conseil de Structure de Recherche
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

      {/* Main Mode Tabs: Sujets de thèse vs Validation Candidats */}
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
            <>
              {/* Mobile Card View (block sm:hidden) */}
              <div className="block sm:hidden space-y-3">
                {filteredTopics.map((topic) => {
                  const isApproved = topic.structureValidationStatus === 'approuve';
                  const isPending = topic.structureValidationStatus === 'en_examen';

                  return (
                    <div
                      key={topic.id}
                      className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                            {topic.title}
                          </h3>
                          <div className="text-xs text-neutral-500">
                            {topic.establishment} · {topic.laboratory}
                          </div>
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isApproved ? 'Approuvé' : isPending ? 'En examen' : 'Rejeté'}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-600 line-clamp-2">
                        {topic.summary}
                      </div>

                      <div className="text-xs text-neutral-500">
                        Directeur : <strong className="text-neutral-900">{topic.supervisorName}</strong>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                        {isApproved ? (
                          <span className="w-full py-2 text-xs font-semibold text-center text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Sujet Approuvé</span>
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => approveTopicStructure(topic.id)}
                              className="flex-1 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approuver</span>
                            </button>
                            <button
                              onClick={() => rejectTopicStructure(topic.id)}
                              className="px-3 py-2 text-xs font-semibold text-rose-600 border border-neutral-200 rounded-xl hover:bg-rose-50"
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (hidden sm:block) */}
              <div className="hidden sm:block overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
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
                            <div className="font-bold text-neutral-900 leading-snug">
                              {topic.title}
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                              {topic.summary}
                            </div>
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
                            <span className="font-bold text-neutral-800">
                              {topic.slotsTotal}
                            </span>
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
                                  onClick={() =>
                                    approveTopicStructure(
                                      topic.id,
                                      'Sujet validé et jugé conforme aux orientations scientifiques de la structure.'
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approuver</span>
                                </button>
                              )}

                              {!isApproved && (
                                <button
                                  onClick={() =>
                                    rejectTopicStructure(
                                      topic.id,
                                      'Sujet non retenu par le conseil scientifique.'
                                    )
                                  }
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
            </>
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
            <>
              {/* Mobile Card View (block sm:hidden) */}
              <div className="block sm:hidden space-y-3">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-neutral-900">{app.candidateName}</div>
                        <div className="text-xs text-neutral-500 font-mono">{app.candidateEmail}</div>
                        <div className="text-[11px] text-neutral-600 font-mono">CIN: {app.candidateCin || 'CD654321'}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-800">
                        Étape {app.currentStep}/5
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1">
                      <div className="font-semibold text-neutral-900 leading-snug">{app.topicTitle}</div>
                      <div className="text-[11px] text-neutral-500">
                        {app.establishment} · Dir. {app.supervisorName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setReviewingApp(app)}
                        className="flex-1 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Voir dossier</span>
                      </button>

                      {app.currentStep < 5 ? (
                        <button
                          onClick={() => {
                            const nextStep = (app.currentStep + 1) as ApplicationStep;
                            updateApplicationProgress(
                              app.id,
                              nextStep,
                              nextStep === 5 ? 'admis' : 'validation_structure',
                              `Validation officielle structure accordée par le CED.`
                            );
                          }}
                          className="flex-1 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Valider ({app.currentStep + 1}/5)</span>
                        </button>
                      ) : (
                        <span className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                          Admis
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (hidden sm:block) */}
              <div className="hidden sm:block overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
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

                            {app.currentStep < 5 ? (
                              <button
                                onClick={() => {
                                  const nextStep = (app.currentStep + 1) as ApplicationStep;
                                  updateApplicationProgress(
                                    app.id,
                                    nextStep,
                                    nextStep === 5 ? 'admis' : 'validation_structure',
                                    'Approbation finale validée par le Centre d’Études Doctorales.'
                                  );
                                }}
                                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors inline-flex items-center gap-1 shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Valider étape {app.currentStep + 1}</span>
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Admis définitif</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
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
