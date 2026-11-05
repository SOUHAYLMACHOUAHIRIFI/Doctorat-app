import React, { useState, useRef, useEffect } from 'react';
import { DocumentType } from '../types';
import { Camera, Upload, X, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

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

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => { /* autoplay catch */ });
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Impossible d’accéder à la caméra (autorisation refusée ou absence de périphérique). Utilisez le mode import de fichier.'
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

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
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

      const reader = new FileReader();
      reader.onload = () => {
        setUploadedDataUrl(reader.result as string);
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
        onSave(docType, fileName, '1.2 Mo', capturedImage, 'camera');
      } else if (mode === 'upload' && uploadedDataUrl) {
        onSave(docType, selectedFileName || `Document_${docType}.pdf`, selectedFileSize || '1.8 Mo', uploadedDataUrl, 'upload');
      } else {
        // Fallback default
        onSave(docType, `${docTitle}_Valide.pdf`, '1.5 Mo', '', 'upload');
      }
      setIsProcessing(false);
      handleClose();
    }, 300);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setUploadedDataUrl(null);
    setSelectedFileName('');
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
              Module de Numérisation · GCD USMBA
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
        <div className="p-4 sm:p-5 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2">
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
            <span>Scanner via Webcam / Caméra</span>
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
            <span>Importer un fichier (PDF / Image)</span>
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
                    className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
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
                      <span>Cliché capturé</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
                    <span>Aperçu de la numérisation HD</span>
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

                    {/* Document Alignment Frame Overlay */}
                    <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-md self-start">
                        Cadrez le document dans le rectangle
                      </div>
                      <div className="text-[10px] text-white/80 bg-black/60 px-2 py-0.5 rounded-md self-center">
                        Alignez les bords de votre pièce officielle
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center pt-1">
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="w-full sm:w-auto px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
                    >
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Prendre la photo du document (Capturer)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'upload' && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-2xl bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 group-hover:scale-105 transition-transform shadow-xs">
                  <Upload className="w-6 h-6 text-neutral-600" />
                </div>
                <span className="text-xs font-bold text-neutral-900 mt-3">
                  {selectedFileName ? selectedFileName : 'Sélectionnez ou glissez votre document'}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1">
                  Formats acceptés : PDF, JPG, PNG (Max. 10 Mo)
                </span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              {selectedFileName && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="truncate max-w-[240px]">
                    <div className="font-bold text-neutral-900 truncate">{selectedFileName}</div>
                    <div className="text-[10px] text-neutral-500">{selectedFileSize}</div>
                  </div>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Fichier prêt</span>
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              La pièce numérisée sera automatiquement transmise dans votre dossier officiel pour examen par votre directeur de thèse et la direction du CED.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-neutral-100 bg-white flex flex-col sm:flex-row items-center justify-end gap-2.5 sticky bottom-0">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors order-2 sm:order-1"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={mode === 'camera' ? !capturedImage : !selectedFileName}
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-900 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs order-1 sm:order-2"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? 'Enregistrement...' : 'Valider et Enregistrer le document'}</span>
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
