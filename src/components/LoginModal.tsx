import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { X, LogIn, Mail, Lock, GraduationCap, UserCheck, Shield } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const { loginWithEmail, detectRoleFromEmail } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('candidat');
  const [error, setError] = useState<string | null>(null);

  // Automatically update selected role when user types their institutional email
  useEffect(() => {
    if (email.includes('@')) {
      const autoDetected = detectRoleFromEmail(email);
      setSelectedRole(autoDetected);
    }
  }, [email, detectRoleFromEmail]);

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

    const result = loginWithEmail(cleanEmail, selectedRole);
    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-900">
              Connexion Institutionnelle
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs font-mono text-neutral-500">GCD USMBA</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900">
              Accédez à votre espace sécurisé
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Authentification sécurisée par email institutionnel ou professionnel. Le rôle applicatif est identifié automatiquement.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Email institutionnel ou académique *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: prenom.nom@usmba.ac.ma"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Role identification & manual override */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-neutral-800">
                  Rôle applicatif attribué *
                </label>
                <span className="text-[10px] text-neutral-400">
                  Détection automatique
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setSelectedRole('candidat')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedRole === 'candidat'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px] truncate">Candidat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('directeur_these')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedRole === 'directeur_these'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px] truncate">Dir. Thèse</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('directeur_structure')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedRole === 'directeur_structure'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px] truncate">Structure</span>
                </button>
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Mot de passe institutionnel
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Se connecter</span>
            </button>
          </form>

          {/* New candidate link */}
          <div className="pt-4 border-t border-neutral-100 text-center space-y-2">
            <p className="text-xs text-neutral-500">
              Nouveau candidat au cycle doctoral ?
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="text-xs font-bold text-neutral-900 underline underline-offset-4 hover:text-neutral-700 transition-colors"
            >
              Créer mon inscription candidat initiale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
