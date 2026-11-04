import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Check, X, FileText, ChevronRight, UserCheck, Phone, CreditCard, ShieldCheck } from 'lucide-react';
import { ThesisTopic, ApplicationStep, ApplicationStatus } from '../types';
import { EditTopicModal } from './EditTopicModal';

interface SupervisorViewProps {
  onOpenAddTopic: () => void;
}

export const SupervisorView: React.FC<SupervisorViewProps> = ({ onOpenAddTopic }) => {
  const {
    topics,
    applications,
    reRegistrations,
    updateTopic,
    updateApplicationProgress,
    updateReRegistrationStatus,
    openAttachment,
    currentUser,
    documents,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sujets' | 'candidatures' | 'reinscriptions'>('sujets');
  const [editingTopic, setEditingTopic] = useState<ThesisTopic | null>(null);

  // Topics for this supervisor
  const myTopics = topics;
  const myApplications = applications;
  const myReRegistrations = reRegistrations;

  const getStatusBadge = (status: ThesisTopic['status']) => {
    switch (status) {
      case 'valide':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Validé (Actif)</span>
          </span>
        );
      case 'en_attente':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>En attente</span>
          </span>
        );
      case 'cloture':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Clôturé</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 bg-white text-neutral-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Espace Directeur de Thèse
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-600 font-mono">{currentUser?.email}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-1">
            {currentUser?.name || 'Pr. Karim Bennani'}
          </h1>
          <p className="text-xs text-neutral-500">
            {currentUser?.establishment || 'FST Fès'} · {currentUser?.laboratory || 'Laboratoire LISAC'}
          </p>
        </div>

        {/* 1. Création de nouveaux sujets de thèse */}
        <button
          onClick={onOpenAddTopic}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Créer un sujet de thèse</span>
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-8 border-b border-neutral-200 pb-3 text-sm">
        <button
          onClick={() => setActiveTab('sujets')}
          className={`font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 ${
            activeTab === 'sujets'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Mes Sujets de Thèse ({myTopics.length})
        </button>

        <button
          onClick={() => setActiveTab('candidatures')}
          className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 ${
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
          className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 ${
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

      {/* 2. Modification des sujets existants & Liste */}
      {activeTab === 'sujets' && (
        <div className="space-y-4">
          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            {myTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-neutral-50/50 transition-colors"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    {getStatusBadge(topic.status)}
                    <span className="text-neutral-300">·</span>
                    <span className="text-xs text-neutral-600 font-medium">{topic.establishment}</span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-xs text-neutral-500">{topic.laboratory}</span>
                    <span className="text-neutral-300">·</span>
                    <span
                      className={`text-xs font-semibold ${
                        topic.structureValidationStatus === 'approuve'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {topic.structureValidationStatus === 'approuve'
                        ? 'Approuvé par la structure'
                        : 'En examen par la structure'}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-neutral-900 leading-snug">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-neutral-500 line-clamp-2">
                    {topic.summary}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-neutral-500 pt-1">
                    <span className="tabular-nums">
                      Candidats retenus : <strong className="text-neutral-900">{topic.slotsTaken} / {topic.slotsTotal}</strong>
                    </span>
                    <span>·</span>
                    <span>Créé le {topic.createdAt}</span>
                    {topic.updatedAt && (
                      <>
                        <span>·</span>
                        <span className="text-neutral-400">Modifié le {topic.updatedAt}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Modification button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingTopic(topic)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors whitespace-nowrap"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier le sujet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Consultation de la liste des candidats ayant postulé */}
      {activeTab === 'candidatures' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-neutral-200 rounded-2xl text-neutral-500 text-sm bg-white">
              Aucun candidat n'a encore postulé à vos sujets de thèse.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-xs">
              {myApplications.map((app) => {
                const candidateDocs = documents.filter(
                  (d) => d.candidateEmail.toLowerCase() === app.candidateEmail.toLowerCase()
                );

                return (
                  <div
                    key={app.id}
                    className="p-5 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-6"
                  >
                    <div className="space-y-2.5 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        <span className="font-bold text-neutral-900 text-sm">
                          {app.candidateName}
                        </span>
                        <span className="font-mono">({app.candidateEmail})</span>
                        {app.candidateCin && (
                          <>
                            <span>·</span>
                            <span className="font-mono font-medium text-neutral-700">CIN: {app.candidateCin}</span>
                          </>
                        )}
                        {app.candidatePhone && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-neutral-600">{app.candidatePhone}</span>
                          </>
                        )}
                      </div>

                      <div className="text-xs text-neutral-500">
                        Sujet visé : <span className="font-semibold text-neutral-900">{app.topicTitle}</span>
                      </div>

                      {/* Documents déposés par ce candidat */}
                      <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl space-y-1.5 text-xs">
                        <div className="font-semibold text-neutral-700 flex items-center justify-between">
                          <span>Pièces justificatives du candidat ({candidateDocs.length}/4) :</span>
                        </div>
                        {candidateDocs.length > 0 ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {candidateDocs.map((doc) => (
                              <button
                                key={doc.id}
                                onClick={() =>
                                  openAttachment({
                                    title: doc.title,
                                    subtitle: `Document candidat - ${app.candidateName}`,
                                    content: `Fichier : ${doc.fileName}\nDéposé le : ${doc.uploadedAt}\nStatut : Validé au guichet académique.`,
                                    author: app.candidateName,
                                    date: doc.uploadedAt,
                                  })
                                }
                                className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-[11px] font-medium text-neutral-800 hover:border-neutral-900 transition-colors flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3 text-neutral-500" />
                                <span>{doc.title.split(' ')[0]}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-neutral-400">Aucune pièce déposée pour l'instant.</p>
                        )}
                      </div>

                      {/* Étape actuelle dans la barre de progression */}
                      <div className="text-xs text-neutral-600">
                        Étape de sélection : <strong className="text-neutral-900">{app.currentStep} / 5</strong> ({app.status})
                      </div>
                    </div>

                    {/* Actions d'avancement pour le directeur de thèse */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                      {app.currentStep < 5 && (
                        <button
                          onClick={() => {
                            const nextStep = (app.currentStep + 1) as ApplicationStep;
                            const statusMap: Record<number, ApplicationStatus> = {
                              2: 'validation_structure',
                              3: 'selection',
                              4: 'entretien',
                              5: 'admis',
                            };
                            updateApplicationProgress(
                              app.id,
                              nextStep,
                              statusMap[nextStep] || 'selection',
                              `Dossier promu à l’étape ${nextStep} par le directeur de thèse.`
                            );
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Faire avancer l’étape ({app.currentStep + 1}/5)</span>
                        </button>
                      )}

                      {app.currentStep === 5 && (
                        <span className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Candidat Admis</span>
                        </span>
                      )}

                      <button
                        onClick={() =>
                          updateApplicationProgress(
                            app.id,
                            app.currentStep,
                            'refuse',
                            'Candidature non retenue lors des délibérations de la commission.'
                          )
                        }
                        className="px-3 py-2 text-xs text-rose-600 hover:text-rose-700 border border-neutral-200 rounded-xl hover:bg-rose-50 transition-colors"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Consultation des demandes de réinscription */}
      {activeTab === 'reinscriptions' && (
        <div className="space-y-4">
          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            {myReRegistrations.map((re) => (
              <div
                key={re.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="font-bold text-neutral-900">{re.candidateName}</span>
                    <span>·</span>
                    <span className="font-semibold text-neutral-800">Réinscription {re.year}e année</span>
                    <span>·</span>
                    <span>Déposé le {re.submittedDate}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-neutral-900">{re.thesisTitle}</h4>
                  <p className="text-xs text-neutral-600 line-clamp-2">{re.activityReport.summary}</p>

                  <div className="flex items-center gap-4 text-xs text-neutral-500 pt-1">
                    <span>Publications : <strong>{re.activityReport.publicationsCount}</strong></span>
                    <span>Communications : <strong>{re.activityReport.communicationsCount}</strong></span>
                    <span>Avancement : <strong>{re.activityReport.progressPercentage}%</strong></span>
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
                      className="ml-auto text-neutral-900 underline font-medium"
                    >
                      Consulter le rapport complet
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {re.status === 'valide_encadrant' || re.status === 'valide_structure' ? (
                    <span className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-xl flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Avis favorable validé</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => updateReRegistrationStatus(re.id, 'valide_encadrant')}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Donner avis favorable</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      <EditTopicModal topic={editingTopic} onClose={() => setEditingTopic(null)} />
    </div>
  );
};
