import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Check, X, FileText, UserCheck, Shield, ChevronRight, Eye, AlertCircle, Building2, User, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import { ThesisTopic, CandidateApplication, ApplicationStep, ApplicationStatus } from '../types';
import { EditTopicModal } from './EditTopicModal';
import { ApplicantReviewModal } from './ApplicantReviewModal';

interface SupervisorViewProps {
  onOpenAddTopic: () => void;
}

export const SupervisorView: React.FC<SupervisorViewProps> = ({ onOpenAddTopic }) => {
  const {
    topics,
    applications,
    reRegistrations,
    updateApplicationProgress,
    updateReRegistrationStatus,
    openAttachment,
    currentUser,
    documents,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sujets' | 'candidatures' | 'reinscriptions'>('sujets');
  const [editingTopic, setEditingTopic] = useState<ThesisTopic | null>(null);
  const [reviewingApplication, setReviewingApplication] = useState<CandidateApplication | null>(null);

  const myTopics = topics;
  const myApplications = applications;
  const myReRegistrations = reRegistrations;

  const getTopicStatusBadge = (status: ThesisTopic['status']) => {
    switch (status) {
      case 'valide':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Validé (Actif)</span>
          </span>
        );
      case 'en_attente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>En attente</span>
          </span>
        );
      case 'cloture':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Clôturé</span>
          </span>
        );
    }
  };

  const getStepBadge = (step: ApplicationStep, status: ApplicationStatus) => {
    if (status === 'refuse') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Non retenu</span>
        </span>
      );
    }
    if (status === 'a_corriger') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          <span>Correction requise</span>
        </span>
      );
    }
    if (step === 5 || status === 'admis') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Admis (5/5)</span>
        </span>
      );
    }

    const labels: Record<number, string> = {
      1: '1/5 Inscription Dossier',
      2: '2/5 Vérification Pièces',
      3: '3/5 Evaluation Directeur',
      4: '4/5 Validation Structure',
      5: '5/5 Admission Finale',
    };

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
        <span>{labels[step] || `Étape ${step}/5`}</span>
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-white text-neutral-900">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 border border-neutral-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
              Espace Directeur de Thèse
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-600 font-mono truncate max-w-[220px] sm:max-w-none">
              {currentUser?.email}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
            {currentUser?.name || 'Pr. Karim Bennani'}
          </h1>
          <p className="text-xs text-neutral-500">
            {currentUser?.establishment || 'FST Fès'} · {currentUser?.laboratory || 'Laboratoire LISAC'}
          </p>
        </div>

        {/* Action: Créer un sujet */}
        <button
          onClick={onOpenAddTopic}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Proposer un sujet de thèse</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 sm:gap-8 min-w-max pb-3 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('sujets')}
            className={`font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'sujets'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Mes Sujets de Thèse ({myTopics.length})
          </button>

          <button
            onClick={() => setActiveTab('candidatures')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'candidatures'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Candidats ayant postulé</span>
            {myApplications.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-neutral-100 text-neutral-800">
                {myApplications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reinscriptions')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'reinscriptions'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Demandes de Réinscription</span>
            {myReRegistrations.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-neutral-100 text-neutral-800">
                {myReRegistrations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: Mes Sujets de Thèse */}
      {activeTab === 'sujets' && (
        <div className="space-y-4">
          {/* Mobile Card View (block sm:hidden) */}
          <div className="block sm:hidden space-y-3">
            {myTopics.map((topic) => (
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
                  {getTopicStatusBadge(topic.status)}
                </div>

                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {topic.summary}
                </p>

                <div className="flex flex-wrap gap-1">
                  {topic.keywords.map((k) => (
                    <span
                      key={k}
                      className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded-md"
                    >
                      {k}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">
                    Places : <strong className="text-neutral-900">{topic.slotsTaken} / {topic.slotsTotal}</strong>
                  </span>
                  <button
                    onClick={() => setEditingTopic(topic)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 shadow-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Titre du Sujet & Mots-clés</th>
                  <th className="py-3 px-4">Établissement & Labo</th>
                  <th className="py-3 px-4">Statut & Validation</th>
                  <th className="py-3 px-4 text-center">Places</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {myTopics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="font-bold text-neutral-900 leading-snug">
                        {topic.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                        {topic.summary}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {topic.keywords.map((k) => (
                          <span
                            key={k}
                            className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded-md"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-900">{topic.establishment}</div>
                      <div className="text-[11px] text-neutral-500">{topic.laboratory}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div>{getTopicStatusBadge(topic.status)}</div>
                        <div
                          className={`text-[11px] font-semibold ${
                            topic.structureValidationStatus === 'approuve'
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {topic.structureValidationStatus === 'approuve'
                            ? 'Approuvé structure'
                            : 'En examen structure'}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-bold text-neutral-900">
                        {topic.slotsTaken} / {topic.slotsTotal}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingTopic(topic)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Candidats ayant postulé */}
      {activeTab === 'candidatures' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="p-8 sm:p-12 text-center border border-dashed border-neutral-200 rounded-2xl text-neutral-500 text-sm bg-white">
              Aucun candidat n'a encore postulé à vos sujets de thèse.
            </div>
          ) : (
            <>
              {/* Mobile Card View (block sm:hidden) */}
              <div className="block sm:hidden space-y-3">
                {myApplications.map((app) => {
                  const candidateDocs = documents.filter(
                    (d) => d.candidateEmail.toLowerCase() === app.candidateEmail.toLowerCase()
                  );

                  return (
                    <div
                      key={app.id}
                      className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-neutral-900">{app.candidateName}</div>
                          <div className="text-xs text-neutral-500 font-mono">{app.candidateEmail}</div>
                          {app.candidateCin && (
                            <div className="text-[11px] text-neutral-600 font-mono mt-0.5">
                              CIN: {app.candidateCin}
                            </div>
                          )}
                        </div>
                        {getStepBadge(app.currentStep, app.status)}
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1">
                        <div className="text-[10px] uppercase font-bold text-neutral-400">Sujet postulé</div>
                        <div className="font-semibold text-neutral-900 leading-snug">
                          {app.topicTitle}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {app.etablissementOrigine || 'USMBA'} · {app.diplomeOrigine || 'Master'}
                        </div>
                      </div>

                      {/* Documents counter and pedagogical feedback */}
                      <div className="flex items-center justify-between text-xs text-neutral-600">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{candidateDocs.length} / 4 pièces numérisées</span>
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {app.submittedDate}
                        </span>
                      </div>

                      {app.supervisorFeedback && (
                        <div className="p-2.5 bg-neutral-50 rounded-lg text-xs text-neutral-700 border border-neutral-100 italic">
                          "{app.supervisorFeedback}"
                        </div>
                      )}

                      {/* Action: Examiner le dossier */}
                      <button
                        onClick={() => setReviewingApplication(app)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Examiner le dossier complet</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (hidden sm:block) */}
              <div className="hidden sm:block overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
                <table className="w-full text-left text-xs min-w-[780px]">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Candidat & Coordonnées</th>
                      <th className="py-3 px-4">Sujet Postulé & Établissement</th>
                      <th className="py-3 px-4">Pièces Numérisées</th>
                      <th className="py-3 px-4">Avancement</th>
                      <th className="py-3 px-4 text-right">Évaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {myApplications.map((app) => {
                      const candidateDocs = documents.filter(
                        (d) => d.candidateEmail.toLowerCase() === app.candidateEmail.toLowerCase()
                      );

                      return (
                        <tr key={app.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-neutral-900">{app.candidateName}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">{app.candidateEmail}</div>
                            <div className="text-[10px] text-neutral-600 font-mono mt-0.5">
                              CIN: {app.candidateCin || 'CD654321'} · {app.candidatePhone || '0661234567'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-neutral-900 leading-snug line-clamp-2">
                              {app.topicTitle}
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              {app.etablissementOrigine || 'USMBA'} · {app.diplomeOrigine || 'Master'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md text-[11px]">
                                {candidateDocs.length} / 4 pièces
                              </span>
                              {candidateDocs.some((d) => d.captureMethod === 'camera') && (
                                <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-50 px-1.5 py-0.5 rounded-md border border-neutral-200">
                                  Caméra
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div>{getStepBadge(app.currentStep, app.status)}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              Déposé le {app.submittedDate}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setReviewingApplication(app)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Examiner le dossier</span>
                            </button>
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

      {/* TAB 3: Consultation des réinscriptions */}
      {activeTab === 'reinscriptions' && (
        <div className="space-y-4">
          {myReRegistrations.length === 0 ? (
            <div className="p-8 sm:p-12 text-center border border-dashed border-neutral-200 rounded-2xl text-neutral-500 text-sm bg-white">
              Aucune demande de réinscription annuelle pour l'instant.
            </div>
          ) : (
            <>
              {/* Mobile Card View (block sm:hidden) */}
              <div className="block sm:hidden space-y-3">
                {myReRegistrations.map((re) => (
                  <div
                    key={re.id}
                    className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-neutral-900">{re.candidateName}</div>
                        <div className="text-xs text-neutral-500 font-mono">{re.candidateEmail}</div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-neutral-100 text-neutral-800 rounded-md">
                        {re.year}e année
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1">
                      <div className="font-semibold text-neutral-900">{re.thesisTitle}</div>
                      <div className="text-neutral-500">
                        Avancement des travaux : <strong className="text-neutral-900">{re.activityReport.progressPercentage}%</strong>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Publications : <strong>{re.activityReport.publicationsCount}</strong> · Communications : <strong>{re.activityReport.communicationsCount}</strong>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        onClick={() =>
                          openAttachment({
                            title: re.activityReport.fileName,
                            subtitle: `Rapport d'activité — ${re.candidateName}`,
                            content: re.activityReport.summary,
                            author: re.candidateName,
                            date: re.submittedDate,
                          })
                        }
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Consulter le rapport d'activité</span>
                      </button>

                      {re.status === 'valide_encadrant' || re.status === 'valide_structure' ? (
                        <span className="w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <Check className="w-3.5 h-3.5" />
                          <span>Avis Favorable Accordé</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => updateReRegistrationStatus(re.id, 'valide_encadrant')}
                          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Donner avis favorable</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (hidden sm:block) */}
              <div className="hidden sm:block overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Doctorant</th>
                      <th className="py-3 px-4">Année & Sujet de Recherche</th>
                      <th className="py-3 px-4">Rapport & Travaux</th>
                      <th className="py-3 px-4 text-center">Avancement</th>
                      <th className="py-3 px-4 text-right">Décision Encadrant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {myReRegistrations.map((re) => (
                      <tr key={re.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-neutral-900">{re.candidateName}</div>
                          <div className="text-[11px] text-neutral-500 font-mono">{re.candidateEmail}</div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-neutral-100 text-neutral-800 rounded-md mb-1">
                            Réinscription {re.year}e année
                          </span>
                          <div className="font-semibold text-neutral-900 leading-snug line-clamp-2">
                            {re.thesisTitle}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-[11px] text-neutral-600 space-y-1">
                            <button
                              onClick={() =>
                                openAttachment({
                                  title: re.activityReport.fileName,
                                  subtitle: `Rapport d'activité — ${re.candidateName}`,
                                  content: re.activityReport.summary,
                                  author: re.candidateName,
                                  date: re.submittedDate,
                                })
                              }
                              className="text-neutral-900 underline font-semibold flex items-center gap-1 hover:text-neutral-700"
                            >
                              <FileText className="w-3 h-3 text-neutral-500" />
                              <span>Consulter rapport PDF</span>
                            </button>
                            <div className="text-[10px] text-neutral-500">
                              Pubs : <strong>{re.activityReport.publicationsCount}</strong> · Comms : <strong>{re.activityReport.communicationsCount}</strong>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-1 rounded-md">
                            {re.activityReport.progressPercentage}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {re.status === 'valide_encadrant' || re.status === 'valide_structure' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                              <Check className="w-3.5 h-3.5" />
                              <span>Avis Favorable</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => updateReRegistrationStatus(re.id, 'valide_encadrant')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Donner avis favorable</span>
                            </button>
                          )}
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

      {/* Edit Topic Modal */}
      <EditTopicModal topic={editingTopic} onClose={() => setEditingTopic(null)} />

      {/* Applicant Detailed Review Modal */}
      <ApplicantReviewModal
        application={reviewingApplication}
        onClose={() => setReviewingApplication(null)}
      />
    </div>
  );
};
