import React from 'react';
import { useApp } from '../context/AppContext';
import { X, FileText, Download, CheckCircle, ExternalLink } from 'lucide-react';

export const AttachmentViewerModal: React.FC = () => {
  const { viewingAttachment, closeAttachment, showToast } = useApp();

  if (!viewingAttachment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-2xl bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 rounded-lg text-neutral-800">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 truncate max-w-sm sm:max-w-md">
                {viewingAttachment.title}
              </h3>
              <p className="text-xs text-neutral-500">{viewingAttachment.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Téléchargement du document PDF simulé')}
              className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-md"
              title="Télécharger"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={closeAttachment}
              className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-md"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-neutral-800">
          {/* Metadata banner */}
          <div className="flex items-center justify-between text-xs py-2 px-3 bg-neutral-50 rounded-lg text-neutral-500 border border-neutral-100">
            <span>Auteur : <strong className="text-neutral-900">{viewingAttachment.author}</strong></span>
            <span>Date d’horodatage : <strong className="font-mono text-neutral-900">{viewingAttachment.date}</strong></span>
            <span className="text-emerald-700 font-medium">Document Vérifié</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Contenu du Rapport d'Activité & Justificatifs
            </h4>
            <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap text-neutral-800">
              {viewingAttachment.content}
            </div>
          </div>

          <div className="p-4 border border-neutral-200 rounded-xl space-y-2 text-xs">
            <div className="font-semibold text-neutral-900">
              Certificat d'affiliation académique USMBA
            </div>
            <p className="text-neutral-500 text-[11px]">
              Ce document est indexé au dossier doctoral électronique dans la base centrale du Centre d'Études Doctorales (CED) de l'Université Sidi Mohamed Ben Abdellah.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end shrink-0">
          <button
            onClick={closeAttachment}
            className="px-4 py-1.5 text-xs font-medium text-neutral-900 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
};
