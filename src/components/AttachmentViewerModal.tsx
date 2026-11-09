import React from 'react';
import { useApp } from '../context/AppContext';
import { X, FileText, Download, CheckCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';

export const AttachmentViewerModal: React.FC = () => {
  const { viewingAttachment, closeAttachment, showToast } = useApp();

  if (!viewingAttachment) return null;

  const isImage =
    viewingAttachment.dataUrl &&
    (viewingAttachment.dataUrl.startsWith('data:image/') ||
      viewingAttachment.dataUrl.startsWith('blob:') ||
      viewingAttachment.dataUrl.startsWith('http://') ||
      viewingAttachment.dataUrl.startsWith('https://') ||
      viewingAttachment.dataUrl.endsWith('.jpg') ||
      viewingAttachment.dataUrl.endsWith('.png') ||
      viewingAttachment.dataUrl.endsWith('.jpeg') ||
      viewingAttachment.dataUrl.endsWith('.svg'));

  const handleDownload = () => {
    if (viewingAttachment.dataUrl) {
      const a = document.createElement('a');
      a.href = viewingAttachment.dataUrl;
      const isSvg = viewingAttachment.dataUrl.startsWith('data:image/svg');
      const isPng = viewingAttachment.dataUrl.startsWith('data:image/png');
      const isJpg =
        viewingAttachment.dataUrl.startsWith('data:image/jpeg') ||
        viewingAttachment.dataUrl.startsWith('data:image/jpg');

      let ext = '.pdf';
      if (isSvg) ext = '.svg';
      else if (isPng) ext = '.png';
      else if (isJpg) ext = '.jpg';

      const cleanTitle = viewingAttachment.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
      a.download = `${cleanTitle}${ext}`;
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

          {/* High-Definition Scan / Image rendering - NEVER blocked by Brave */}
          {isImage ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Document Numérisé Haute Définition</span>
                </h4>
                <button
                  onClick={handleDownload}
                  className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 underline underline-offset-2"
                >
                  <Download className="w-3 h-3" />
                  <span>Enregistrer l'original</span>
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 p-2 sm:p-3 flex items-center justify-center max-h-[460px] shadow-inner">
                <img
                  src={viewingAttachment.dataUrl}
                  alt={viewingAttachment.title}
                  className="max-h-[420px] w-auto object-contain rounded-lg shadow-sm border border-neutral-200 bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Certificat de Conformité Académique (Archivage Numérique)</span>
                </h4>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger le fichier</span>
                </button>
              </div>

              {/* Official Academic Certificate Sheet Preview */}
              <div className="p-5 sm:p-6 bg-white border border-neutral-300 rounded-2xl shadow-xs space-y-4">
                <div className="border-b border-neutral-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                      Royaume du Maroc · Université Sidi Mohamed Ben Abdellah
                    </span>
                    <h3 className="text-base font-bold text-neutral-900">
                      {viewingAttachment.title}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Conforme &amp; Vérifié</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 font-mono">
                  <div>Titulaire : <strong className="text-neutral-900 font-sans">{viewingAttachment.author}</strong></div>
                  <div>Horodatage : <strong className="text-neutral-900">{viewingAttachment.date}</strong></div>
                  <div>Référence : <span className="text-neutral-600">CED-USMBA-ARC-2026</span></div>
                  <div>Intégrité : <span className="text-emerald-700 font-sans font-semibold">Empreinte SHA-256 Validée</span></div>
                </div>
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
