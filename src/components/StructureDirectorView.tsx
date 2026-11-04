import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThesisTopic, StructureValidationStatus } from '../types';
import { ESTABLISHMENTS } from '../data/mockData';
import { Check, X, Shield, FileText, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

export const StructureDirectorView: React.FC = () => {
  const {
    topics,
    approveTopicStructure,
    rejectTopicStructure,
    applications,
    reRegistrations,
    currentUser,
    openAttachment,
  } = useApp();

  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('Tous');
  const [filterValidation, setFilterValidation] = useState<'all' | 'en_examen' | 'approuve'>('all');
  const [feedbackInput, setFeedbackInput] = useState<{ [topicId: string]: string }>({});

  const filteredTopics = topics.filter((t) => {
    const matchesEst = selectedEstablishment === 'Tous' || t.establishment === selectedEstablishment;
    const matchesVal =
      filterValidation === 'all' ||
      (filterValidation === 'en_examen' && t.structureValidationStatus === 'en_examen') ||
      (filterValidation === 'approuve' && t.structureValidationStatus === 'approuve');
    return matchesEst && matchesVal;
  });

  const pendingStructureCount = topics.filter((t) => t.structureValidationStatus === 'en_examen').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 bg-white text-neutral-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Espace Directeur de la Structure / Administration
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-600 font-mono">{currentUser?.email}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-1">
            Validation & Approbation Formelle des Sujets de Thèse
          </h1>
          <p className="text-xs text-neutral-500">
            Centre d’Études Doctorales (CED) & Conseil de la Structure de Recherche
          </p>
        </div>

        {/* Filter by establishment */}
        <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
          <span className="text-neutral-500">Établissement :</span>
          <select
            value={selectedEstablishment}
            onChange={(e) => setSelectedEstablishment(e.target.value)}
            className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-6 border-b border-neutral-200 pb-3 text-sm">
        <button
          onClick={() => setFilterValidation('all')}
          className={`font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 ${
            filterValidation === 'all'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Tous les Sujets ({topics.length})
        </button>

        <button
          onClick={() => setFilterValidation('en_examen')}
          className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 ${
            filterValidation === 'en_examen'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <span>En examen par la structure</span>
          {pendingStructureCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800">
              {pendingStructureCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterValidation('approuve')}
          className={`font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 ${
            filterValidation === 'approuve'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Approuvés Formellement ({topics.filter((t) => t.structureValidationStatus === 'approuve').length})
        </button>
      </div>

      {/* 1. Examen complet des sujets de thèse proposés */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-neutral-200 rounded-2xl text-neutral-500 text-sm bg-white">
            Aucun sujet ne correspond aux critères de filtre.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            {filteredTopics.map((topic) => {
              const isApproved = topic.structureValidationStatus === 'approuve';
              const isPending = topic.structureValidationStatus === 'en_examen';

              return (
                <article
                  key={topic.id}
                  className="p-6 space-y-4 hover:bg-neutral-50/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isApproved ? 'Approuvé par la structure' : isPending ? 'En attente de délibération' : 'Rejeté'}
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span className="font-semibold text-neutral-900">{topic.establishment}</span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-neutral-600">{topic.laboratory}</span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-neutral-600">Proposé par {topic.supervisorName}</span>
                      </div>

                      <h3 className="text-base font-bold text-neutral-900 tracking-tight leading-snug">
                        {topic.title}
                      </h3>

                      {/* Examen complet : descriptif et mots-clés */}
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {topic.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 pt-1">
                        <span className="font-medium text-neutral-700">Mots-clés :</span>
                        {topic.keywords.map((k) => (
                          <span key={k} className="px-2 py-0.5 bg-neutral-100 rounded-md font-mono text-[11px] text-neutral-700">
                            {k}
                          </span>
                        ))}
                        <span className="text-neutral-300 ml-2">·</span>
                        <span>Places : <strong className="text-neutral-800">{topic.slotsTotal}</strong></span>
                        <span className="text-neutral-300">·</span>
                        <span>Dépôt le {topic.createdAt}</span>
                      </div>

                      {topic.structureFeedback && (
                        <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs text-neutral-600">
                          <strong className="text-neutral-900">Avis formel :</strong> {topic.structureFeedback}
                        </div>
                      )}
                    </div>

                    {/* 2. Validation / Approbation formelle au niveau de la structure */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 pt-2 md:pt-0">
                      {isApproved ? (
                        <div className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-xl">
                          <Check className="w-3.5 h-3.5" />
                          <span>Approbation formelle active</span>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            approveTopicStructure(
                              topic.id,
                              'Sujet validé et jugé conforme aux critères scientifiques et orientations de la structure de recherche.'
                            )
                          }
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approuver formellement</span>
                        </button>
                      )}

                      {!isApproved && (
                        <button
                          onClick={() =>
                            rejectTopicStructure(
                              topic.id,
                              'Sujet non retenu par le conseil scientifique de la structure.'
                            )
                          }
                          className="px-3 py-2 text-xs text-rose-600 hover:text-rose-700 border border-neutral-200 rounded-xl hover:bg-rose-50 transition-colors whitespace-nowrap"
                        >
                          Rejeter
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
