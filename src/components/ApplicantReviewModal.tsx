import React, { useState } from 'react';
import { CandidateApplication, CandidateDocument, ApplicationStep, ApplicationStatus } from '../types';
import { useApp } from '../context/AppContext';
import { X, Check, AlertCircle, FileText, Download, ExternalLink, User, Phone, Mail, CreditCard, GraduationCap, Building2 } from 'lucide-react';

interface ApplicantReviewModalProps {
  application: CandidateApplication | null;
  onClose: () => void;
}

export const ApplicantReviewModal: React.FC<ApplicantReviewModalProps> = ({
  application,
  onClose,
}) => {
  const { documents, updateApplicationProgress, openAttachment, showToast } = useApp();

  const [feedback, setFeedback] = useState(application?.supervisorFeedback || '');
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<CandidateDocument | null>(null);

  if (!application) return null;

  const candidateDocs = documents.filter(
    (d) => d.candidateEmail.toLowerCase() === application.candidateEmail.toLowerCase()
  );

  const docTypes: { type: CandidateDocument['type']; label: string }[] = [
    { type: 'baccalaureat', label: 'Baccalauréat' },
    { type: 'releve_notes', label: 'Relevés de notes' },
    { type: 'diplomes', label: 'Diplômes universitaires' },
    { type: 'cin', label: 'Carte Nationale (CIN)' },
  ];

  const handleAdvanceStep = () => {
    const nextStep = Math.min(5, (application.currentStep + 1)) as ApplicationStep;
    const statusMap: Record<number, ApplicationStatus> = {
      2: 'pieces_validees',
      3: 'avis_directeur',
      4: 'validation_structure',
      5: 'admis',
    };

    updateApplicationProgress(
      application.id,
      nextStep,
      statusMap[nextStep] || 'avis_directeur',
      feedback.trim() || `Dossier validé et promu à l’étape ${nextStep} par le directeur de thèse.`
    );
    showToast(`Candidat promu à l’étape ${nextStep} avec succès.`);
    onClose();
  };

  const handleRequestCorrection = () => {
    if (!feedback.trim()) {
      showToast('Veuillez renseigner les remarques pédagogiques pour la correction.');
      return;
    }

    updateApplicationProgress(
      application.id,
      application.currentStep,
      'a_corriger',
      feedback.trim()
    );
    showToast('Demande de correction transmise au candidat.');
    onClose();
  };

  const handleReject = () => {
    updateApplicationProgress(
      application.id,
      application.currentStep,
      'refuse',
      feedback.trim() || 'Candidature non retenue lors des délibérations pédagogiques.'
    );
    showToast('Candidature rejetée.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Évaluation Détaillée du Candidat
            </span>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
              Dossier de {application.candidateName}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Candidate Profile Summary Card */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-2.5">
              <span className="text-xs font-bold text-neutral-900">
                Coordonnées & Informations du Candidat
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-800">
                Étape actuelle : {application.currentStep} / 5 ({application.status.replace('_', ' ')})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="font-semibold text-neutral-900">{application.candidateName}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{application.candidateEmail}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <CreditCard className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>CIN : {application.candidateCin || 'CD654321'}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{application.candidatePhone || '+212 6 61 23 45 67'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Origine : {application.etablissementOrigine || 'Université USMBA'}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{application.diplomeOrigine || 'Master de Recherche (M2)'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 text-xs">
              <span className="text-neutral-500">Sujet de thèse postulé : </span>
              <strong className="text-neutral-900">{application.topicTitle}</strong>
            </div>
          </div>

          {/* Scanned Documents Inspection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Pièces Justificatives Numérisées ({candidateDocs.length} / 4)
              </h3>
              <span className="text-[11px] text-neutral-500">
                Cliquez pour prévisualiser le document
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {docTypes.map((dt) => {
                const doc = candidateDocs.find((d) => d.type === dt.type);

                return (
                  <div
                    key={dt.type}
                    className={`p-3.5 rounded-xl border transition-all ${
                      doc
                        ? 'bg-white border-neutral-200 hover:border-neutral-900 shadow-xs'
                        : 'bg-neutral-50 border-dashed border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-neutral-900 truncate">
                            {dt.label}
                          </div>
                          <div className="text-[11px] text-neutral-500 truncate font-mono">
                            {doc ? doc.fileName : 'Non encore déposé'}
                          </div>
                        </div>
                      </div>

                      {doc && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                          {doc.fileSize}
                        </span>
                      )}
                    </div>

                    {doc && (
                      <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-neutral-400">{doc.uploadedAt}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (doc.dataUrl) {
                              openAttachment({
                                title: doc.title,
                                subtitle: `Scan vérifié — ${application.candidateName}`,
                                content: `Document numérique haute résolution certifié conforme pour le candidat ${application.candidateName} (CIN: ${application.candidateCin || 'CD654321'}).`,
                                author: application.candidateName,
                                date: doc.uploadedAt,
                              });
                            } else {
                              openAttachment({
                                title: doc.title,
                                subtitle: `Document académique — ${application.candidateName}`,
                                content: `Fichier : ${doc.fileName}\nDéposé le : ${doc.uploadedAt}\nStatut : Validé au guichet académique USMBA.\n\nContenu vérifié conforme aux exigences du Centre d’Études Doctorales (CED).`,
                                author: application.candidateName,
                                date: doc.uploadedAt,
                              });
                            }
                          }}
                          className="font-bold text-neutral-900 underline hover:text-neutral-700 flex items-center gap-1"
                        >
                          <span>Voir le scan</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pedagogical Feedback & Remarks Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center justify-between">
              <span>Remarques pédagogiques de l'encadrant</span>
              <span className="text-[10px] text-neutral-400 font-normal">
                Visibles par le candidat et la commission de structure
              </span>
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex: Dossier recevable. Prérequis validés en apprentissage profond. Convoqué pour audition orale..."
              className="w-full p-3 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Decision Actions Footer */}
        <div className="px-5 py-4 border-t border-neutral-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors order-3 sm:order-1 text-center"
          >
            Fermer
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2">
            <button
              type="button"
              onClick={handleReject}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 border border-neutral-200 hover:bg-rose-50 rounded-xl transition-colors text-center"
            >
              Rejeter la candidature
            </button>

            <button
              type="button"
              onClick={handleRequestCorrection}
              className="px-3.5 py-2 text-xs font-semibold text-amber-700 hover:text-amber-800 border border-amber-200 bg-amber-50/60 hover:bg-amber-50 rounded-xl transition-colors text-center"
            >
              Demander une correction
            </button>

            {application.currentStep < 5 && (
              <button
                type="button"
                onClick={handleAdvanceStep}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Valider et Faire avancer ({application.currentStep + 1}/5)</span>
              </button>
            )}

            {application.currentStep === 5 && (
              <span className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Candidat Admis</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
