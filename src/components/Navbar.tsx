import React from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { LogIn, LogOut, GraduationCap, UserCheck, Shield, UserPlus } from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin, onOpenRegister }) => {
  const { currentUser, role, logout, currentView, setCurrentView } = useApp();

  const getRoleBadge = (r: Role) => {
    switch (r) {
      case 'candidat':
        return { label: 'Candidat', icon: <GraduationCap className="w-3.5 h-3.5 text-neutral-700" /> };
      case 'directeur_these':
        return { label: 'Directeur de Thèse', icon: <UserCheck className="w-3.5 h-3.5 text-neutral-700" /> };
      case 'directeur_structure':
        return { label: 'Dir. Structure (Admin)', icon: <Shield className="w-3.5 h-3.5 text-neutral-700" /> };
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-xs">
              GCD
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-neutral-900 whitespace-nowrap block leading-tight">
                GCD · USMBA
              </span>
              <span className="text-[10px] text-neutral-400 font-medium hidden sm:block">
                Gestion du Cycle Doctoral
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-2">
          {currentUser && (
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {getRoleBadge(currentUser.role).icon}
              <span>Mon Espace ({getRoleBadge(currentUser.role).label})</span>
            </button>
          )}

          <button
            onClick={onOpenRegister}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              currentView === 'register_candidat'
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-neutral-500" />
            <span>Inscription Candidat</span>
          </button>
        </nav>

        {/* Zone 3: Account Status & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-neutral-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  {currentUser.email}
                </div>
              </div>

              <button
                onClick={logout}
                title="Se déconnecter"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Connexion Email Institutionnel</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
