import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { LogIn, LogOut, GraduationCap, UserCheck, Shield, UserPlus, Menu, X, BookOpen } from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin, onOpenRegister }) => {
  const { currentUser, role, logout, currentView, setCurrentView, switchRole } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = (r: Role) => {
    switch (r) {
      case 'candidat':
      case 'candidate':
        return { label: 'Candidat / Doctorant', shortLabel: 'Candidat', icon: <GraduationCap className="w-4 h-4 text-neutral-800" /> };
      case 'directeur_these':
      case 'supervisor':
        return { label: 'Directeur de Thèse', shortLabel: 'Dir. Thèse', icon: <UserCheck className="w-4 h-4 text-neutral-800" /> };
      case 'directeur_structure':
      case 'structure_director':
        return { label: 'Directeur de Structure (Admin)', shortLabel: 'Structure Admin', icon: <Shield className="w-4 h-4 text-neutral-800" /> };
      default:
        return { label: 'Utilisateur', shortLabel: 'Compte', icon: <GraduationCap className="w-4 h-4 text-neutral-800" /> };
    }
  };

  const handleNavClick = (view: 'dashboard' | 'register_candidat') => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-xs transition-transform group-hover:scale-105">
              GCD
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-neutral-900 whitespace-nowrap block leading-tight">
                GCD · USMBA
              </span>
              <span className="text-[10px] text-neutral-500 font-medium hidden sm:block">
                Gestion du Cycle Doctoral
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Desktop Role Switcher & Nav Links */}
        <nav className="hidden md:flex items-center gap-3">
          {currentUser && (
            <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200">
              <button
                onClick={() => {
                  switchRole('candidat');
                  handleNavClick('dashboard');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  role === 'candidat' || role === 'candidate'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Candidat</span>
              </button>
              <button
                onClick={() => {
                  switchRole('directeur_these');
                  handleNavClick('dashboard');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  role === 'directeur_these' || role === 'supervisor'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Directeur Thèse</span>
              </button>
              <button
                onClick={() => {
                  switchRole('directeur_structure');
                  handleNavClick('dashboard');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  role === 'directeur_structure' || role === 'structure_director'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Directeur Structure</span>
              </button>
            </div>
          )}

          <button
            onClick={() => handleNavClick('register_candidat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              currentView === 'register_candidat'
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-neutral-500" />
            <span>Inscription Candidat</span>
          </button>
        </nav>

        {/* Zone 3: Desktop Account Status & Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-neutral-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  {currentUser.email}
                </div>
              </div>

              <button
                onClick={logout}
                title="Se déconnecter"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-rose-600 border border-neutral-200 rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
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

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser && (
            <span className="text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-1 rounded-md truncate max-w-[120px]">
              {currentUser.firstName || currentUser.name.split(' ')[0]}
            </span>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="p-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors focus:outline-hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {currentUser ? (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-sm">{currentUser.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-neutral-200 rounded-md text-neutral-800">
                  {getRoleBadge(currentUser.role).shortLabel}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 font-mono truncate">
                {currentUser.email}
              </div>
              {currentUser.cin && (
                <div className="text-[11px] text-neutral-500 font-mono">
                  CIN : {currentUser.cin}
                </div>
              )}

              {/* Mobile Direct Role Switcher */}
              <div className="pt-2 border-t border-neutral-200 space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Bascule d'espace de travail :
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded-lg border border-neutral-200 text-center">
                  <button
                    onClick={() => {
                      switchRole('candidat');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                      role === 'candidat' || role === 'candidate'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Candidat
                  </button>
                  <button
                    onClick={() => {
                      switchRole('directeur_these');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                      role === 'directeur_these' || role === 'supervisor'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Dir. Thèse
                  </button>
                  <button
                    onClick={() => {
                      switchRole('directeur_structure');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                      role === 'directeur_structure' || role === 'structure_director'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Structure
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
              <p className="text-xs text-neutral-600">
                Connectez-vous avec votre adresse institutionnelle pour accéder à vos démarches doctorales.
              </p>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion Email (@usmba.ac.ma)</span>
              </button>
            </div>
          )}

          {/* Mobile Navigation Links */}
          <div className="space-y-1.5">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              {currentUser ? getRoleBadge(currentUser.role).icon : <BookOpen className="w-4 h-4" />}
              <span>{currentUser ? `Mon Espace (${getRoleBadge(currentUser.role).label})` : 'Catalogue des Sujets de Thèse'}</span>
            </button>

            <button
              onClick={() => handleNavClick('register_candidat')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-colors ${
                currentView === 'register_candidat'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <UserPlus className="w-4 h-4 text-neutral-500" />
              <span>Page d'Inscription Candidat</span>
            </button>
          </div>

          {currentUser && (
            <div className="pt-2 border-t border-neutral-200">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
