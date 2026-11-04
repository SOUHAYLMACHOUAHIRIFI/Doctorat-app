import React, { useState, useEffect } from 'react';
import { ThesisTopic } from '../types';
import { useApp } from '../context/AppContext';
import { ESTABLISHMENTS } from '../data/mockData';
import { X, Check } from 'lucide-react';

interface EditTopicModalProps {
  topic: ThesisTopic | null;
  onClose: () => void;
}

export const EditTopicModal: React.FC<EditTopicModalProps> = ({ topic, onClose }) => {
  const { updateTopic } = useApp();

  const [title, setTitle] = useState('');
  const [establishment, setEstablishment] = useState('');
  const [laboratory, setLaboratory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [summary, setSummary] = useState('');
  const [slotsTotal, setSlotsTotal] = useState(1);
  const [status, setStatus] = useState<ThesisTopic['status']>('valide');

  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
      setEstablishment(topic.establishment);
      setLaboratory(topic.laboratory);
      setKeywords(topic.keywords.join(', '));
      setSummary(topic.summary);
      setSlotsTotal(topic.slotsTotal);
      setStatus(topic.status);
    }
  }, [topic]);

  if (!topic) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateTopic(topic.id, {
      title: title.trim(),
      establishment,
      laboratory: laboratory.trim(),
      keywords: keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      summary: summary.trim(),
      slotsTotal: Number(slotsTotal) || 1,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10">
          <h2 className="text-sm font-bold text-neutral-900">
            Modifier le sujet de thèse
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800">
              Titre du sujet de thèse *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
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
              <label className="text-xs font-semibold text-neutral-800">
                Structure / Laboratoire
              </label>
              <input
                type="text"
                value={laboratory}
                onChange={(e) => setLaboratory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800">
              Mots-clés (séparés par des virgules)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800">
              Résumé succinct des travaux
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Places offertes
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={slotsTotal}
                onChange={(e) => setSlotsTotal(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Statut du sujet
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ThesisTopic['status'])}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900"
              >
                <option value="valide">Actif / Validé (Vert)</option>
                <option value="en_attente">En attente (Orange)</option>
                <option value="cloture">Clôturé (Rouge)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 order-2 sm:order-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 sm:py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors order-1 sm:order-2 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
