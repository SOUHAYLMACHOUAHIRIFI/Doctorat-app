import React from 'react';
import {
  X,
  Building2,
  User,
  Tag,
  BookOpen,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  Sparkles,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { ThesisTopic } from '../types';

interface TopicDetailModalProps {
  topic: ThesisTopic | null;
  onClose: () => void;
  onApprove?: (topic: ThesisTopic) => void;
  onReject?: (topic: ThesisTopic) => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!topic) return null;

  const isApproved = topic.structureValidationStatus === 'approuve';
  const isRejected = topic.structureValidationStatus === 'rejete';
  const isPending = !isApproved && !isRejected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-neutral-800 rounded-xl text-neutral-300">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                CED USMBA · Fiche Détaillée de Thèse
              </span>
              <h2 className="text-sm font-bold text-white">
                Prévisualisation du Sujet de Recherche
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-neutral-800">
          {/* Status & ID Badge Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Réf : </span>
              <span className="font-mono font-bold text-neutral-900">{topic.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Statut Structure CED : </span>
              <span
                className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-md text-xs ${
                  isApproved
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : isPending
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {isApproved ? 'Approuvé par le CED' : isPending ? 'En examen structure' : 'Rejeté'}
              </span>
            </div>
          </div>

          {/* Topic Title */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Intitulé Officiel du Sujet de Thèse
            </div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
              {topic.title}
            </h1>
          </div>

          {/* Host Lab & Supervisor Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-500 uppercase text-[10px] tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Laboratoire & Établissement d'accueil</span>
              </div>
              <div className="space-y-1 pl-1">
                <div>
                  <span className="text-neutral-500">Laboratoire : </span>
                  <strong className="text-neutral-900">{topic.laboratory}</strong>
                </div>
                <div>
                  <span className="text-neutral-500">Établissement : </span>
                  <span className="font-medium text-neutral-800">{topic.establishment}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Date de proposition : </span>
                  <span className="font-mono text-neutral-700">{topic.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-neutral-200 pt-3 sm:pt-0 sm:pl-4">
              <div className="flex items-center gap-2 font-semibold text-neutral-500 uppercase text-[10px] tracking-wider">
                <User className="w-3.5 h-3.5" />
                <span>Direction de Thèse</span>
              </div>
              <div className="space-y-1 pl-1">
                <div>
                  <span className="text-neutral-500">Directeur : </span>
                  <strong className="text-neutral-900">{topic.supervisorName}</strong>
                </div>
                <div>
                  <span className="text-neutral-500">Contact : </span>
                  <span className="font-mono text-neutral-700">
                    {topic.supervisorEmail || 'contact.ced@usmba.ac.ma'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Capacité d'accueil : </span>
                  <span className="font-bold text-neutral-900">
                    {topic.slotsTaken} / {topic.slotsTotal} poste{topic.slotsTotal > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Research Axis */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
              <Layers className="w-3.5 h-3.5 text-neutral-600" />
              <span>Axe de Recherche Thématique</span>
            </div>
            <div className="p-3.5 bg-neutral-100/70 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900">
              {topic.researchAxis || 'Sciences des Données, Intelligence Artificielle & Systèmes Embarqués'}
            </div>
          </div>

          {/* Scientific Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
              <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
              <span>Résumé Scientifique & Problématique</span>
            </div>
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
              {topic.summary ||
                'Ce projet de thèse s’inscrit dans le cadre des axes prioritaires du CED USMBA. Il vise à explorer les verrous scientifiques liés à la modélisation et à l’évaluation expérimentale de nouveaux paradigmes computationnels à haute efficacité énergétique.'}
            </div>
          </div>

          {/* Keywords */}
          {topic.keywords && topic.keywords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <Tag className="w-3.5 h-3.5 text-neutral-600" />
                <span>Mots-clés Disciplinaires</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topic.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-800 rounded-lg border border-neutral-200"
                  >
                    #{kw.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Candidate Prerequisites */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
              <GraduationCap className="w-3.5 h-3.5 text-neutral-600" />
              <span>Profil Requis & Prérequis du Candidat</span>
            </div>
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs text-neutral-700 leading-relaxed">
              <p>
                {topic.prerequisites ||
                  'Titulaire d’un Master de Recherche ou d’un Diplôme d’Ingénieur d’État dans une discipline affine. Mention Bien ou Très Bien requise. Compétences prouvées en algorithmique, modélisation et communication scientifique en anglais.'}
              </p>
            </div>
          </div>

          {/* Methodology */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Méthodologie & Démarche Scientifique Prévisionnelle
            </div>
            <div className="p-3.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-600 leading-relaxed">
              {topic.methodology ||
                'Étude bibliographique approfondie (Mois 1-6), conception algorithmique (Mois 7-18), expérimentations sur plateforme de calcul intensif (Mois 19-30), rédaction du manuscrit et valorisation par brevets et articles de revues indexées (Mois 31-36).'}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Examen formel par la Commission Doctorale du CED</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors shadow-xs"
            >
              Fermer
            </button>

            {!isApproved && onReject && (
              <button
                onClick={() => {
                  onReject(topic);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Rejeter le sujet</span>
              </button>
            )}

            {!isApproved && onApprove && (
              <button
                onClick={() => {
                  onApprove(topic);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approuver le sujet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
