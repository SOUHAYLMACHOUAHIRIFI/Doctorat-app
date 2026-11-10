import React, { useState } from 'react';
import { CandidateApplication, CandidateDocument } from '../types';
import { useApp } from '../context/AppContext';
import { X, Check, AlertCircle, FileText, ExternalLink, User, Phone, Mail, IdCard, GraduationCap, Building2, Award, Eye, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface ApplicantReviewModalProps {
  application: CandidateApplication | null;
  onClose: () => void;
}

export const ApplicantReviewModal: React.FC<ApplicantReviewModalProps> = ({
  application,
  onClose,
}) => {
  const { documents, evaluateApplicationSupervisor, openAttachment } = useApp();

  const [decision, setDecision] = useState<'favorable' | 'defavorable' | 'a_corriger'>('favorable');
  const [grade, setGrade] = useState(application?.supervisorGrade || '18/20');
  const [feedback, setFeedback] = useState(application?.supervisorFeedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize state when application changes
  React.useEffect(() => {
    if (application) {
      setDecision('favorable');
      setGrade(application.supervisorGrade || '18/20');
      setFeedback(application.supervisorFeedback || '');
    }
  }, [application]);

  // Retrieve candidate documents without dropping multiple files per type
  const candidateDocs: CandidateDocument[] = React.useMemo(() => {
    if (!application) return [];
    const list: CandidateDocument[] = [];
    if (application.documents && Array.isArray(application.documents)) {
      list.push(...application.documents);
    }
    const matchingContext = documents.filter(
      (d) =>
        (d.candidateEmail && d.candidateEmail.toLowerCase() === application.candidateEmail.toLowerCase()) ||
        (d.candidateId && application.candidateId && d.candidateId === application.candidateId)
    );
    matchingContext.forEach((d) => {
      if (!list.some((existing) => existing.id === d.id)) {
        list.push(d);
      }
    });
    return list;
  }, [application, documents]);

  if (!application) return null;

  const docTypes: { type: CandidateDocument['type']; label: string }[] = [
    { type: 'baccalaureat', label: '1. Diplôme du Baccalauréat' },
    { type: 'releve_notes', label: '2. Relevés de Notes (Licence & Master)' },
    { type: 'diplomes', label: '3. Diplômes universitaires' },
    { type: 'cin', label: '4. Carte d’Identité Nationale (CIN)' },
  ];

  const findDocsForType = (type: CandidateDocument['type']) => {
    return candidateDocs.filter((d) => {
      const t = (d.type || d.typeCode || '').toLowerCase();
      const target = type.toLowerCase();
      if (t === target) return true;
      if (target === 'baccalaureat' && (t === 'bac' || t.includes('bac'))) return true;
      if (
        target === 'releve_notes' &&
        (t === 'notes' || t.includes('note') || t.includes('releve') || t.includes('transcript'))
      )
        return true;
      if (target === 'diplomes' && (t === 'diplome' || t.includes('diplom') || t.includes('degree')))
        return true;
      if (target === 'cin' && t.includes('cin')) return true;
      return false;
    });
  };

  const submittedDocsCount = docTypes.filter((dt) => findDocsForType(dt.type).length > 0).length;
  const isDossierComplet = submittedDocsCount >= 4;

  const handleDecisionSubmit = async () => {
    setIsSubmitting(true);
    try {
      await evaluateApplicationSupervisor(
        application.id,
        decision,
        grade.trim(),
        feedback.trim() ||
          (decision === 'favorable'
            ? 'Dossier académique recevable. Prérequis méthodologiques et scientifiques validés.'
            : decision === 'a_corriger'
            ? 'Pièces à renouveler ou clarifications requises sur le cursus.'
            : 'Candidature non retenue lors des délibérations pédagogiques.')
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDocument = (doc: CandidateDocument) => {
    openAttachment({
      title: doc.title,
      subtitle: `Document numérique vérifié — ${application.candidateName}`,
      content: `Fichier : ${doc.fileName}\nDate de dépôt : ${doc.uploadedAt}\nCandidat : ${application.candidateName} (CIN : ${application.candidateCin || 'CD654321'})\nÉtablissement : ${application.establishment}\n\nDocument numérique certifié conforme aux exigences académiques du CED USMBA.`,
      author: application.candidateName,
      date: doc.uploadedAt,
      dataUrl: doc.dataUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Évaluation Pédagogique du Dossier · Directeur de Thèse
            </div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
              Dossier de candidature : {application.candidateName}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Candidate Profile Summary */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-2.5">
              <span className="text-xs font-bold text-neutral-900">
                Profil & Parcours Académique
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-800">
                Étape {application.currentStep} / 5 ({application.status.replace('_', ' ')})
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
                <IdCard className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>CIN : {application.candidateCin || 'CD654321'}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{application.candidatePhone || '+212 6 61 23 45 67'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Origine : {application.etablissementOrigine || 'FST Fès'}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{application.diplomeOrigine || 'Master de Recherche'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200/80 text-xs">
              <span className="text-neutral-500">Sujet postulé : </span>
              <strong className="text-neutral-900">{application.topicTitle}</strong>
            </div>
          </div>

          {/* DEDICATED SECTION: Pièces justificatives scannées */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Pièces justificatives scannées</span>
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Cliquez sur n’importe quelle pièce pour ouvrir la prévisualisation pleine page certifiée
                </p>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 self-start sm:self-auto ${
                  isDossierComplet
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
              >
                {isDossierComplet && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                <span>
                  {submittedDocsCount} / 4 pièces transmises {isDossierComplet ? '(Dossier complet)' : ''}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {docTypes.map((dt) => {
                const docs = findDocsForType(dt.type);
                const hasDocs = docs.length > 0;

                return (
                  <div
                    key={dt.type}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      hasDocs
                        ? 'bg-white border-neutral-200 shadow-xs'
                        : 'bg-rose-50/40 border-dashed border-rose-300'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Category Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">
                            {dt.label}
                          </h4>
                          <span className="text-[10px] text-neutral-500">
                            {hasDocs
                              ? `${docs.length} fichier${docs.length > 1 ? 's' : ''} justificatif${docs.length > 1 ? 's' : ''}`
                              : 'Pièce justificative requise'}
                          </span>
                        </div>

                        {hasDocs ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{docs.length} fichier{docs.length > 1 ? 's' : ''}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300 flex items-center gap-1 shrink-0">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Non fournie</span>
                          </span>
                        )}
                      </div>

                      {/* File Items */}
                      {hasDocs ? (
                        <div className="space-y-2">
                          {docs.map((doc, docIdx) => (
                            <div
                              key={doc.id || docIdx}
                              onClick={() => handleOpenDocument(doc)}
                              className="p-2.5 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-lg cursor-pointer transition-colors group flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {doc.dataUrl && doc.dataUrl.startsWith('data:image/') ? (
                                  <img
                                    src={doc.dataUrl}
                                    alt={doc.title}
                                    className="w-8 h-8 object-cover rounded-md border border-neutral-300 shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-md bg-neutral-900 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                                    PDF
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-neutral-900 block truncate group-hover:text-black">
                                    {doc.title || doc.fileName}
                                  </span>
                                  <span className="text-[10px] text-neutral-500 font-mono block truncate">
                                    {doc.fileName} · {doc.fileSize}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDocument(doc);
                                }}
                                className="px-2 py-1 text-[11px] font-semibold text-neutral-900 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors inline-flex items-center gap-1 shrink-0 shadow-2xs"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Voir</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-2 text-[11px] text-rose-600 italic">
                          Aucun document fourni par le candidat pour cette pièce obligatoire.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supervisor Decision Area */}
          <div className="p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-neutral-800" />
              <span>Avis et Délibération Pédagogique du Directeur de Thèse</span>
            </h3>

            {/* Decision selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Décision Pédagogique :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('favorable')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    decision === 'favorable'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Avis Favorable</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('a_corriger')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    decision === 'a_corriger'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>À Corriger</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('defavorable')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    decision === 'defavorable'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Avis Défavorable</span>
                </button>
              </div>
            </div>

            {/* Note / Appréciation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1 space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">
                  Note / Appréciation
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Ex: 18/20 ou Très Favorable"
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              {/* Commentaire pédagogique */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
                  <span>Commentaire et remarques pédagogiques</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Transmis au CED</span>
                </label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Ex: Excellent dossier, prérequis validés, projet en parfaite adéquation avec le laboratoire..."
                  className="w-full p-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-neutral-100 bg-white flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors text-center"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={handleDecisionSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2.5 text-xs font-semibold text-white rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs ${
              decision === 'favorable'
                ? 'bg-neutral-900 hover:bg-neutral-800'
                : decision === 'a_corriger'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>
              {isSubmitting
                ? 'Enregistrement...'
                : decision === 'favorable'
                ? 'Valider l’Avis Favorable (Étape 4 : Structure)'
                : decision === 'a_corriger'
                ? 'Demander la correction au candidat'
                : 'Enregistrer l’Avis Défavorable'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
