import React, { useState, useRef, useEffect } from 'react';
import { DocumentType } from '../types';
import { Camera, Upload, X, Check, RefreshCw, AlertCircle, Scan, CheckCircle2, Sparkles, FileText } from 'lucide-react';

interface DocumentScannerModalProps {
  isOpen: boolean;
  docType: DocumentType | null;
  docTitle: string;
  onClose: () => void;
  onSave: (type: DocumentType, fileName: string, fileSize: string, dataUrl: string, method: 'camera' | 'upload') => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  docType,
  docTitle,
  onClose,
  onSave,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanningOcr, setIsScanningOcr] = useState(false);

  // File upload state
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFileSize, setSelectedFileSize] = useState<string>('');
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Start webcam when modal opens in camera mode
  useEffect(() => {
    if (!isOpen || mode !== 'camera') {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, mode]);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La capture vidéo directe n’est pas prise en charge par ce navigateur.');
      }

      let stream: MediaStream;
      try {
        // First try ideal mobile back camera if available
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (err) {
        // Fallback to standard webcam constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Impossible d’activer la webcam ou caméra (autorisation refusée ou appareil indisponible). Vous pouvez importer directement votre fichier ci-dessous.'
      );
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simulate OCR flash / processing
    setIsScanningOcr(true);
    setTimeout(() => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      setIsScanningOcr(false);
      stopCamera();
    }, 400);
  };

  const retakeSnapshot = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setSelectedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} Mo`);

      setIsScanningOcr(true);
      const reader = new FileReader();
      reader.onload = () => {
        setTimeout(() => {
          setUploadedDataUrl(reader.result as string);
          setIsScanningOcr(false);
        }, 350);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (!docType) return;
    setIsProcessing(true);

    setTimeout(() => {
      if (mode === 'camera' && capturedImage) {
        const timeStamp = Date.now().toString(36);
        const fileName = `Scan_${docType.toUpperCase()}_${timeStamp}.jpg`;
        onSave(docType, fileName, '1.4 Mo', capturedImage, 'camera');
      } else if (mode === 'upload' && uploadedDataUrl) {
        onSave(docType, selectedFileName || `Document_${docType}.pdf`, selectedFileSize || '1.8 Mo', uploadedDataUrl, 'upload');
      } else {
        // Fallback placeholder scan with certificate
        const defaultCanvas = document.createElement('canvas');
        defaultCanvas.width = 800;
        defaultCanvas.height = 1000;
        const dCtx = defaultCanvas.getContext('2d');
        if (dCtx) {
          dCtx.fillStyle = '#ffffff';
          dCtx.fillRect(0, 0, 800, 1000);
          dCtx.fillStyle = '#171717';
          dCtx.font = 'bold 28px sans-serif';
          dCtx.fillText(`DOCUMENT ACADÉMIQUE NUMÉRISÉ : ${docTitle.toUpperCase()}`, 50, 80);
          dCtx.font = '16px monospace';
          dCtx.fillText(`Certifié conforme - Plateforme GCD Université Sidi Mohamed Ben Abdellah`, 50, 120);
          dCtx.fillText(`Horodatage numérique : ${new Date().toLocaleString('fr-FR')}`, 50, 150);
          dCtx.strokeStyle = '#d4d4d4';
          dCtx.strokeRect(40, 40, 720, 920);
        }
        const generatedData = defaultCanvas.toDataURL('image/jpeg', 0.9);
        onSave(docType, `${docTitle}_Valide.pdf`, '1.5 Mo', generatedData, 'upload');
      }
      setIsProcessing(false);
      handleClose();
    }, 250);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setUploadedDataUrl(null);
    setSelectedFileName('');
    setIsScanningOcr(false);
    onClose();
  };

  if (!isOpen || !docType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-xl max-h-[92vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Module de Numérisation & OCR · GCD USMBA
            </div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900">
              {docTitle}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Fermer"
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-3 sm:p-4 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('camera');
              setCapturedImage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
              mode === 'camera'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scanner par Caméra</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('upload');
              stopCamera();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
              mode === 'upload'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importer Image / PDF</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {mode === 'camera' && (
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Caméra non disponible</span>
                  </div>
                  <p className="leading-relaxed">{cameraError}</p>
                  <button
                    onClick={() => setMode('upload')}
                    className="px-3.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Passer en mode import de fichier
                  </button>
                </div>
              ) : capturedImage ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 aspect-4/3 flex items-center justify-center">
                    <img
                      src={capturedImage}
                      alt="Scan capturé"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-600/90 text-white text-[11px] font-semibold rounded-md backdrop-blur-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Cliché Numérisé</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
                    <span>Aperçu du scan optimisé</span>
                    <button
                      type="button"
                      onClick={retakeSnapshot}
                      className="inline-flex items-center gap-1.5 text-neutral-900 font-bold hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reprendre la photo</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-950 aspect-4/3 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Scanner Alignment Frame Overlay */}
                    <div className="absolute inset-6 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-t-2 border-l-2 border-white" />
                        <div className="w-4 h-4 border-t-2 border-r-2 border-white" />
                      </div>
                      <div className="text-center text-white/80 text-[11px] font-mono bg-black/40 py-1 px-2 rounded-md mx-auto backdrop-blur-xs">
                        Placez le document physique dans le cadre
                      </div>
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-b-2 border-l-2 border-white" />
                        <div className="w-4 h-4 border-b-2 border-r-2 border-white" />
                      </div>
                    </div>

                    {/* OCR Scanning simulation beam */}
                    {isScanningOcr && (
                      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                        <Scan className="w-8 h-8 text-emerald-400 animate-spin" />
                        <span className="text-xs font-semibold text-white">Traitement OCR et recadrage...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center pt-1">
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      disabled={isScanningOcr}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-md active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Prendre le cliché</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'upload' && (
            <div className="space-y-4">
              {uploadedDataUrl ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 aspect-4/3 flex items-center justify-center p-3">
                    {uploadedDataUrl.startsWith('data:image/') ? (
                      <img
                        src={uploadedDataUrl}
                        alt="Aperçu importé"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 text-neutral-600">
                        <FileText className="w-12 h-12 text-neutral-500" />
                        <span className="font-mono text-xs font-bold text-neutral-800">{selectedFileName}</span>
                        <span className="text-[11px] text-neutral-400">{selectedFileSize} · PDF Prêt pour archivage</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" />
                      <span>Numérisé</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
                    <span className="font-mono font-medium truncate max-w-[220px]">{selectedFileName}</span>
                    <label className="cursor-pointer text-neutral-900 font-bold hover:underline">
                      <span>Changer de fichier</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 rounded-2xl bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-900 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 group-hover:scale-105 transition-transform shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-800 mt-3">
                      Sélectionnez votre document (PDF ou Image)
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-1">
                      Numérisation et cadrage automatique (Max 15 Mo)
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>

                  {isScanningOcr && (
                    <div className="p-3 bg-neutral-100 rounded-xl text-center text-xs font-semibold text-neutral-700 flex items-center justify-center gap-2">
                      <Scan className="w-4 h-4 text-emerald-600 animate-spin" />
                      <span>Traitement OCR et optimisation du scan en cours...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-neutral-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sticky bottom-0">
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
            disabled={isProcessing || (!capturedImage && !uploadedDataUrl)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Enregistrement...' : 'Valider et Joindre le document'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
