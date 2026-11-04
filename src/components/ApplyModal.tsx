import React, { useState } from 'react';
import { ThesisTopic } from '../types';
import { useApp } from '../context/AppContext';
import { X, Check, Building2, User, FileText } from 'lucide-react';

interface ApplyModalProps {
  topic: ThesisTopic | null;
  onClose: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ topic, onClose }) => {
  const { addApplication, currentUser } = useApp();
  const [statement, setStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!topic) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      addApplication(
        topic.id,
        statement.trim() || 'Candidature spontanée via le catalogue GCD USMBA.',
        `Dossier académique et projet de recherche préliminaire : "${topic.title}". Profil Master validé avec mention.`
      );
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            Postuler au sujet de thèse
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-neutral-900 leading-snug">
              {topic.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 text-xs text-neutral-500">
              <span className="font-medium text-neutral-800">{topic.establishment}</span>
              <span>·</span>
              <span>{topic.laboratory}</span>
              <span>·</span>
              <span>Dir. {topic.supervisorName}</span>
            </div>
            <p className="text-xs text-neutral-600 pt-1 leading-relaxed">
              {topic.summary}
            </p>
          </div>

          {currentUser && (
            <div className="p-3.5 bg-neutral-50 rounded-xl space-y-1 text-xs border border-neutral-100">
              <div className="text-neutral-500">Candidat postulant :</div>
              <div className="font-semibold text-neutral-900">
                {currentUser.name} <span className="text-neutral-400 font-normal">({currentUser.email})</span>
              </div>
              {currentUser.cin && (
                <div className="text-[11px] text-neutral-500 font-mono">
                  Code CIN : {currentUser.cin}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">
              Note de motivation succincte (Optionnel)
            </label>
            <textarea
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Ex: Titulaire d’un Master en informatique, mes travaux de fin d’études s’alignent directement avec cette thématique..."
              className="w-full p-3 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Envoi...' : 'Confirmer la candidature'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
