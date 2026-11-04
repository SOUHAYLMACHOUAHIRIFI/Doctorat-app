import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, UserPlus, CheckCircle2, ShieldCheck, Mail, User, Phone, CreditCard } from 'lucide-react';

interface CandidateRegisterPageProps {
  onBackToLogin: () => void;
}

export const CandidateRegisterPage: React.FC<CandidateRegisterPageProps> = ({ onBackToLogin }) => {
  const { registerCandidate } = useApp();

  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [phone, setPhone] = useState('');
  const [cin, setCin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      setError('Veuillez saisir une adresse email académique valide.');
      return;
    }

    if (!cleanEmail.endsWith('@usmba.ac.ma') && !cleanEmail.endsWith('.ma') && !cleanEmail.endsWith('.edu')) {
      setError('L’adresse email doit être une adresse académique institutionnelle (ex: prenom.nom@usmba.ac.ma).');
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

    setIsSubmitting(true);
    const result = registerCandidate({
      email: cleanEmail,
      nom: nom.trim(),
      prenom: prenom.trim(),
      phone: phone.trim(),
      cin: cin.trim().toUpperCase(),
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto space-y-8">
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
        <div className="space-y-2 border-b border-neutral-100 pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-neutral-100 rounded-md text-[11px] font-medium text-neutral-800">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
            <span>Inscription Initiale Candidat</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Créer un dossier de candidature au doctorat
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Remplissez les informations obligatoires pour activer votre profil candidat auprès du Centre d’Études Doctorales (CED).
          </p>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Form with the 5 required fields */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* 1. Email académique */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
              <span>1. Email académique (@usmba.ac.ma) *</span>
              <span className="text-[10px] text-neutral-400 font-normal">Domaine institutionnel</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@usmba.ac.ma"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              Le rôle de Candidat sera automatiquement octroyé à cette adresse.
            </p>
          </div>

          {/* 2 & 3. Nom et Prénom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                2. Nom de famille *
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
                3. Prénom *
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

          {/* 4. Numéro de téléphone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800">
              4. Numéro de téléphone portable *
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
            <p className="text-[11px] text-neutral-400">
              Utilisé pour les convocations aux entretiens et notifications de sélection.
            </p>
          </div>

          {/* 5. Code CIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800">
              5. Code CIN (Carte d’Identité Nationale) *
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={cin}
                onChange={(e) => setCin(e.target.value)}
                placeholder="Ex: CD123456 ou A789012"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 uppercase font-mono tracking-wider focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              Le scan du document physique sera à déposer dans votre espace personnel.
            </p>
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
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors order-1 sm:order-2"
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
