import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, LogIn, Mail, Lock, ShieldCheck, Info, KeyRound, CheckCircle2, User, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const { loginWithEmail } = useApp();

  const [mode, setMode] = useState<'login' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

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
    try {
      const result = await loginWithEmail(cleanEmail, password.trim());
      if (result.success) {
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.auth.requestPasswordReset(cleanEmail);
      setSuccessMsg(res.message || 'Lien de réinitialisation sécurisé envoyé.');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la demande de réinitialisation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectEmail = (fEmail: string, roleName: string) => {
    setEmail(fEmail);
    setPassword(''); // Strictly cleared - Enforce manual entry
    setError(null);
    setSuccessMsg(null);
    setInfoNotice(
      `Email ${roleName} sélectionné (${fEmail}). Veuillez saisir manuellement votre mot de passe pour des raisons de sécurité.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[95vw] sm:max-w-md max-h-[94vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-800" />
            <span className="text-sm font-bold text-neutral-900">
              {mode === 'login' ? 'Authentification Sécurisée' : 'Réinitialisation Mot de Passe'}
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
        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900">
              {mode === 'login' ? 'Connexion au Portail Doctoral' : 'Mot de passe oublié'}
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {mode === 'login'
                ? 'Accès sécurisé réservé aux membres de l’Université Sidi Mohamed Ben Abdellah (USMBA).'
                : 'Saisissez votre email @usmba.ac.ma pour recevoir les instructions de réinitialisation.'}
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl font-medium leading-relaxed">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl font-medium flex items-center gap-1.5 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {infoNotice && (
            <div className="p-3 text-[11px] text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-neutral-600 shrink-0" />
              <span>{infoNotice}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
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
                    placeholder="prenom.nom@usmba.ac.ma"
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
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500">
                  🔒 Saisie manuelle sécurisée obligatoire (aucun mot de passe n'est stocké en clair).
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authentification...' : 'Se connecter'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">
                  Email institutionnel (@usmba.ac.ma)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prenom.nom@usmba.ac.ma"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSubmitting ? 'Envoi...' : 'Envoyer les instructions'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full text-center text-xs text-neutral-600 hover:text-neutral-900 py-1"
              >
                Retour à la connexion
              </button>
            </form>
          )}

          {/* Institutional Fast Select for 3 Principal Spaces */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-neutral-600" />
                <span>Sélection rapide d’un compte institutionnel</span>
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Cliquez pour sélectionner un profil. Mot de passe académique : <strong className="text-neutral-800 font-mono">usmba2026</strong> (saisie manuelle et masquée obligatoire) :
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* 1. CANDIDATE */}
              <button
                type="button"
                onClick={() => handleSelectEmail('youssef.elamrani@usmba.ac.ma', 'Candidat')}
                className="p-2.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-900 text-left transition-colors shadow-2xs group"
                title="Candidat Youssef El Amrani"
              >
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Espace 1</div>
                <span className="font-bold text-neutral-900 block truncate mt-0.5 text-[11px]">Candidat</span>
                <span className="text-[9px] text-neutral-500 truncate block font-mono">youssef.elamrani@...</span>
              </button>

              {/* 2. SUPERVISOR */}
              <button
                type="button"
                onClick={() => handleSelectEmail('karim.bennani@usmba.ac.ma', 'Directeur de Thèse')}
                className="p-2.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-900 text-left transition-colors shadow-2xs group"
                title="Directeur Pr. Karim Bennani"
              >
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Espace 2</div>
                <span className="font-bold text-neutral-900 block truncate mt-0.5 text-[11px]">Dir. Thèse</span>
                <span className="text-[9px] text-neutral-500 truncate block font-mono">karim.bennani@...</span>
              </button>

              {/* 3. ADMINISTRATION CED */}
              <button
                type="button"
                onClick={() => handleSelectEmail('ced.admin@usmba.ac.ma', 'Directeur de Structure & CED')}
                className="p-2.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-900 text-left transition-colors shadow-2xs group"
                title="Direction CED USMBA"
              >
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Espace 3</div>
                <span className="font-bold text-neutral-900 block truncate mt-0.5 text-[11px]">Dir. CED</span>
                <span className="text-[9px] text-neutral-500 truncate block font-mono">ced.admin@...</span>
              </button>

              {/* 4. ADMIN SYSTEM */}
              <button
                type="button"
                onClick={() => handleSelectEmail('admin.system@usmba.ac.ma', 'Administrateur Plateforme')}
                className="p-2.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-900 text-left transition-colors shadow-2xs group"
                title="Administration Système Plateforme"
              >
                <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Espace 4</div>
                <span className="font-bold text-neutral-900 block truncate mt-0.5 text-[11px]">Admin Sys.</span>
                <span className="text-[9px] text-neutral-500 truncate block font-mono">admin.system@...</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
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
              Créer mon compte candidat institutionnel (@usmba.ac.ma)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
