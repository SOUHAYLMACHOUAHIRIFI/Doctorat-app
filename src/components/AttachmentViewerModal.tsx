import React from 'react';
import { useApp } from '../context/AppContext';
import { X, FileText, Download, CheckCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';

export const AttachmentViewerModal: React.FC = () => {
  const { viewingAttachment, closeAttachment, showToast } = useApp();

  if (!viewingAttachment) return null;

  const isImage = viewingAttachment.dataUrl && viewingAttachment.dataUrl.startsWith('data:image/');
  const isPdf = viewingAttachment.dataUrl && viewingAttachment.dataUrl.startsWith('data:application/pdf');

  const handleDownload = () => {
    if (viewingAttachment.dataUrl) {
      const a = document.createElement('a');
      a.href = viewingAttachment.dataUrl;
      a.download = viewingAttachment.title.endsWith('.pdf') || viewingAttachment.title.endsWith('.jpg')
        ? viewingAttachment.title
        : `${viewingAttachment.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Téléchargement du document certifié réussi.');
    } else {
      showToast('Téléchargement du document certifié initié.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-2xl bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 rounded-lg text-neutral-800">
              {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
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
              onClick={handleDownload}
              className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors"
              title="Télécharger le document"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={closeAttachment}
              className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-neutral-800">
          {/* Metadata banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-2.5 px-3.5 bg-neutral-50 rounded-xl text-neutral-500 border border-neutral-200">
            <span>Auteur : <strong className="text-neutral-900">{viewingAttachment.author}</strong></span>
            <span>Date d’horodatage : <strong className="font-mono text-neutral-900">{viewingAttachment.date}</strong></span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Certifié Conforme USMBA</span>
            </span>
          </div>

          {/* If there is a live webcam captured scan or image */}
          {isImage && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Numérisation Haute Définition (Scan direct)
              </h4>
              <div className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 p-2 flex items-center justify-center max-h-96">
                <img
                  src={viewingAttachment.dataUrl}
                  alt={viewingAttachment.title}
                  className="max-h-80 w-auto object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          {/* If there is an uploaded PDF */}
          {isPdf && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Document PDF Certifié Conforme
              </h4>
              <div className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 h-80 sm:h-96 shadow-inner">
                <iframe
                  src={viewingAttachment.dataUrl}
                  title={viewingAttachment.title}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Contenu & Récapitulatif Administratif
            </h4>
            <div className="p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap text-neutral-800">
              {viewingAttachment.content}
            </div>
          </div>

          <div className="p-3.5 border border-neutral-200 rounded-xl space-y-1 text-xs bg-white">
            <div className="font-semibold text-neutral-900">
              Archivage Numérique Sécurisé · CED USMBA
            </div>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Ce document est indexé au dossier doctoral électronique dans la base centrale du Centre d'Études Doctorales (CED) de l'Université Sidi Mohamed Ben Abdellah de Fès.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end shrink-0">
          <button
            onClick={closeAttachment}
            className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-100 shadow-xs"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
};
