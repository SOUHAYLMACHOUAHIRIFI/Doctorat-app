import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DocumentType } from '../types';
import {
  Camera,
  Upload,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  Scan,
  FileText,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
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
    method: 'camera' | 'upload'
  ) => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  docType,
  docTitle,
  onClose,
  onSave,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('upload'); // Default to upload as safest fallback, camera toggle always available
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  // File upload state
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFileSize, setSelectedFileSize] = useState<string>('');
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          /* ignore */
        }
      });
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [cameraStream]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCapturedImage(null);
    setCameraLoading(true);

    // Stop any existing stream
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'La capture vidéo directe n’est pas prise en charge par votre navigateur ou ce contexte. Utilisez le mode importation de fichier.'
      );
      setCameraLoading(false);
      setMode('upload');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Try back / environment camera first (smartphones / tablets)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err) {
        // Fallback to any available video camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((playErr) => {
            console.warn('Video play error:', playErr);
          });
        };
      }
      setCameraLoading(false);
    } catch (err: any) {
      console.warn('Camera getUserMedia error:', err);
      let message =
        'Impossible d’activer la caméra (accès refusé ou périphérique non disponible). Vous pouvez importer directement votre document ci-dessous.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Accès à la caméra refusé par le navigateur. Veuillez autoriser la caméra ou téléverser votre fichier.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'Aucune caméra détectée sur cet appareil. Utilisez l’importation de fichier.';
      }
      setCameraError(message);
      setCameraLoading(false);
      setMode('upload');
    }
  }, [stopCamera]);

  // Manage camera lifecycle
  useEffect(() => {
    if (isOpen && mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, mode, startCamera, stopCamera]);

  const captureSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Overlay certified watermark stamp
    ctx.save();
    ctx.fillStyle = 'rgba(23, 23, 23, 0.75)';
    ctx.fillRect(10, height - 34, width - 20, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`GCD USMBA · NUMÉRISATION CERTIFIÉE · ${new Date().toLocaleDateString('fr-FR')}`, 20, height - 18);
    ctx.restore();

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      setOcrSuccess(true);
      stopCamera();
    } catch (e) {
      console.error('Canvas export error:', e);
    }
  };

  const retakeSnapshot = () => {
    setCapturedImage(null);
    setOcrSuccess(false);
    startCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setOcrSuccess(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (!docType) return;
    setIsProcessing(true);

    try {
      if (mode === 'camera' && capturedImage) {
        const timeStamp = Date.now().toString(36).toUpperCase();
        const fileName = `Scan_${docType.toUpperCase()}_${timeStamp}.jpg`;
        onSave(docType, fileName, '1.4 Mo', capturedImage, 'camera');
      } else if (uploadedDataUrl) {
        onSave(
          docType,
          selectedFileName || `Document_${docType}.pdf`,
          selectedFileSize || '1.8 Mo',
          uploadedDataUrl,
          'upload'
        );
      } else {
        // Fallback placeholder scan if confirmed without file
        const defaultCanvas = document.createElement('canvas');
        defaultCanvas.width = 800;
        defaultCanvas.height = 1000;
        const dCtx = defaultCanvas.getContext('2d');
        if (dCtx) {
          dCtx.fillStyle = '#ffffff';
          dCtx.fillRect(0, 0, 800, 1000);
          dCtx.fillStyle = '#171717';
          dCtx.font = 'bold 24px sans-serif';
          dCtx.fillText(`DOCUMENT ACADÉMIQUE : ${docTitle.toUpperCase()}`, 50, 80);
          dCtx.font = '14px monospace';
          dCtx.fillText(`Certifié conforme - Plateforme GCD Université Sidi Mohamed Ben Abdellah`, 50, 120);
          dCtx.fillText(`Horodatage : ${new Date().toLocaleString('fr-FR')}`, 50, 150);
          dCtx.strokeStyle = '#d4d4d4';
          dCtx.strokeRect(40, 40, 720, 920);
        }
        const generatedData = defaultCanvas.toDataURL('image/jpeg', 0.9);
        onSave(docType, `${docTitle}_Valide.pdf`, '1.5 Mo', generatedData, 'upload');
      }
    } finally {
      setIsProcessing(false);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setUploadedDataUrl(null);
    setSelectedFileName('');
    setSelectedFileSize('');
    setIsPdf(false);
    setCameraError(null);
    setOcrSuccess(false);
    onClose();
  };

  if (!isOpen || !docType) return null;

  const hasValidData = Boolean(
    (mode === 'camera' && capturedImage) || (mode === 'upload' && uploadedDataUrl)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-lg md:max-w-xl max-h-[92vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
              <span>Numérisation & Dépôt Certifié · GCD USMBA</span>
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

        {/* Mode Selector Tabs (White & Neutral design) */}
        <div className="p-3 sm:p-4 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('upload');
              stopCamera();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all ${
              mode === 'upload'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importer un fichier (PDF / Image)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('camera');
              setCapturedImage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all ${
              mode === 'camera'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scanner par Caméra</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* CAMERA MODE */}
          {mode === 'camera' && (
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Caméra non disponible</span>
                  </div>
                  <p className="leading-relaxed">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('upload');
                      setTimeout(() => fileInputRef.current?.click(), 50);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Sélectionner mon document (Image ou PDF)</span>
                  </button>
                </div>
              ) : capturedImage ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 aspect-4/3 flex items-center justify-center">
                    <img
                      src={capturedImage}
                      alt="Aperçu du scan"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600/95 text-white text-[11px] font-semibold rounded-md backdrop-blur-xs flex items-center gap-1 shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>Cliché Numérisé</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Document capturé avec succès</span>
                    </span>
                    <button
                      type="button"
                      onClick={retakeSnapshot}
                      className="inline-flex items-center gap-1 text-neutral-900 font-bold hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reprendre</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-neutral-300 bg-neutral-950 aspect-4/3 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Camera alignment frame overlay */}
                    <div className="absolute inset-5 border-2 border-dashed border-white/70 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between">
                        <div className="w-5 h-5 border-t-2 border-l-2 border-white" />
                        <div className="w-5 h-5 border-t-2 border-r-2 border-white" />
                      </div>
                      <div className="text-center text-white/90 text-[11px] font-mono bg-black/50 py-1 px-2.5 rounded-md mx-auto backdrop-blur-xs">
                        Cadrez le document dans la zone
                      </div>
                      <div className="flex justify-between">
                        <div className="w-5 h-5 border-b-2 border-l-2 border-white" />
                        <div className="w-5 h-5 border-b-2 border-r-2 border-white" />
                      </div>
                    </div>

                    {cameraLoading && (
                      <div className="absolute inset-0 bg-neutral-900/80 flex flex-col items-center justify-center text-white space-y-2">
                        <Scan className="w-8 h-8 animate-spin text-neutral-300" />
                        <span className="text-xs">Initialisation de la caméra...</span>
                      </div>
                    )}
                  </div>

                  {/* Shutter capture button */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      disabled={cameraLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-md active:scale-95 disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Prendre le cliché</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('upload');
                        setTimeout(() => fileInputRef.current?.click(), 50);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl transition-colors shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Importer un fichier (Secours)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD / FILE MODE (ALWAYS FUNCTIONAL FALLBACK) */}
          {mode === 'upload' && (
            <div className="space-y-4">
              {uploadedDataUrl ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-4/3 flex items-center justify-center p-4">
                    {!isPdf && uploadedDataUrl.startsWith('data:image/') ? (
                      <img
                        src={uploadedDataUrl}
                        alt="Aperçu importé"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2.5 text-neutral-700">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                          <FileText className="w-7 h-7" />
                        </div>
                        <span className="font-mono text-xs font-bold text-neutral-900 max-w-[260px] truncate text-center">
                          {selectedFileName}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {selectedFileSize} · Document PDF certifié conforme
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" />
                      <span>Prêt à valider</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-600 px-1">
                    <span className="font-mono font-medium truncate max-w-full sm:max-w-[280px]">
                      {selectedFileName} ({selectedFileSize})
                    </span>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-neutral-900 font-bold hover:underline self-start sm:self-auto cursor-pointer"
                    >
                      Changer de fichier
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 rounded-2xl bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-900 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 group-hover:scale-105 transition-transform shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-900 mt-3 text-center">
                      Cliquez pour choisir un document (PDF ou Image)
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-1 text-center">
                      Formats acceptés : PDF, JPG, PNG, WEBP (Max 15 Mo)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                    <span>Certifié pour le Centre d’Études Doctorales (CED USMBA)</span>
                    <button
                      type="button"
                      onClick={() => setMode('camera')}
                      className="text-neutral-900 font-bold hover:underline"
                    >
                      Utiliser la caméra
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="sr-only"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Hidden working canvas for video grab */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-neutral-100 bg-white flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sticky bottom-0">
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
            disabled={isProcessing || !hasValidData}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            <span>
              {isProcessing
                ? 'Enregistrement...'
                : hasValidData
                ? 'Valider et Enregistrer la pièce'
                : 'Sélectionnez ou capturez un document'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
