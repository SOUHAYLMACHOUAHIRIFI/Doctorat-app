import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ESTABLISHMENTS } from '../data/mockData';
import { Check, X, Shield, Building2 } from 'lucide-react';

export const StructureDirectorView: React.FC = () => {
  const {
    topics,
    approveTopicStructure,
    rejectTopicStructure,
    currentUser,
  } = useApp();

  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('Tous');
  const [filterValidation, setFilterValidation] = useState<'all' | 'en_examen' | 'approuve'>('all');

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-white text-neutral-900">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 border border-neutral-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
              Espace Directeur de la Structure / Administration
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-600 font-mono truncate max-w-[220px] sm:max-w-none">
              {currentUser?.email}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
            Validation & Approbation Formelle des Sujets de Thèse
          </h1>
          <p className="text-xs text-neutral-500">
            Centre d’Études Doctorales (CED) & Conseil de la Structure de Recherche
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

      {/* Responsive Horizontal Scroll Filter Tabs */}
      <div className="border-b border-neutral-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 sm:gap-6 min-w-max pb-3 text-xs sm:text-sm">
          <button
            onClick={() => setFilterValidation('all')}
            className={`font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              filterValidation === 'all'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Tous les Sujets ({topics.length})
          </button>

          <button
            onClick={() => setFilterValidation('en_examen')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
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
            className={`font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              filterValidation === 'approuve'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Approuvés ({topics.filter((t) => t.structureValidationStatus === 'approuve').length})
          </button>
        </div>
      </div>

      {/* 1. Examen complet et validation/rejet */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="p-8 sm:p-12 text-center border border-dashed border-neutral-200 rounded-2xl text-neutral-500 text-sm bg-white">
            Aucun sujet de thèse ne correspond aux filtres sélectionnés.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            {filteredTopics.map((topic) => {
              const isApproved = topic.structureValidationStatus === 'approuve';
              const isPending = topic.structureValidationStatus === 'en_examen';

              return (
                <article
                  key={topic.id}
                  className="p-4 sm:p-6 space-y-4 hover:bg-neutral-50/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
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
                        <span className="text-neutral-600">Dir. {topic.supervisorName}</span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight leading-snug">
                        {topic.title}
                      </h3>

                      {/* Examen complet : descriptif et mots-clés */}
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {topic.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 pt-1">
                        <span className="font-medium text-neutral-700">Mots-clés :</span>
                        {topic.keywords.map((k) => (
                          <span key={k} className="px-2 py-0.5 bg-neutral-100 rounded-md font-mono text-[11px] text-neutral-700">
                            {k}
                          </span>
                        ))}
                        <span className="text-neutral-300 ml-1">·</span>
                        <span>Places : <strong className="text-neutral-800">{topic.slotsTotal}</strong></span>
                        <span className="text-neutral-300">·</span>
                        <span>Dépôt le {topic.createdAt}</span>
                      </div>

                      {topic.structureFeedback && (
                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600">
                          <strong className="text-neutral-900">Avis formel :</strong> {topic.structureFeedback}
                        </div>
                      )}
                    </div>

                    {/* 2. Validation / Rejet au niveau de la structure */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-2 md:pt-0">
                      {isApproved ? (
                        <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <Check className="w-3.5 h-3.5" />
                          <span>Approbation validée</span>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            approveTopicStructure(
                              topic.id,
                              'Sujet validé et jugé conforme aux orientations scientifiques de la structure.'
                            )
                          }
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs"
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
                          className="w-full sm:w-auto flex items-center justify-center px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 border border-neutral-200 rounded-xl hover:bg-rose-50 transition-colors whitespace-nowrap"
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
