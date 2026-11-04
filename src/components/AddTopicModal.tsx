import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ESTABLISHMENTS } from '../data/mockData';
import { X, Plus, Check } from 'lucide-react';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTopicModal: React.FC<AddTopicModalProps> = ({ isOpen, onClose }) => {
  const { addTopic, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [establishment, setEstablishment] = useState(currentUser?.establishment || 'FST Fès');
  const [laboratory, setLaboratory] = useState(currentUser?.laboratory || 'Laboratoire LISAC');
  const [keywords, setKeywords] = useState('');
  const [summary, setSummary] = useState('');
  const [slotsTotal, setSlotsTotal] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTopic({
      title: title.trim(),
      establishment,
      laboratory: laboratory.trim() || 'Laboratoire de Recherche USMBA',
      supervisorId: currentUser?.id || 'prof-current',
      supervisorName: currentUser?.name || 'Directeur de Thèse',
      supervisorEmail: currentUser?.email || 'prof@usmba.ac.ma',
      keywords: keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      summary: summary.trim() || 'Descriptif du sujet de recherche pour le cycle doctoral.',
      status: 'valide', // Vert
      slotsTotal: Number(slotsTotal) || 1,
    });

    onClose();
    // Reset form
    setTitle('');
    setKeywords('');
    setSummary('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10">
          <h2 className="text-sm font-bold text-neutral-900">
            Nouveau sujet de thèse
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
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">
              Titre du sujet de thèse *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Analyse prédictive des séries temporelles..."
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700">
                Établissement
              </label>
              <select
                value={establishment}
                onChange={(e) => setEstablishment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900"
              >
                {ESTABLISHMENTS.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700">
                Structure / Laboratoire
              </label>
              <input
                type="text"
                value={laboratory}
                onChange={(e) => setLaboratory(e.target.value)}
                placeholder="Ex: LISAC"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">
              Mots-clés (séparés par des virgules)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Ex: Intelligence Artificielle, Énergie, Réseaux"
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-700">
              Résumé succinct des travaux envisagés
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brève description de la problématique et de l’approche méthodologique..."
              className="w-full p-3 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>Places offertes :</span>
              <input
                type="number"
                min={1}
                max={4}
                value={slotsTotal}
                onChange={(e) => setSlotsTotal(Number(e.target.value))}
                className="w-14 px-2 py-1 text-xs border border-neutral-200 rounded-lg bg-white text-neutral-900 text-center font-mono tabular-nums"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publier le sujet</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
