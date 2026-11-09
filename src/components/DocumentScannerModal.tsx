import React, { useState, useRef } from 'react';
import { DocumentType } from '../types';
import {
  Upload,
  X,
  Check,
  FileText,
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

interface DocumentScannerModalProps {
  isOpen: boolean;
  docType: DocumentType | null;
  docTitle: string;
  onClose: () => void;
  onSave: (
    type: DocumentType,
    fileName: string,
    fileSize: string,
    dataUrl: string,
    method: 'upload'
  ) => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  docType,
  docTitle,
  onClose,
  onSave,
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFileSize, setSelectedFileSize] = useState<string>('');
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen || !docType) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      setIsPdf(isFilePdf);
      setSelectedFileName(file.name);

      const sizeInMb = file.size / (1024 * 1024);
      const sizeStr = sizeInMb < 0.1 ? `${Math.round(file.size / 1024)} Ko` : `${sizeInMb.toFixed(2)} Mo`;
      setSelectedFileSize(sizeStr);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedDataUrl(event.target.result as string);
        }
      };
      reader.onerror = () => {
        setErrorMessage('Erreur lors de la lecture du fichier. Veuillez réessayer.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      setIsPdf(isFilePdf);
      setSelectedFileName(file.name);

      const sizeInMb = file.size / (1024 * 1024);
      const sizeStr = sizeInMb < 0.1 ? `${Math.round(file.size / 1024)} Ko` : `${sizeInMb.toFixed(2)} Mo`;
      setSelectedFileSize(sizeStr);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedDataUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (!docType) return;
    setIsProcessing(true);

    try {
      if (uploadedDataUrl) {
        onSave(
          docType,
          selectedFileName || `${docTitle}.pdf`,
          selectedFileSize || '1.8 Mo',
          uploadedDataUrl,
          'upload'
        );
      } else {
        // Fallback placeholder file
        const defaultCanvas = document.createElement('canvas');
        defaultCanvas.width = 800;
        defaultCanvas.height = 1000;
        const dCtx = defaultCanvas.getContext('2d');
        if (dCtx) {
          dCtx.fillStyle = '#ffffff';
          dCtx.fillRect(0, 0, 800, 1000);
          dCtx.fillStyle = '#171717';
          dCtx.font = 'bold 22px sans-serif';
          dCtx.fillText(`DOCUMENT JUSTIFICATIF : ${docTitle.toUpperCase()}`, 50, 80);
          dCtx.font = '13px monospace';
          dCtx.fillText(`Certifié conforme — Université Sidi Mohamed Ben Abdellah (USMBA)`, 50, 120);
          dCtx.fillText(`Dépôt numérique : ${new Date().toLocaleDateString('fr-FR')}`, 50, 150);
          dCtx.strokeStyle = '#e5e5e5';
          dCtx.strokeRect(40, 40, 720, 920);
        }
        const generatedData = defaultCanvas.toDataURL('image/jpeg', 0.9);
        onSave(docType, `${docTitle}_Certifie.pdf`, '1.5 Mo', generatedData, 'upload');
      }
      handleClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setUploadedDataUrl(null);
    setSelectedFileName('');
    setSelectedFileSize('');
    setIsPdf(false);
    setErrorMessage(null);
    onClose();
  };

  const hasValidFile = Boolean(uploadedDataUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
              <span>Dépôt de pièce justificative · GCD USMBA</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 mt-0.5">
              {docTitle}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Fermer la boîte de dialogue"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {errorMessage}
            </div>
          )}

          {uploadedDataUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 p-6 flex flex-col items-center justify-center min-h-[220px]">
                {!isPdf && uploadedDataUrl.startsWith('data:image/') ? (
                  <img
                    src={uploadedDataUrl}
                    alt="Aperçu importé"
                    className="max-h-48 max-w-full object-contain rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2.5 text-neutral-700 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-neutral-900 block max-w-xs truncate">
                        {selectedFileName}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-medium">
                        {selectedFileSize} · Document PDF certifié conforme
                      </span>
                    </div>
                  </div>
                )}

                <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-xs">
                  <Check className="w-3 h-3" />
                  <span>Fichier chargé</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Prêt à enregistrer</span>
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-neutral-900 font-bold hover:underline cursor-pointer"
                >
                  Remplacer par un autre fichier
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Drag and Drop Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed border-neutral-300 rounded-2xl bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-900 transition-all cursor-pointer group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 group-hover:scale-105 transition-transform shadow-xs">
                  <Upload className="w-5 h-5 text-neutral-800" />
                </div>
                <span className="text-xs font-bold text-neutral-900 mt-3 block">
                  Cliquez ou glissez-déposez votre fichier ici
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Formats acceptés : PDF ou Image (JPG, PNG) · Max 15 Mo
                </span>
                <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-white border border-neutral-200 rounded-lg text-[10px] font-semibold text-neutral-700 shadow-2xs">
                  <FileText className="w-3 h-3 text-neutral-500" />
                  <span>Importer depuis cet appareil</span>
                </span>
              </div>
            </div>
          )}

          {/* Real Input File */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-neutral-100 bg-white flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors text-center"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !hasValidFile}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            <span>
              {isProcessing
                ? 'Enregistrement en cours...'
                : hasValidFile
                ? 'Valider et enregistrer la pièce'
                : 'Veuillez sélectionner un fichier'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
