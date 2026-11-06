import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Upload, Check, FileText } from 'lucide-react';

interface ReRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReRegistrationModal: React.FC<ReRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { addReRegistration, currentUser } = useApp();

  const [year, setYear] = useState(2);
  const [summary, setSummary] = useState('');
  const [pubs, setPubs] = useState(1);
  const [comms, setComms] = useState(1);
  const [progress, setProgress] = useState(50);
  const [uploadedFile, setUploadedFile] = useState('Rapport_Activite_Annuel_Signe.pdf');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    await addReRegistration(
      year,
      summary.trim(),
      Number(pubs) || 0,
      Number(comms) || 0,
      Number(progress) || 50
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10">
          <h2 className="text-sm font-bold text-neutral-900">
            Dépôt de Réinscription Annuelle
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700">
                Année demandée
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900"
              >
                <option value={2}>2ème Année de Doctorat</option>
                <option value={3}>3ème Année de Doctorat</option>
                <option value={4}>4ème Année (Dérogation 1)</option>
                <option value={5}>5ème Année (Dérogation 2)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700">
                Avancement estimé ({progress}%)
              </label>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full mt-2 accent-neutral-900 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">
              Synthèse succincte des travaux de l'année écoulée *
            </label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ex: Réalisation des tests expérimentaux sur le banc d’essai, analyse statistique des résultats et soumission d’un article à une revue internationale..."
              className="w-full p-3 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700">
                Publications indexées
              </label>
              <input
                type="number"
                min={0}
                value={pubs}
                onChange={(e) => setPubs(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 font-mono tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700">
                Communications orales
              </label>
              <input
                type="number"
                min={0}
                value={comms}
                onChange={(e) => setComms(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Minimal attachment area */}
          <div className="p-3.5 border border-dashed border-neutral-200 rounded-xl flex items-center justify-between text-xs bg-neutral-50">
            <div className="flex items-center gap-2 text-neutral-700">
              <FileText className="w-4 h-4 text-neutral-400" />
              <span>{uploadedFile}</span>
            </div>
            <span className="text-[11px] text-neutral-400">PDF certifié (2.1 Mo)</span>
          </div>

          {/* Action */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-neutral-500 hover:text-neutral-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Transmettre à l’encadrant</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
