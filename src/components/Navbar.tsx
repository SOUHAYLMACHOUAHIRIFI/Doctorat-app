import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  LogIn,
  LogOut,
  GraduationCap,
  UserCheck,
  Shield,
  UserPlus,
  Menu,
  X,
  BookOpen,
  ChevronDown,
  Bell,
} from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin, onOpenRegister }) => {
  const {
    currentUser,
    role,
    logout,
    currentView,
    setCurrentView,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Auto-close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Strict 3 principal spaces
  const getRoleDetails = (r?: Role | null) => {
    switch (r) {
      case 'CANDIDATE':
      case 'candidat':
      case 'DOCTORANT':
        return {
          label: 'Espace Candidat',
          badge: 'Candidat / Doctorant',
          icon: <GraduationCap className="w-4 h-4 text-neutral-800" />,
        };
      case 'SUPERVISOR':
      case 'directeur_these':
        return {
          label: 'Espace Directeur de Thèse',
          badge: 'Directeur de Thèse',
          icon: <UserCheck className="w-4 h-4 text-neutral-800" />,
        };
      case 'CED':
      case 'STRUCTURE_DIRECTOR':
      case 'directeur_structure':
      case 'CED_ADMIN':
        return {
          label: 'Direction de Structure & CED',
          badge: 'Directeur de Structure & CED',
          icon: <Shield className="w-4 h-4 text-neutral-900" />,
        };
      case 'ADMIN':
      case 'SYSTEM_ADMIN':
        return {
          label: 'Administration Système',
          badge: 'Administrateur Plateforme',
          icon: <Shield className="w-4 h-4 text-neutral-900" />,
        };
      default:
        return {
          label: 'Portail Doctoral',
          badge: 'Portail Public',
          icon: <Shield className="w-4 h-4 text-neutral-800" />,
        };
    }
  };

  const handleNavClick = (view: 'dashboard' | 'register_candidat' | 'catalogue') => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
  };

  const roleInfo = getRoleDetails(role);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
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

        {/* Center: Contextual Navigation Links according to logged-in user */}
        <nav className="hidden md:flex items-center gap-2">
          {currentUser && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                {roleInfo.icon}
                <span>{roleInfo.label}</span>
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-[11px] text-neutral-500 font-medium">
                {currentUser.establishment || 'FST Fès'}
              </span>
            </div>
          )}
        </nav>

        {/* Desktop User Account & Profile Menu */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div ref={notificationsRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-700 relative transition-colors focus:outline-hidden"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <span className="text-xs font-bold text-neutral-900">Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] text-neutral-500 hover:text-neutral-900 underline"
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-neutral-50">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-neutral-400 text-center py-4">Aucune notification.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`p-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                              n.isRead ? 'bg-white opacity-75' : 'bg-neutral-50 border border-neutral-200/60 font-medium'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-neutral-900">{n.title}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {n.createdAt ? n.createdAt.split('T')[0] : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-600 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile dropdown */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-1.5 pl-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors focus:outline-hidden"
                >
                  <div className="text-right">
                    <div className="text-xs font-bold text-neutral-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono truncate max-w-[170px]">
                      {currentUser.email}
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold text-xs">
                    {currentUser.firstName?.charAt(0) || currentUser.name.charAt(0)}
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl p-3 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2.5 bg-neutral-50 rounded-xl space-y-1 text-xs border border-neutral-100">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Compte actif
                      </div>
                      <div className="font-bold text-neutral-900">{currentUser.name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono truncate">{currentUser.email}</div>
                      <div className="pt-1 flex items-center gap-1.5 text-[11px] text-neutral-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{roleInfo.badge}</span>
                      </div>
                      {currentUser.cin && (
                        <div className="text-[10px] text-neutral-500 font-mono">
                          CIN : {currentUser.cin}
                        </div>
                      )}
                    </div>

                    <div className="pt-1 border-t border-neutral-100">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleNavClick('register_candidat')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
                  currentView === 'register_candidat'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200 bg-white shadow-2xs'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inscription Candidat</span>
              </button>

              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion (@usmba.ac.ma)</span>
              </button>
            </div>
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
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-sm">{currentUser.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-neutral-200 rounded-md text-neutral-800">
                  {roleInfo.badge}
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
              <div className="text-[11px] text-neutral-500">
                {currentUser.establishment}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
              <p className="text-xs text-neutral-600">
                Connectez-vous avec votre adresse institutionnelle pour gérer vos candidatures ou vos sujets.
              </p>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion (@usmba.ac.ma)</span>
              </button>
            </div>
          )}

          {/* Mobile Nav Links */}
          <div className="space-y-1.5">
            {currentUser ? (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl text-left bg-neutral-900 text-white"
              >
                {roleInfo.icon}
                <span>{roleInfo.label}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Portail de Connexion</span>
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
                  <span>Inscription Candidat</span>
                </button>
              </>
            )}
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
