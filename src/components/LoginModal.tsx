import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { X, LogIn, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const { loginWithEmail, detectRoleFromEmail } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time automatic role preview based on email input
  const detectedRole: Role = email.includes('@') ? detectRoleFromEmail(email) : 'candidat';

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'candidat':
        return 'Candidat / Doctorant';
      case 'directeur_these':
        return 'Directeur de Thèse';
      case 'directeur_structure':
        return 'Directeur de Structure (Admin)';
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Veuillez saisir votre adresse email institutionnelle.');
      return;
    }

    const result = loginWithEmail(cleanEmail);
    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-900">
              Connexion Institutionnelle
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs font-mono text-neutral-500">GCD USMBA</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900">
              Accédez à votre espace sécurisé
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Saisissez votre email institutionnel (@usmba.ac.ma). Votre rôle applicatif sera automatiquement accordé par le système.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Email institutionnel ou professionnel *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: prenom.nom@usmba.ac.ma"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>

              {/* Automatic role detection notification */}
              {email.includes('@') && (
                <div className="mt-2 p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Rôle détecté automatiquement :</span>
                  <span className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                    {getRoleLabel(detectedRole)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Mot de passe institutionnel
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Se connecter</span>
            </button>
          </form>

          {/* New registration prompt */}
          <div className="pt-4 border-t border-neutral-100 text-center space-y-2">
            <p className="text-xs text-neutral-500">
              Nouveau candidat au doctorat ?
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="text-xs font-bold text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
            >
              Créer mon inscription candidat initiale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
