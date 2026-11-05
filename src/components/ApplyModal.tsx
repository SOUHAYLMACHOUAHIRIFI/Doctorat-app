import React, { useState } from 'react';
import { ThesisTopic } from '../types';
import { useApp } from '../context/AppContext';
import { X, Check, Building2, User, Phone, IdCard, GraduationCap, Mail, FileText } from 'lucide-react';

interface ApplyModalProps {
  topic: ThesisTopic | null;
  onClose: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ topic, onClose }) => {
  const { addApplication, currentUser } = useApp();

  // Split name if available
  const initialFirstName = currentUser?.firstName || currentUser?.name?.split(' ')[0] || '';
  const initialLastName = currentUser?.lastName || currentUser?.name?.split(' ').slice(1).join(' ') || '';

  const [nom, setNom] = useState(initialLastName);
  const [prenom, setPrenom] = useState(initialFirstName);
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [cin, setCin] = useState(currentUser?.cin || '');
  const [etablissementOrigine, setEtablissementOrigine] = useState(
    currentUser?.etablissementOrigine || currentUser?.establishment || 'FST Fès'
  );
  const [diplomeOrigine, setDiplomeOrigine] = useState(
    currentUser?.diplomeOrigine || 'Master de Recherche en Informatique et Systèmes'
  );
  const [statement, setStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!topic) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nom.trim() || !prenom.trim() || !email.trim() || !phone.trim() || !cin.trim()) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires (Nom, Prénom, Email, Téléphone, CIN).');
      return;
    }

    if (!email.toLowerCase().includes('@usmba.ac.ma')) {
      setErrorMsg('Veuillez renseigner votre adresse email académique institutionnelle (@usmba.ac.ma).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addApplication(
        topic.id,
        statement.trim() || `Candidature formelle soumise par ${prenom} ${nom}.`,
        `Dossier de candidature initial et projet de recherche pour "${topic.title}". Titulaire de : ${diplomeOrigine} (${etablissementOrigine}).`,
        {
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          cin: cin.trim().toUpperCase(),
          etablissementOrigine: etablissementOrigine.trim(),
          diplomeOrigine: diplomeOrigine.trim(),
        }
      );
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Formulaire de Candidature Doctorale
            </h2>
            <p className="text-xs text-neutral-500">
              Candidature au sujet proposé par {topic.establishment}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Topic Summary Card */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
            <div className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
              Sujet de thèse sélectionné
            </div>
            <h3 className="text-sm font-bold text-neutral-900 leading-snug">
              {topic.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-neutral-600">
              <span className="font-medium text-neutral-900">{topic.establishment}</span>
              <span>•</span>
              <span>{topic.laboratory}</span>
              <span>•</span>
              <span className="text-neutral-800 font-medium">Encadrant : {topic.supervisorName}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Section: Identité du Candidat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wide flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-neutral-700" />
              1. Informations personnelles du candidat
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: El Amrani"
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Ex: Youssef"
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Code CIN (Carte d'Identité) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IdCard className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={cin}
                    onChange={(e) => setCin(e.target.value.toUpperCase())}
                    placeholder="Ex: CD789123"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Numéro de Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 0661234567"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 text-neutral-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Email Académique Institutionnel <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom.prenom@usmba.ac.ma"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 text-neutral-900"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                L'adresse doit obligatoirement être au format institutionnel (@usmba.ac.ma).
              </p>
            </div>
          </div>

          {/* Section: Parcours Universitaire */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wide flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-neutral-700" />
              2. Cursus et Établissement d'origine
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Établissement d'origine <span className="text-red-500">*</span>
                </label>
                <select
                  value={etablissementOrigine}
                  onChange={(e) => setEtablissementOrigine(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 text-neutral-900"
                >
                  <option value="FST Fès">Faculté des Sciences et Techniques (FST Fès)</option>
                  <option value="FS Dhar El Mahraz">Faculté des Sciences Dhar El Mahraz (FSDM)</option>
                  <option value="ENSA Fès">École Nationale des Sciences Appliquées (ENSA Fès)</option>
                  <option value="FSJES Fès">Faculté des Sciences Juridiques, Éco et Sociales</option>
                  <option value="FLSH Dhar El Mahraz">Faculté des Lettres et des Sciences Humaines</option>
                  <option value="EST Fès">École Supérieure de Technologie (EST Fès)</option>
                  <option value="Autre Établissement Marocain / International">Autre Établissement Universitaire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Dernier diplôme préparé / obtenu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={diplomeOrigine}
                  onChange={(e) => setDiplomeOrigine(e.target.value)}
                  placeholder="Ex: Master Recherche en Big Data & IA"
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 text-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Section: Note de Motivation / Projet */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-neutral-700" />
              3. Note d'intérêt et projet scientifique (Optionnel)
            </label>
            <textarea
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Décrivez brièvement votre adéquation avec ce sujet, vos compétences techniques, et vos motivations de recherche..."
              className="w-full p-3 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 text-neutral-900 placeholder:text-neutral-400 leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors text-center"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Enregistrement du dossier...' : 'Déposer ma candidature'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
