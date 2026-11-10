import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  CheckCircle2,
  Info,
  UserPlus,
  GraduationCap,
  UserCheck,
  Building2,
} from 'lucide-react';
import { api } from '../services/api';

interface LoginPageProps {
  onOpenRegister: () => void;
  onOpenCatalogue?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenRegister, onOpenCatalogue }) => {
  const { loginWithEmail } = useApp();

  const [mode, setMode] = useState<'login' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setInfoNotice(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Veuillez saisir votre adresse email institutionnelle (@usmba.ac.ma).');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setError('Format d’adresse email invalide.');
      return;
    }

    if (!password || password.trim() === '') {
      setError('Veuillez saisir manuellement votre mot de passe institutionnel.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginWithEmail(cleanEmail, password.trim());
      if (!result.success) {
        setError(result.message || 'Identifiants invalides ou compte verrouillé.');
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
    setInfoNotice(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Veuillez renseigner une adresse email institutionnelle valide.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.auth.requestPasswordReset(cleanEmail);
      setSuccessMsg(res.message || 'Instructions de réinitialisation transmises à votre adresse.');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la demande de réinitialisation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Secure test profile select: Fills ONLY the email, strictly clears password and enforces manual entry
  const handleSelectTestProfile = (profileEmail: string, roleName: string) => {
    setEmail(profileEmail);
    setPassword(''); // Strictly cleared - NO pre-filling of password
    setError(null);
    setSuccessMsg(null);
    setInfoNotice(
      `Email ${roleName} sélectionné (${profileEmail}). Veuillez saisir manuellement votre mot de passe pour des raisons de sécurité.`
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50/60 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Institutional Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs font-semibold text-neutral-800 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-neutral-900" />
            <span>Université Sidi Mohamed Ben Abdellah · Fès</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Portail du Cycle Doctoral
          </h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            Centre d'Études Doctorales (CED USMBA) — Authentification sécurisée obligatoire pour accéder aux espaces de gestion.
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4 text-neutral-900" />
              <h2 className="text-sm font-bold text-neutral-900">
                {mode === 'login' ? 'Connexion compte académique' : 'Réinitialisation'}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">@usmba.ac.ma</span>
          </div>

          {error && (
            <div className="p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl font-medium leading-relaxed">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl font-medium flex items-center gap-2 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {infoNotice && (
            <div className="p-3 text-[11px] text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-xl leading-relaxed flex items-center gap-2">
              <Info className="w-4 h-4 text-neutral-600 shrink-0" />
              <span>{infoNotice}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              {/* Email */}
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
                    autoComplete="off"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400 font-mono"
                  />
                </div>
              </div>

              {/* Password - strictly masked type="password" */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-neutral-800">
                    Mot de passe institutionnel *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError(null);
                      setSuccessMsg(null);
                      setInfoNotice(null);
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

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authentification en cours...' : 'Se connecter au portail'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
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

          {/* Test Profile Fast Select: Only fills email, NEVER password */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800 flex items-center gap-1.5 text-[11px]">
                <Info className="w-3.5 h-3.5 text-neutral-600" />
                <span>Comptes institutionnels de test (évaluation)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              {/* Profile 1: Candidat */}
              <button
                type="button"
                onClick={() => handleSelectTestProfile('youssef.elamrani@usmba.ac.ma', 'Candidat')}
                className="p-2.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-900 text-left transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 uppercase">
                  <GraduationCap className="w-3 h-3 text-neutral-700" />
                  <span>Espace 1</span>
                </div>
                <div className="font-bold text-neutral-900 mt-0.5 truncate text-[11px]">Candidat</div>
                <div className="text-[9px] text-neutral-500 font-mono truncate">youssef.elamrani@...</div>
              </button>

              {/* Profile 2: Directeur de Thèse */}
              <button
                type="button"
                onClick={() => handleSelectTestProfile('karim.bennani@usmba.ac.ma', 'Directeur de Thèse')}
                className="p-2.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-900 text-left transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 uppercase">
                  <UserCheck className="w-3 h-3 text-neutral-700" />
                  <span>Espace 2</span>
                </div>
                <div className="font-bold text-neutral-900 mt-0.5 truncate text-[11px]">Dir. Thèse</div>
                <div className="text-[9px] text-neutral-500 font-mono truncate">karim.bennani@...</div>
              </button>

              {/* Profile 3: Directeur de Structure / CED */}
              <button
                type="button"
                onClick={() => handleSelectTestProfile('ced.admin@usmba.ac.ma', 'Directeur CED')}
                className="p-2.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-900 text-left transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 uppercase">
                  <Building2 className="w-3 h-3 text-neutral-700" />
                  <span>Espace 3</span>
                </div>
                <div className="font-bold text-neutral-900 mt-0.5 truncate text-[11px]">Dir. CED</div>
                <div className="text-[9px] text-neutral-500 font-mono truncate">ced.admin@...</div>
              </button>

              {/* Profile 4: Administrateur Plateforme */}
              <button
                type="button"
                onClick={() => handleSelectTestProfile('admin.system@usmba.ac.ma', 'Admin Système')}
                className="p-2.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-900 text-left transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700 uppercase">
                  <ShieldCheck className="w-3 h-3 text-purple-700" />
                  <span>Espace 4</span>
                </div>
                <div className="font-bold text-neutral-900 mt-0.5 truncate text-[11px]">Admin Sys.</div>
                <div className="text-[9px] text-neutral-500 font-mono truncate">admin.system@...</div>
              </button>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-2 border-t border-neutral-100 flex flex-col items-center gap-2 text-center">
            <button
              type="button"
              onClick={onOpenRegister}
              className="text-xs font-bold text-neutral-900 underline underline-offset-4 hover:text-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Créer un compte candidat (@usmba.ac.ma)</span>
            </button>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center text-[11px] text-neutral-400">
          Architecture Sécurisée RBAC · Sessions chiffrées JWT · Université Sidi Mohamed Ben Abdellah
        </div>
      </div>
    </div>
  );
};
