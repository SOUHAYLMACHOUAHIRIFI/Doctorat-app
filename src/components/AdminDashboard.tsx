import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ESTABLISHMENTS } from '../data/mockData';
import {
  Users,
  ShieldCheck,
  Database,
  Settings,
  ShieldAlert,
  Search,
  Filter,
  UserPlus,
  Edit2,
  KeyRound,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  Calendar,
  Lock,
  Globe,
  Sliders,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { User, Role, AppAuditLog } from '../types';
import { api } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    adminUsers,
    refreshAdminUsers,
    createAdminUser,
    updateAdminUser,
    resetAdminUserPassword,
    deleteAdminUser,
    rbacMatrix,
    refreshRbacMatrix,
    platformSettings,
    refreshPlatformSettings,
    updatePlatformSettings,
    dataOverview,
    refreshDataOverview,
    exportPlatformData,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'utilisateurs' | 'rbac' | 'donnees' | 'parametrage' | 'audit'>('utilisateurs');

  // User Filter & Search
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Modals
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cin: '',
    phone: '',
    role: 'SUPERVISOR' as Role,
    establishment: 'FST Fès',
    laboratory: 'Laboratoire LISAC',
    password: '',
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    platformName: '',
    universityName: '',
    institutionalEmailDomain: '@usmba.ac.ma',
    maxApplicationsPerCandidate: 3,
    enableDocumentCameraScan: true,
    campaignStartDate: '2026-09-01',
    campaignEndDate: '2026-11-30',
    reEnrollmentDeadline: '2026-12-15',
    maintenanceMode: false,
    autoNotifyOnStatusChange: true,
  });

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AppAuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  useEffect(() => {
    refreshAdminUsers();
    refreshRbacMatrix();
    refreshPlatformSettings();
    refreshDataOverview();
  }, [refreshAdminUsers, refreshRbacMatrix, refreshPlatformSettings, refreshDataOverview]);

  useEffect(() => {
    if (platformSettings) {
      setSettingsForm({
        platformName: platformSettings.platformName || 'GCD USMBA — Gestion du Cycle Doctoral',
        universityName: platformSettings.universityName || 'Université Sidi Mohamed Ben Abdellah de Fès',
        institutionalEmailDomain: platformSettings.institutionalEmailDomain || '@usmba.ac.ma',
        maxApplicationsPerCandidate: platformSettings.maxApplicationsPerCandidate ?? 3,
        enableDocumentCameraScan: platformSettings.enableDocumentCameraScan ?? true,
        campaignStartDate: platformSettings.campaignStartDate || '2026-09-01',
        campaignEndDate: platformSettings.campaignEndDate || '2026-11-30',
        reEnrollmentDeadline: platformSettings.reEnrollmentDeadline || '2026-12-15',
        maintenanceMode: platformSettings.maintenanceMode ?? false,
        autoNotifyOnStatusChange: platformSettings.autoNotifyOnStatusChange ?? true,
      });
    }
  }, [platformSettings]);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await api.admin.getAuditLogs(100);
      if (res.success && Array.isArray(res.logs)) {
        setAuditLogs(res.logs);
      }
    } catch (e) {
      console.error('Audit logs error:', e);
    } finally {
      setLoadingAudit(false);
    }
  };

  const filteredUsers = adminUsers.filter((u) => {
    const roleMatches =
      roleFilter === 'ALL' ||
      u.role.toUpperCase() === roleFilter.toUpperCase() ||
      (roleFilter === 'CED' && (u.role === 'CED' || u.role === 'STRUCTURE_DIRECTOR' || u.role === 'CED_ADMIN')) ||
      (roleFilter === 'ADMIN' && (u.role === 'ADMIN' || u.role === 'SYSTEM_ADMIN'));

    const searchMatches =
      userSearchQuery.trim() === '' ||
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.cin && u.cin.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.establishment && u.establishment.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.laboratory && u.laboratory.toLowerCase().includes(userSearchQuery.toLowerCase()));

    return roleMatches && searchMatches;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    const actionMatches = auditActionFilter === 'ALL' || log.action.includes(auditActionFilter);
    const searchMatches =
      auditSearchQuery.trim() === '' ||
      log.userEmail.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(auditSearchQuery.toLowerCase()));
    return actionMatches && searchMatches;
  });

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminUser(newUserForm);
      setIsCreateUserModalOpen(false);
      setNewUserForm({
        firstName: '',
        lastName: '',
        email: '',
        cin: '',
        phone: '',
        role: 'SUPERVISOR',
        establishment: 'FST Fès',
        laboratory: 'Laboratoire LISAC',
        password: '',
      });
    } catch (err) {
      // error handled in context toast
    }
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateAdminUser(editingUser.id, editingUser);
      setEditingUser(null);
    } catch (err) {
      // error handled in context toast
    }
  };

  const handleResetPasswordConfirm = async () => {
    if (!resettingPasswordUser) return;
    await resetAdminUserPassword(resettingPasswordUser.id, newPasswordInput);
    setResettingPasswordUser(null);
    setNewPasswordInput('');
  };

  const handleToggleUserActive = async (user: User) => {
    await updateAdminUser(user.id, { isActive: !user.isActive });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePlatformSettings(settingsForm);
  };

  const handleExportDataClick = async () => {
    try {
      const data = await exportPlatformData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GCD_USMBA_Export_Admis_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Export de données téléchargé avec succès.');
    } catch (err) {
      showToast('Erreur lors de l’export des données.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-white text-neutral-900">
      {/* Top Header Card */}
      <div className="p-5 border border-neutral-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-neutral-900 px-2 py-0.5 rounded-md">
              ADMINISTRATION SYSTÈME & SÉCURITÉ
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-600 font-mono">
              {currentUser?.email}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Plateforme active
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
            Console d'Administration & Gouvernance RBAC
          </h1>
          <p className="text-xs text-neutral-500">
            Université Sidi Mohamed Ben Abdellah · Centre d'Études Doctorales (CED)
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportDataClick}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter Admis</span>
          </button>

          <button
            onClick={() => setIsCreateUserModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Créer un Compte</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="border-b border-neutral-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 sm:gap-6 min-w-max pb-3 text-xs sm:text-sm">
          {/* Tab 1: Utilisateurs */}
          <button
            onClick={() => setActiveTab('utilisateurs')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'utilisateurs'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Gestion des Utilisateurs</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-neutral-100 text-neutral-800">
              {adminUsers.length}
            </span>
          </button>

          {/* Tab 2: RBAC */}
          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'rbac'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Contrôle d'Accès & Matrice RBAC</span>
          </button>

          {/* Tab 3: Supervision Données */}
          <button
            onClick={() => setActiveTab('donnees')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'donnees'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>3. Supervision des Données & Flux</span>
          </button>

          {/* Tab 4: Paramétrage */}
          <button
            onClick={() => setActiveTab('parametrage')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'parametrage'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>4. Paramétrage Général</span>
          </button>

          {/* Tab 5: Audit & Maintenance */}
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 font-semibold tracking-tight transition-colors pb-3 -mb-3.5 border-b-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>5. Journal d'Audit & Sécurité</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. GESTION DES UTILISATEURS                                    */}
      {/* ============================================================== */}
      {activeTab === 'utilisateurs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'ALL', label: 'Tous' },
                { id: 'CANDIDATE', label: 'Candidats' },
                { id: 'DOCTORANT', label: 'Doctorants' },
                { id: 'SUPERVISOR', label: 'Directeurs Thèse' },
                { id: 'CED', label: 'Direction CED' },
                { id: 'ADMIN', label: 'Administrateurs' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRoleFilter(item.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    roleFilter === item.id
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Rechercher nom, email, CIN, labo..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Utilisateur & Contact</th>
                  <th className="py-3 px-4">CIN & Identité</th>
                  <th className="py-3 px-4">Rôle Système</th>
                  <th className="py-3 px-4">Établissement & Labo</th>
                  <th className="py-3 px-4 text-center">Statut Compte</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-neutral-900">{user.name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{user.email}</div>
                      {user.phone && <div className="text-[10px] text-neutral-400">{user.phone}</div>}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                        {user.cin || 'N/A'}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          user.role === 'ADMIN' || user.role === 'SYSTEM_ADMIN'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : user.role === 'CED' || user.role === 'STRUCTURE_DIRECTOR' || user.role === 'CED_ADMIN'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : user.role === 'SUPERVISOR' || user.role === 'directeur_these'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : user.role === 'DOCTORANT'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-neutral-900 truncate">{user.establishment || 'FST Fès'}</div>
                      <div className="text-[10px] text-neutral-500 truncate">{user.laboratory || 'Non rattaché'}</div>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleUserActive(user)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-neutral-200'
                        }`}
                        title="Cliquer pour activer / désactiver le compte"
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Actif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-neutral-400" />
                            <span>Suspendu</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Modifier le compte"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setResettingPasswordUser(user);
                            setNewPasswordInput('usmba2026');
                          }}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Réinitialiser le mot de passe"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => deleteAdminUser(user.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Désactiver / Archiver"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CONTRÔLE D'ACCÈS & MATRICE RBAC                             */}
      {/* ============================================================== */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Matrice de Contrôle d'Accès Basée sur les Rôles (RBAC Strict)
            </h2>
            <p className="text-xs text-neutral-500">
              Chaque utilisateur est cloisonné dans un périmètre strict garanti par les middlewares backend et l'architecture applicative
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rbacMatrix.map((item) => (
              <div key={item.role} className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                      RÔLE : {item.role}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900">{item.roleLabel}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800">
                    Actif
                  </span>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">{item.description}</p>

                <div className="pt-2 border-t border-neutral-100 space-y-2">
                  <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block">
                    Privilèges & Droits autorisés :
                  </span>
                  <div className="space-y-1.5">
                    {item.permissions.map((p) => (
                      <div key={p.code} className="flex items-start gap-2 text-xs text-neutral-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SUPERVISION DES DONNÉES & FLUX                              */}
      {/* ============================================================== */}
      {activeTab === 'donnees' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Supervision Globale des Données & Volumes
              </h2>
              <p className="text-xs text-neutral-500">Flux d'admission et répartition territoriale USMBA</p>
            </div>
            <button
              onClick={() => refreshDataOverview()}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-500">Utilisateurs au Total</span>
              <div className="text-2xl font-bold text-neutral-900">{dataOverview?.totalUsers ?? adminUsers.length}</div>
              <span className="text-[10px] text-emerald-600 font-medium">{dataOverview?.activeUsers ?? adminUsers.length} comptes actifs</span>
            </div>

            <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-500">Sujets de Thèse</span>
              <div className="text-2xl font-bold text-neutral-900">{dataOverview?.totalTopics ?? 4}</div>
              <span className="text-[10px] text-neutral-400">Catalogue doctoral</span>
            </div>

            <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-500">Candidatures Déposées</span>
              <div className="text-2xl font-bold text-neutral-900">{dataOverview?.totalApplications ?? 2}</div>
              <span className="text-[10px] text-neutral-400">Dossiers d'admission</span>
            </div>

            <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-500">Pièces Numériques</span>
              <div className="text-2xl font-bold text-neutral-900">{dataOverview?.totalDocuments ?? 8}</div>
              <span className="text-[10px] text-emerald-600 font-medium">100% certifiées conformes</span>
            </div>
          </div>

          {/* Établissements Breakdown */}
          <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Répartition par Établissement Universitaire (Pôles USMBA)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ESTABLISHMENTS.map((est) => (
                <div key={est} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-neutral-900 truncate">{est}</div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Sujets ouverts :</span>
                    <span className="font-semibold text-neutral-800">2 sujets</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Candidatures :</span>
                    <span className="font-semibold text-neutral-800">En cours</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. PARAMÉTRAGE GÉNÉRAL                                         */}
      {/* ============================================================== */}
      {activeTab === 'parametrage' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-800" />
              <h3 className="text-sm font-bold text-neutral-900">
                Paramètres Système & Règles d'Inscription
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Nom de la Plateforme</label>
                <input
                  type="text"
                  value={settingsForm.platformName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, platformName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Université de Rattachement</label>
                <input
                  type="text"
                  value={settingsForm.universityName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, universityName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Domaine Email Institutionnel Obligatoire</label>
                <input
                  type="text"
                  value={settingsForm.institutionalEmailDomain}
                  onChange={(e) => setSettingsForm({ ...settingsForm, institutionalEmailDomain: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Limite de Candidatures par Candidat</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={settingsForm.maxApplicationsPerCandidate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maxApplicationsPerCandidate: parseInt(e.target.value, 10) || 3 })}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Date d'Ouverture de la Campagne</label>
                <input
                  type="date"
                  value={settingsForm.campaignStartDate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, campaignStartDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Date Limite de Dépôt des Candidatures</label>
                <input
                  type="date"
                  value={settingsForm.campaignEndDate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, campaignEndDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-900"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
              >
                Enregistrer la Configuration Système
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* 5. JOURNAL D'AUDIT & SÉCURITÉ                                  */}
      {/* ============================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Journal d'Audit Système & Sécurité Infalsifiable
              </h2>
              <p className="text-xs text-neutral-500">
                Traçabilité horodatée de l'ensemble des opérations administratives et d'admission
              </p>
            </div>
            <button
              onClick={loadAuditLogs}
              disabled={loadingAudit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="Filtrer par email, action, entité..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-xs placeholder:text-neutral-400"
              />
            </div>
            <select
              value={auditActionFilter}
              onChange={(e) => setAuditActionFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800"
            >
              <option value="ALL">Toutes les actions</option>
              <option value="LOGIN">Connexions (LOGIN)</option>
              <option value="USER">Gestion Utilisateurs</option>
              <option value="APPLICATION">Candidatures & Admissions</option>
              <option value="TOPIC">Sujets de Thèse</option>
              <option value="SIGN">Signatures & Visas</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Horodatage</th>
                  <th className="py-2.5 px-4">Utilisateur</th>
                  <th className="py-2.5 px-4">Rôle</th>
                  <th className="py-2.5 px-4">Action Sécurisée</th>
                  <th className="py-2.5 px-4">Entité / Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400 text-xs">
                      Aucun log correspondant.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/60">
                      <td className="py-2.5 px-4 whitespace-nowrap font-mono text-[11px] text-neutral-500">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('fr-FR') : 'Récent'}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap font-mono text-neutral-900 font-medium">
                        {log.userEmail}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap font-semibold text-neutral-900">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-600 font-mono text-[11px] max-w-sm truncate">
                        {log.entityType} {log.entityId ? `[${log.entityId}]` : ''} {log.details ? JSON.stringify(log.details) : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Créer un Nouveau Compte Utilisateur</h3>
              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                    className="w-full p-2 bg-white border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                    className="w-full p-2 bg-white border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Email Institutionnel (@usmba.ac.ma) *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="nom.prenom@usmba.ac.ma"
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">CIN *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.cin}
                    onChange={(e) => setNewUserForm({ ...newUserForm, cin: e.target.value })}
                    placeholder="CD123456"
                    className="w-full p-2 bg-white border border-neutral-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    placeholder="+212 6 ..."
                    className="w-full p-2 bg-white border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Rôle et Accès RBAC *</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as Role })}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl font-semibold"
                >
                  <option value="SUPERVISOR">Directeur de Thèse (SUPERVISOR)</option>
                  <option value="CED">Directeur de Structure / CED (CED)</option>
                  <option value="CANDIDATE">Candidat (CANDIDATE)</option>
                  <option value="DOCTORANT">Doctorant (DOCTORANT)</option>
                  <option value="ADMIN">Administrateur Système (ADMIN)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Établissement Universitaire</label>
                <select
                  value={newUserForm.establishment}
                  onChange={(e) => setNewUserForm({ ...newUserForm, establishment: e.target.value })}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl"
                >
                  {ESTABLISHMENTS.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Mot de Passe Initial *</label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Min. 8 caractères"
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800"
                >
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Modifier l'Utilisateur : {editingUser.name}</h3>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Prénom</label>
                  <input
                    type="text"
                    value={editingUser.firstName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                    className="w-full p-2 bg-white border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Nom</label>
                  <input
                    type="text"
                    value={editingUser.lastName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                    className="w-full p-2 bg-white border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">CIN</label>
                <input
                  type="text"
                  value={editingUser.cin || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, cin: e.target.value.toUpperCase() })}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Rôle Système</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl font-semibold"
                >
                  <option value="SUPERVISOR">SUPERVISOR (Directeur de Thèse)</option>
                  <option value="CED">CED (Directeur de Structure / Pôle CED)</option>
                  <option value="CANDIDATE">CANDIDATE (Candidat)</option>
                  <option value="DOCTORANT">DOCTORANT (Inscrit en thèse)</option>
                  <option value="ADMIN">ADMIN (Administrateur Plateforme)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Établissement</label>
                <select
                  value={editingUser.establishment || 'FST Fès'}
                  onChange={(e) => setEditingUser({ ...editingUser, establishment: e.target.value })}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl"
                >
                  {ESTABLISHMENTS.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Laboratoire</label>
                <input
                  type="text"
                  value={editingUser.laboratory || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, laboratory: e.target.value })}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userActiveCheck"
                  checked={editingUser.isActive ?? true}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-neutral-900 border-neutral-300"
                />
                <label htmlFor="userActiveCheck" className="text-xs font-semibold text-neutral-700">
                  Compte actif et autorisé à se connecter
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-2xl shadow-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">
              Réinitialiser le Mot de Passe
            </h3>
            <p className="text-xs text-neutral-600">
              Compte : <strong>{resettingPasswordUser.email}</strong>
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Nouveau mot de passe</label>
              <input
                type="text"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="usmba2026"
                className="w-full p-2 text-xs bg-white border border-neutral-200 rounded-xl font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResettingPasswordUser(null)}
                className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleResetPasswordConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800"
              >
                Confirmer Réinitialisation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
