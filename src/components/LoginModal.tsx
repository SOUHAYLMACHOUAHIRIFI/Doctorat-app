import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, LogIn, Mail, Lock, ShieldCheck, Info } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const { loginWithEmail } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Veuillez saisir votre adresse email institutionnelle.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setError('Format d’adresse email invalide.');
      return;
    }

    if (!password.trim()) {
      setError('Veuillez saisir votre mot de passe institutionnel.');
      return;
    }

    setIsSubmitting(true);
    const result = loginWithEmail(cleanEmail, password.trim());
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  const handleFillCredentials = (fEmail: string) => {
    setEmail(fEmail);
    setPassword('usmba2026');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-md max-h-[92vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-800" />
            <span className="text-sm font-bold text-neutral-900">
              Authentification Sécurisée
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs font-mono text-neutral-500">GCD USMBA</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900">
              Connexion au Portail Doctoral
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              L'accès est réservé aux comptes institutionnels enregistrés de l'Université Sidi Mohamed Ben Abdellah.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Email institutionnel (@usmba.ac.ma) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom.prenom@usmba.ac.ma"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400 font-mono"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-neutral-800">
                  Mot de passe *
                </label>
                <span className="text-[10px] text-neutral-400">
                  Contrôle d'accès strict
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Vérification...' : 'Se connecter'}</span>
            </button>
          </form>

          {/* Institutional Fast Select Hints */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-700">
              <Info className="w-3.5 h-3.5 text-neutral-500" />
              <span>Comptes académiques institutionnels (MDP initial : usmba2026)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleFillCredentials('youssef.elamrani@usmba.ac.ma')}
                className="p-1.5 bg-white border border-neutral-200 rounded-lg hover:border-neutral-900 text-left transition-colors truncate"
                title="Candidat Doctorant"
              >
                <span className="font-semibold text-neutral-900 block truncate">Youssef (Candidat)</span>
                <span className="text-[10px] text-neutral-400 font-mono truncate">@usmba.ac.ma</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('karim.bennani@usmba.ac.ma')}
                className="p-1.5 bg-white border border-neutral-200 rounded-lg hover:border-neutral-900 text-left transition-colors truncate"
                title="Directeur de Thèse"
              >
                <span className="font-semibold text-neutral-900 block truncate">Pr. Bennani (Dir.)</span>
                <span className="text-[10px] text-neutral-400 font-mono truncate">@usmba.ac.ma</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('dir.structure@usmba.ac.ma')}
                className="p-1.5 bg-white border border-neutral-200 rounded-lg hover:border-neutral-900 text-left transition-colors truncate"
                title="Direction de Structure CED"
              >
                <span className="font-semibold text-neutral-900 block truncate">CED (Structure)</span>
                <span className="text-[10px] text-neutral-400 font-mono truncate">@usmba.ac.ma</span>
              </button>
            </div>
          </div>

          {/* New candidate link */}
          <div className="pt-2 border-t border-neutral-100 text-center space-y-1">
            <p className="text-xs text-neutral-500">
              Pas encore inscrit au cycle doctoral ?
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="text-xs font-bold text-neutral-900 underline underline-offset-4 hover:text-neutral-700 transition-colors"
            >
              Créer mon compte candidat institutionnel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
