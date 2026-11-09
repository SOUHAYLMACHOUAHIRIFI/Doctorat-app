import React, { useState } from 'react';
import {
  X,
  Printer,
  CheckCircle,
  FileText,
  BookOpen,
  Award,
  Calendar,
  Building,
  User,
  Check,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { ReRegistration } from '../types';
import { useApp } from '../context/AppContext';

interface AnnualReportModalProps {
  reRegistration: ReRegistration | null;
  onClose: () => void;
  onApprove?: (id: string, notes?: string) => void;
}

export const AnnualReportModal: React.FC<AnnualReportModalProps> = ({
  reRegistration,
  onClose,
  onApprove,
}) => {
  const { showToast } = useApp();
  const [supervisorNote, setSupervisorNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reRegistration) return null;

  const isApproved =
    reRegistration.status === 'valide_encadrant' ||
    reRegistration.status === 'valide_structure' ||
    reRegistration.status === 'AVIS_FAVORABLE_ENCADRANT' ||
    reRegistration.status === 'VALIDE_CED';

  const handlePrint = () => {
    window.print();
  };

  const handleGiveApproval = async () => {
    if (!onApprove) return;
    setIsSubmitting(true);
    try {
      await onApprove(reRegistration.id, supervisorNote || 'Avis très favorable accordé suite à l’examen du rapport d’avancement.');
      showToast('Avis favorable émis avec succès pour cette réinscription.');
      onClose();
    } catch {
      showToast('Erreur lors de la validation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = reRegistration.activityReport.progressPercentage || 70;
  const pubsCount = reRegistration.activityReport.publicationsCount || 2;
  const commsCount = reRegistration.activityReport.communicationsCount || 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 print:m-0 print:p-0 print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Modal Top Actions Bar */}
        <div className="px-5 sm:px-6 py-3.5 bg-neutral-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-neutral-800 rounded-lg text-neutral-300">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                CED USMBA · Rapport Annuel d'Avancement Doctoral
              </span>
              <p className="text-[11px] text-neutral-400 font-mono">
                Réf: CED-RAP-{reRegistration.id.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-colors flex items-center gap-1.5 border border-neutral-700 shadow-xs"
              title="Imprimer ou enregistrer en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / Exporter PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content - Printable Official Document */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-neutral-900 print:p-0 print:overflow-visible">
          {/* Official University Header */}
          <div className="border-b-2 border-neutral-900 pb-5 text-center space-y-1">
            <div className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">
              Royaume du Maroc — Ministère de l'Enseignement Supérieur, de la Recherche Scientifique et de l'Innovation
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 uppercase">
              Université Sidi Mohamed Ben Abdellah de Fès (USMBA)
            </h1>
            <div className="text-xs font-semibold text-neutral-700">
              Centre d'Études Doctorales (CED) · {reRegistration.establishment}
            </div>
            <div className="inline-block mt-2 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-bold text-neutral-900">
              RAPPORT ANNUEL D'ACTIVITÉ ET D'AVANCEMENT DE THÈSE — ANNÉE {reRegistration.year}
            </div>
          </div>

          {/* Identification Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider">
                <User className="w-3.5 h-3.5" />
                <span>Doctorant & Inscription</span>
              </div>
              <div className="space-y-1 pl-1">
                <div>
                  <span className="text-neutral-500">Nom & Prénom : </span>
                  <strong className="text-neutral-900 text-sm">{reRegistration.candidateName}</strong>
                </div>
                <div>
                  <span className="text-neutral-500">Email institutionnel : </span>
                  <span className="font-mono text-neutral-800">{reRegistration.candidateEmail}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Année de thèse : </span>
                  <span className="font-bold text-neutral-900">{reRegistration.year}e Année Doctorale</span>
                </div>
                <div>
                  <span className="text-neutral-500">Date de dépôt du rapport : </span>
                  <span className="font-mono text-neutral-700">{reRegistration.submittedDate}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 border-t md:border-t-0 md:border-l border-neutral-200 pt-3 md:pt-0 md:pl-5">
              <div className="flex items-center gap-2 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider">
                <Building className="w-3.5 h-3.5" />
                <span>Encadrement & Rattachement</span>
              </div>
              <div className="space-y-1 pl-1">
                <div>
                  <span className="text-neutral-500">Directeur de thèse : </span>
                  <strong className="text-neutral-900">{reRegistration.supervisorName}</strong>
                </div>
                <div>
                  <span className="text-neutral-500">Établissement : </span>
                  <span className="text-neutral-800 font-medium">{reRegistration.establishment}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Statut de la demande : </span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isApproved ? 'Avis Favorable Accordé' : 'En attente d’avis encadrant'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Thesis Title Box */}
          <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Intitulé du Sujet de Recherche Doctorale
            </div>
            <p className="text-sm sm:text-base font-bold text-neutral-900 leading-snug">
              {reRegistration.thesisTitle}
            </p>
          </div>

          {/* Section 1: Progress Gauge & Drafting status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neutral-800" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-900">
                  1. État d'Avancement des Travaux & Rédaction
                </h2>
              </div>
              <span className="text-xs font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg">
                Progression globale : {progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden border border-neutral-200">
              <div
                className="bg-neutral-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Manuscript Drafting Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-neutral-900">
                  <span>Chapitre 1 : État de l'art & Problématique</span>
                  <span className="text-emerald-700 font-bold">100%</span>
                </div>
                <p className="text-[11px] text-neutral-500">Revue systématique de la littérature finalisée et validée.</p>
              </div>

              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-neutral-900">
                  <span>Chapitre 2 : Modélisation & Méthodologie</span>
                  <span className="text-emerald-700 font-bold">{Math.min(100, Math.round(progress * 1.1))}%</span>
                </div>
                <p className="text-[11px] text-neutral-500">Architecture conceptuelle et algorithmes conçus.</p>
              </div>

              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-neutral-900">
                  <span>Chapitre 3 : Résultats Expérimentaux & Métriques</span>
                  <span className="text-neutral-800 font-bold">{Math.min(100, progress)}%</span>
                </div>
                <p className="text-[11px] text-neutral-500">Campagnes de tests et collecte de données empiriques.</p>
              </div>

              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-neutral-900">
                  <span>Chapitre 4 : Discussion & Rédaction Manuscrit</span>
                  <span className="text-neutral-600 font-bold">{Math.max(15, progress - 30)}%</span>
                </div>
                <p className="text-[11px] text-neutral-500">Synthèse comparative et structuration des conclusions.</p>
              </div>
            </div>

            {/* Activity Report Summary */}
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
              <div className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                Synthèse des réalisations soumises par le doctorant
              </div>
              <p className="text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap">
                {reRegistration.activityReport.summary ||
                  'Au cours de cette année universitaire, les travaux ont porté sur l’optimisation des modèles neuronaux et leur intégration embarquée. Les résultats obtenus ont fait l’objet de soumissions d’articles et communications internationales conformément aux exigences du CED USMBA.'}
              </p>
            </div>
          </div>

          {/* Section 2: Publications & Communications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-neutral-800" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-900">
                  2. Production Scientifique & Communications
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-neutral-100 rounded-md font-semibold text-neutral-800">
                  {pubsCount} Article{pubsCount > 1 ? 's' : ''} indexé{pubsCount > 1 ? 's' : ''}
                </span>
                <span className="px-2 py-0.5 bg-neutral-100 rounded-md font-semibold text-neutral-800">
                  {commsCount} Communication{commsCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="overflow-hidden border border-neutral-200 rounded-2xl bg-white shadow-xs text-xs">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Titre de la contribution</th>
                    <th className="py-2.5 px-3">Revue / Conférence</th>
                    <th className="py-2.5 px-3 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-neutral-800">Revue Q1/Q2</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-neutral-900">
                      Energy-Efficient Edge Intelligence for Autonomous Unmanned Systems
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px]">
                      IEEE Transactions on Industrial Informatics (Scopus)
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Publié / Validé
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-neutral-800">Conf. Int.</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-neutral-900">
                      Low-Latency Neural Compression for Aerial Embedded Edge Devices
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px]">
                      IEEE International Conference on Smart Systems (Fès, 2026)
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-neutral-100 text-neutral-800 border border-neutral-200">
                        Actes Indexés
                      </span>
                    </td>
                  </tr>
                  {pubsCount >= 3 && (
                    <tr>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-neutral-800">Brevet / Journal</span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-neutral-900">
                        Système neuromorphique embarqué d’évitement d’obstacles à ultra-basse latence
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px]">
                        OMPIC / Brevet d'invention déposé
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                          En examen
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Doctoral Trainings & Credits */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-neutral-800" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-900">
                  3. Formations Doctorales Suivies & Crédits / Heures
                </h2>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                180 / 200 Heures validées (Conforme CED)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                <div className="font-semibold text-neutral-900">Formations Transversales</div>
                <div className="text-[11px] text-neutral-500 leading-snug">
                  Méthodologie de la recherche, Éthique scientifique & Propriété intellectuelle (60 heures).
                </div>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                <div className="font-semibold text-neutral-900">Formations Disciplinaires</div>
                <div className="text-[11px] text-neutral-500 leading-snug">
                  Calcul haute performance, Deep Learning avancé & Analyse statistique (80 heures).
                </div>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                <div className="font-semibold text-neutral-900">Séminaires de Laboratoire</div>
                <div className="text-[11px] text-neutral-500 leading-snug">
                  Participation active aux journées doctorales et séminaires de structure (40 heures).
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Motivated Supervisor Opinion & Signature */}
          <div className="p-5 border-2 border-neutral-900 rounded-2xl space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-neutral-900" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-900">
                  4. Avis Motivé du Directeur de Thèse
                </h2>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isApproved
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {isApproved ? 'AVIS FAVORABLE DÉLIVRÉ' : 'DÉCISION EN ATTENTE'}
              </span>
            </div>

            {/* Existing feedback or input */}
            {isApproved ? (
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-neutral-800">Évaluation motivée enregistrée :</div>
                <p className="text-neutral-700 italic">
                  "{reRegistration.supervisorFeedback ||
                    'Le doctorant fait preuve d’une rigueur méthodologique exemplaire et respecte pleinement le calendrier prévisionnel. La qualité des publications justifie pleinement la réinscription pour la poursuite des travaux.'}"
                </p>
              </div>
            ) : (
              <div className="space-y-2 print:hidden">
                <label className="block text-xs font-semibold text-neutral-700">
                  Rédiger l'avis circonstancié de l'encadrant :
                </label>
                <textarea
                  value={supervisorNote}
                  onChange={(e) => setSupervisorNote(e.target.value)}
                  placeholder="Ex : Travail satisfaisant, publication prometteuse, objectifs atteints. Avis très favorable pour la réinscription..."
                  rows={3}
                  className="w-full p-3 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            )}

            {/* Official Signature & Stamp Zone */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-200 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-neutral-700">Signature du Doctorant :</div>
                <div className="font-mono text-[11px] text-neutral-500">
                  Certifié et horodaté le {reRegistration.submittedDate}
                </div>
                <div className="h-10 flex items-center text-xs font-serif italic text-neutral-600">
                  {reRegistration.candidateName}
                </div>
              </div>

              <div className="space-y-1 text-right">
                <div className="font-semibold text-neutral-700">Cachet & Signature de l'Encadrant :</div>
                <div className="font-mono text-[11px] text-neutral-500">
                  {isApproved ? 'Validé électroniquement' : 'En attente de visa'}
                </div>
                <div className="h-10 flex items-center justify-end">
                  {isApproved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{reRegistration.supervisorName} (Signé)</span>
                    </span>
                  ) : (
                    <span className="text-neutral-400 italic text-[11px]">Signature requise ci-dessous</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Document conforme au règlement intérieur des études doctorales USMBA</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors shadow-xs"
            >
              Fermer
            </button>

            {!isApproved && onApprove && (
              <button
                onClick={handleGiveApproval}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Validation...' : 'Valider & Émettre Avis Favorable'}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-neutral-200 hover:bg-neutral-300 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
