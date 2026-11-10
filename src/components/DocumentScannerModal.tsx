import React, { useState, useRef, useEffect } from 'react';
import { DocumentType } from '../types';
import {
  Upload,
  X,
  Check,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Plus,
} from 'lucide-react';

export interface PendingDocumentUpload {
  id: string;
  fileName: string;
  fileSize: string;
  dataUrl: string;
  isPdf: boolean;
  customTitle: string;
}

interface DocumentScannerModalProps {
  isOpen: boolean;
  docType: DocumentType | null;
  docTitle: string;
  onClose: () => void;
  onSave?: (
    type: DocumentType,
    fileName: string,
    fileSize: string,
    dataUrl: string,
    method: 'upload',
    customTitle?: string
  ) => Promise<any> | void;
  onSaveMultiple?: (
    type: DocumentType,
    files: Array<{
      fileName: string;
      fileSize: string;
      dataUrl: string;
      method: 'upload';
      customTitle?: string;
    }>
  ) => Promise<any> | void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  docType,
  docTitle,
  onClose,
  onSave,
  onSaveMultiple,
}) => {
  const [pendingFiles, setPendingFiles] = useState<PendingDocumentUpload[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPendingFiles([]);
      setErrorMessage(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen || !docType) return null;

  const processFiles = (files: FileList | File[]) => {
    setErrorMessage(null);
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    fileList.forEach((file) => {
      const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const sizeInMb = file.size / (1024 * 1024);
      const sizeStr = sizeInMb < 0.1 ? `${Math.round(file.size / 1024)} Ko` : `${sizeInMb.toFixed(2)} Mo`;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newDoc: PendingDocumentUpload = {
            id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            fileName: file.name,
            fileSize: sizeStr,
            dataUrl: event.target.result as string,
            isPdf: isFilePdf,
            customTitle: docTitle,
          };
          setPendingFiles((prev) => [...prev, newDoc]);
        }
      };
      reader.onerror = () => {
        setErrorMessage('Erreur lors de la lecture d’un fichier. Veuillez réessayer.');
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updatePendingTitle = (id: string, newTitle: string) => {
    setPendingFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, customTitle: newTitle } : f))
    );
  };

  const handleConfirm = async () => {
    if (!docType) return;
    if (pendingFiles.length === 0) {
      setErrorMessage('Veuillez sélectionner au moins un fichier avant de valider.');
      return;
    }

    setIsProcessing(true);
    try {
      if (onSaveMultiple) {
        await onSaveMultiple(
          docType,
          pendingFiles.map((item) => ({
            fileName: item.fileName,
            fileSize: item.fileSize,
            dataUrl: item.dataUrl,
            method: 'upload',
            customTitle: item.customTitle || docTitle,
          }))
        );
      } else if (onSave) {
        for (const item of pendingFiles) {
          await onSave(
            docType,
            item.fileName,
            item.fileSize,
            item.dataUrl,
            'upload',
            item.customTitle || docTitle
          );
        }
      }
      handleClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de l’enregistrement des pièces.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setPendingFiles([]);
    setErrorMessage(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-xl max-h-[92vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
              <span>Dépôt de justificatifs multiples · GCD USMBA</span>
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

          {/* List of pending files to upload */}
          {pendingFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                <span>Fichier{pendingFiles.length > 1 ? 's' : ''} sélectionné{pendingFiles.length > 1 ? 's' : ''} ({pendingFiles.length})</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un autre fichier</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {pendingFiles.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {doc.dataUrl.startsWith('data:image/') ? (
                          <img
                            src={doc.dataUrl}
                            alt={doc.fileName}
                            className="w-9 h-9 object-cover rounded-lg border border-neutral-300 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            PDF
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-mono text-xs font-bold text-neutral-900 block truncate max-w-[220px] sm:max-w-xs">
                            {doc.fileName}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {doc.fileSize} · Fichier #{idx + 1}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removePendingFile(doc.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Retirer ce fichier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Optional Label / Title */}
                    <div>
                      <input
                        type="text"
                        value={doc.customTitle}
                        onChange={(e) => updatePendingTitle(doc.id, e.target.value)}
                        placeholder="Préciser l'intitulé (ex: Relevé S1-S2, Diplôme Master...)"
                        className="w-full px-2.5 py-1 text-[11px] bg-white border border-neutral-200 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-2xl bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-900 transition-all cursor-pointer group text-center ${
              pendingFiles.length > 0 ? 'p-5 sm:p-6' : 'p-8 sm:p-10'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 group-hover:scale-105 transition-transform shadow-xs">
              <Upload className="w-5 h-5 text-neutral-800" />
            </div>
            <span className="text-xs font-bold text-neutral-900 mt-2 block">
              {pendingFiles.length > 0
                ? 'Cliquez pour sélectionner d’autres fichiers'
                : 'Cliquez ou glissez-déposez vos fichiers ici'}
            </span>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">
              Formats : PDF, JPG, PNG · Vous pouvez sélectionner plusieurs documents à la fois
            </span>
            <span className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-white border border-neutral-200 rounded-lg text-[10px] font-semibold text-neutral-700 shadow-2xs">
              <FileText className="w-3 h-3 text-neutral-500" />
              <span>Parcourir les fichiers</span>
            </span>
          </div>

          {/* Hidden multi-file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
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
            disabled={isProcessing || pendingFiles.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            <span>
              {isProcessing
                ? 'Enregistrement en cours...'
                : pendingFiles.length > 0
                ? `Enregistrer ${pendingFiles.length} fichier${pendingFiles.length > 1 ? 's' : ''}`
                : 'Sélectionnez au moins un fichier'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
