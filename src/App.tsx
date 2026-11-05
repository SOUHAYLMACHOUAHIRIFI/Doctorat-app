import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CandidateView } from './components/CandidateView';
import { SupervisorView } from './components/SupervisorView';
import { StructureDirectorView } from './components/StructureDirectorView';
import { CandidateRegisterPage } from './components/CandidateRegisterPage';
import { LoginModal } from './components/LoginModal';
import { AddTopicModal } from './components/AddTopicModal';
import { ApplyModal } from './components/ApplyModal';
import { ReRegistrationModal } from './components/ReRegistrationModal';
import { AttachmentViewerModal } from './components/AttachmentViewerModal';
import { ThesisTopic } from './types';
import { CheckCircle2, ShieldCheck, UserCheck, GraduationCap, ArrowRight, Lock } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, role, currentView, setCurrentView, toastMessage } = useApp();

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isReRegOpen, setIsReRegOpen] = useState(false);
  const [applyingTopic, setApplyingTopic] = useState<ThesisTopic | null>(null);

  const handleApplyClick = (topic: ThesisTopic) => {
    if (!currentUser) {
      setIsLoginOpen(true);
    } else {
      setApplyingTopic(topic);
    }
  };

  const handleReRegClick = () => {
    if (!currentUser) {
      setIsLoginOpen(true);
    } else {
      setIsReRegOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white transition-colors duration-200">
      {/* Top Bar Navigation with strict RBAC */}
      <Navbar
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setCurrentView('register_candidat')}
      />

      {/* Main View Area */}
      <main className="flex-1 bg-white">
        {/* Dedicated Candidate Registration Page */}
        {currentView === 'register_candidat' ? (
          <CandidateRegisterPage onBackToLogin={() => setIsLoginOpen(true)} />
        ) : (
          /* Role-based workspace or Public Catalogue (Strict Route Isolation) */
          <>
            {/* 1. Candidate Workspace (Strictly candidate role only) */}
            {currentUser && currentUser.role === 'candidat' && (
              <CandidateView
                onOpenApply={handleApplyClick}
                onOpenReReg={handleReRegClick}
              />
            )}

            {/* 2. Thesis Supervisor Workspace (Strictly directeur_these role only) */}
            {currentUser && currentUser.role === 'directeur_these' && (
              <SupervisorView onOpenAddTopic={() => setIsAddTopicOpen(true)} />
            )}

            {/* 3. Structure Director Workspace (Strictly directeur_structure role only) */}
            {currentUser && currentUser.role === 'directeur_structure' && (
              <StructureDirectorView />
            )}

            {/* 4. Public Catalogue when unauthenticated */}
            {!currentUser && (
              <div className="space-y-6">
                <div className="bg-neutral-50 border-b border-neutral-100 py-6 sm:py-8 px-4 text-center">
                  <div className="max-w-2xl mx-auto space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Université Sidi Mohamed Ben Abdellah · Fès
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                      Portail de Gestion du Cycle Doctoral (GCD USMBA)
                    </h1>
                    <p className="text-xs text-neutral-600 leading-relaxed max-w-xl mx-auto">
                      Consultez les sujets de recherche doctorale ou connectez-vous avec vos identifiants institutionnels pour postuler, déposer vos 4 pièces scannées ou évaluer les candidatures.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-md mx-auto">
                      <button
                        onClick={() => setIsLoginOpen(true)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
                      >
                        Connexion compte académique
                      </button>
                      <button
                        onClick={() => setCurrentView('register_candidat')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-white border border-neutral-200 text-neutral-900 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors"
                      >
                        Inscription candidat (@usmba.ac.ma)
                      </button>
                    </div>
                  </div>
                </div>

                <CandidateView
                  onOpenApply={handleApplyClick}
                  onOpenReReg={handleReRegClick}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Pure White Minimalist Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 text-xs text-neutral-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">GCD · USMBA</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span>Université Sidi Mohamed Ben Abdellah de Fès</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-neutral-400">
            <span>Centre d'Études Doctorales (CED)</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span>Architecture Sécurisée RBAC</span>
          </div>
        </div>
      </footer>

      {/* Discrete Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => setCurrentView('register_candidat')}
      />
      <AddTopicModal isOpen={isAddTopicOpen} onClose={() => setIsAddTopicOpen(false)} />
      <ReRegistrationModal isOpen={isReRegOpen} onClose={() => setIsReRegOpen(false)} />
      <ApplyModal topic={applyingTopic} onClose={() => setApplyingTopic(null)} />
      <AttachmentViewerModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
