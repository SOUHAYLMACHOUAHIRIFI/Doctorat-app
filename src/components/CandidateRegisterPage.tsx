import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, UserPlus, CheckCircle2, ShieldCheck, Mail, User, Phone, CreditCard, Lock, GraduationCap, Building2 } from 'lucide-react';
import { ESTABLISHMENTS } from '../data/mockData';

interface CandidateRegisterPageProps {
  onBackToLogin: () => void;
}

export const CandidateRegisterPage: React.FC<CandidateRegisterPageProps> = ({ onBackToLogin }) => {
  const { registerCandidate } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [phone, setPhone] = useState('');
  const [cin, setCin] = useState('');
  const [etablissementOrigine, setEtablissementOrigine] = useState('FST Fès');
  const [diplomeOrigine, setDiplomeOrigine] = useState('Master de Recherche');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@usmba.ac.ma')) {
      setError('L’adresse email doit obligatoirement se terminer par @usmba.ac.ma (email académique).');
      return;
    }

    if (!nom.trim() || !prenom.trim()) {
      setError('Le nom et le prénom sont obligatoires.');
      return;
    }

    if (!phone.trim()) {
      setError('Le numéro de téléphone est obligatoire.');
      return;
    }

    if (!cin.trim()) {
      setError('Le code CIN (Carte d’Identité Nationale) est obligatoire.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Veuillez définir un mot de passe d’au moins 6 caractères.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerCandidate({
        email: cleanEmail,
        nom: nom.trim(),
        prenom: prenom.trim(),
        phone: phone.trim(),
        cin: cin.trim().toUpperCase(),
        password: password.trim(),
        etablissementOrigine,
        diplomeOrigine: diplomeOrigine.trim(),
      });

      if (!result.success) {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’inscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto space-y-6 sm:space-y-8">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLogin}
            className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la connexion</span>
          </button>

          <span className="text-xs font-mono text-neutral-400">Portail Doctorat · USMBA</span>
        </div>

        {/* Header Title */}
        <div className="space-y-2 border-b border-neutral-100 pb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-neutral-100 rounded-md text-[11px] font-medium text-neutral-800">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
            <span>Inscription Initiale Candidat</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Créer un compte candidat au doctorat
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Remplissez les informations obligatoires pour activer votre profil candidat auprès du Centre d’Études Doctorales (CED).
          </p>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Form with required fields */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-neutral-200 rounded-2xl p-5 sm:p-8 shadow-xs">
          {/* Email académique */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
              <span>Email académique (@usmba.ac.ma) *</span>
              <span className="text-[10px] text-neutral-400 font-normal">Obligatoire</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@usmba.ac.ma"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400 font-mono"
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              Uniquement les adresses de l’Université Sidi Mohamed Ben Abdellah.
            </p>
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800">
              Mot de passe de connexion *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Nom de famille *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: El Amrani"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Prénom *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Ex: Youssef"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>
          </div>

          {/* Téléphone & Code CIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Numéro de téléphone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6 12 34 56 78"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Code CIN (Carte d’Identité) *
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={cin}
                  onChange={(e) => setCin(e.target.value.toUpperCase())}
                  placeholder="Ex: CD123456"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 uppercase font-mono tracking-wider focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>
          </div>

          {/* Établissement et Diplôme d'origine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Établissement d'origine
              </label>
              <select
                value={etablissementOrigine}
                onChange={(e) => setEtablissementOrigine(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
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
                Dernier diplôme préparé / obtenu
              </label>
              <input
                type="text"
                value={diplomeOrigine}
                onChange={(e) => setDiplomeOrigine(e.target.value)}
                placeholder="Ex: Master Recherche en IA"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Submit action */}
          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-xs text-neutral-500 hover:text-neutral-900 order-2 sm:order-1"
            >
              Déjà un compte ? Se connecter
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs order-1 sm:order-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Création en cours...' : 'Finaliser mon inscription'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
