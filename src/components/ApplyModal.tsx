import React, { useState } from 'react';
import { ThesisTopic, DocumentType, CandidateDocument } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Check,
  Building2,
  User,
  Phone,
  CreditCard,
  GraduationCap,
  Mail,
  FileText,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { DocumentScannerModal } from './DocumentScannerModal';

interface ApplyModalProps {
  topic: ThesisTopic | null;
  onClose: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ topic, onClose }) => {
  const { addApplication, currentUser, documents, applications, uploadCandidateDocument, openAttachment, showToast } =
    useApp();

  const initialFirstName = currentUser?.firstName || currentUser?.name?.split(' ')[0] || '';
  const initialLastName =
    currentUser?.lastName || currentUser?.name?.split(' ').slice(1).join(' ') || '';

  const [nom, setNom] = useState(initialLastName);
  const [prenom, setPrenom] = useState(initialFirstName);
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [cin, setCin] = useState(currentUser?.cin || '');
  const [etablissementOrigine, setEtablissementOrigine] = useState(
    currentUser?.etablissementOrigine || currentUser?.establishment || 'FST Fès'
  );
  const [diplomeOrigine, setDiplomeOrigine] = useState(
    currentUser?.diplomeOrigine || 'Master de Recherche en Informatique & IA'
  );
  const [statement, setStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Scanner modal state within apply flow
  const [scanningType, setScanningType] = useState<DocumentType | null>(null);
  const [scanningTitle, setScanningTitle] = useState<string>('');

  if (!topic) return null;

  // Active candidatures for current user
  const userApplications = applications.filter(
    (a) =>
      (a.candidateEmail && a.candidateEmail.toLowerCase() === (email.trim().toLowerCase() || currentUser?.email.toLowerCase())) ||
      (currentUser && a.candidateId === currentUser.id)
  );
  const hasReachedMaxApplications = userApplications.length >= 3;

  // Retrieve current candidate documents
  const candidateDocs = documents.filter(
    (d) =>
      (d.candidateEmail || '').toLowerCase() ===
      (email.trim().toLowerCase() || currentUser?.email.toLowerCase())
  );

  const REQUIRED_DOC_TYPES: { type: DocumentType; label: string; desc: string }[] = [
    { type: 'baccalaureat', label: '1. Baccalauréat', desc: 'Diplôme certifié conforme' },
    {
      type: 'releve_notes',
      label: '2. Relevés de notes',
      desc: 'Relevés officiels Licence & Master',
    },
    { type: 'diplomes', label: '3. Diplômes universitaires', desc: 'Attestations & Diplômes' },
    { type: 'cin', label: '4. Carte d’Identité (CIN)', desc: 'Scan recto/verso net de la CIN' },
  ];

  const missingDocs = REQUIRED_DOC_TYPES.filter(
    (rd) => !candidateDocs.some((d) => d.type === rd.type)
  );

  const isDossierComplet = missingDocs.length === 0;

  const handleOpenScanner = (type: DocumentType, label: string) => {
    setScanningType(type);
    setScanningTitle(label);
  };

  const handleSaveScanned = async (
    type: DocumentType,
    fileName: string,
    fileSize: string,
    dataUrl: string,
    method: 'upload',
    customTitle?: string
  ) => {
    await uploadCandidateDocument(type, fileName, fileSize, dataUrl, method, customTitle);
    setScanningType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (hasReachedMaxApplications) {
      setErrorMsg('Vous avez atteint la limite maximale de 3 candidatures autorisées par le règlement doctoral.');
      return;
    }

    if (!nom.trim() || !prenom.trim() || !email.trim() || !phone.trim() || !cin.trim()) {
      setErrorMsg(
        'Veuillez renseigner tous les champs obligatoires du profil (Nom, Prénom, Email, Téléphone, CIN).'
      );
      return;
    }

    if (!email.toLowerCase().endsWith('@usmba.ac.ma')) {
      setErrorMsg('Veuillez renseigner une adresse email institutionnelle (@usmba.ac.ma).');
      return;
    }

    if (!isDossierComplet) {
      setErrorMsg(
        `Dossier incomplet : Vous devez obligatoirement joindre vos 4 pièces justificatives avant de finaliser votre candidature (manquant : ${missingDocs
          .map((m) => m.label)
          .join(', ')}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await addApplication(
        topic.id,
        statement.trim() || `Candidature formelle soumise par ${prenom} ${nom}.`,
        `Dossier de candidature initial et projet de recherche pour "${topic.title}". Titulaire de : ${diplomeOrigine} (${etablissementOrigine}).`,
        {
          nom: nom.trim(),
          prenom: prenom.trim(),
          firstName: prenom.trim(),
          lastName: nom.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          cin: cin.trim().toUpperCase(),
          etablissementOrigine: etablissementOrigine.trim(),
          diplomeOrigine: diplomeOrigine.trim(),
        },
        candidateDocs
      );
      showToast('Candidature transmise avec succès au directeur de thèse !');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors du dépôt de candidature.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
        <div className="w-full max-w-[95vw] sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-neutral-100 flex items-center justify-between z-10">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
                <span>Dépôt Officiel de Candidature · Étape 3</span>
              </div>
              <h2 className="text-base font-bold text-neutral-900 mt-0.5">
                Candidature au Doctorat
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer la boîte de dialogue"
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
            {/* Selected Topic Card */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1.5">
              <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                Sujet de thèse sélectionné
              </div>
              <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                {topic.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-neutral-600 pt-0.5">
                <span className="font-semibold text-neutral-900">{topic.establishment}</span>
                <span>•</span>
                <span>{topic.laboratory}</span>
                <span>•</span>
                <span className="text-neutral-800 font-medium">Encadrant : {topic.supervisorName}</span>
              </div>
            </div>

            {hasReachedMaxApplications && (
              <div className="p-3.5 text-xs bg-amber-50 text-amber-900 border border-amber-300 rounded-xl font-medium leading-relaxed flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Vous avez atteint la limite maximale de 3 candidatures autorisées par le règlement doctoral de l'USMBA. Vous ne pouvez plus déposer de nouvelle candidature sans retirer un dossier existant.
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-xl font-medium leading-relaxed flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Coordonnées Candidat */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-neutral-800" />
                <span>1. Informations personnelles du candidat</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: El Amrani"
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Prénom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ex: Youssef"
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Code CIN <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={cin}
                      onChange={(e) => setCin(e.target.value.toUpperCase())}
                      placeholder="Ex: CD789123"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono uppercase bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Téléphone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: +212 6 61 23 45 67"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Académique (@usmba.ac.ma) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom.prenom@usmba.ac.ma"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Cursus Universitaire */}
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-neutral-800" />
                <span>2. Cursus & Diplôme d'origine</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Établissement d'origine
                  </label>
                  <select
                    value={etablissementOrigine}
                    onChange={(e) => setEtablissementOrigine(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="FST Fès">Faculté des Sciences et Techniques (FST Fès)</option>
                    <option value="FS Dhar El Mahraz">
                      Faculté des Sciences Dhar El Mahraz (FSDM)
                    </option>
                    <option value="ENSA Fès">
                      École Nationale des Sciences Appliquées (ENSA Fès)
                    </option>
                    <option value="FSJES Fès">Faculté des Sciences Juridiques, Éco et Sociales</option>
                    <option value="FLSH Dhar El Mahraz">
                      Faculté des Lettres et des Sciences Humaines
                    </option>
                    <option value="EST Fès">École Supérieure de Technologie (EST Fès)</option>
                    <option value="Autre Établissement Universitaire">Autre Établissement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Dernier diplôme préparé / obtenu
                  </label>
                  <input
                    type="text"
                    value={diplomeOrigine}
                    onChange={(e) => setDiplomeOrigine(e.target.value)}
                    placeholder="Ex: Master Recherche en IA"
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* 3. Pièces Justificatives (4/4 requises) */}
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-neutral-800" />
                  <span>3. Pièces justificatives liées (4/4 requises)</span>
                </h4>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isDossierComplet
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {candidateDocs.length} / 4 fournies
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REQUIRED_DOC_TYPES.map((rd) => {
                  const docs = candidateDocs.filter((d) => d.type === rd.type);
                  const hasDocs = docs.length > 0;

                  return (
                    <div
                      key={rd.type}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                        hasDocs
                          ? 'bg-neutral-50 border-neutral-200 shadow-2xs'
                          : 'bg-white border-dashed border-rose-200 hover:border-neutral-900'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-neutral-900">{rd.label}</div>
                            <div className="text-[10px] text-neutral-500 mt-0.5">{rd.desc}</div>
                          </div>

                          {hasDocs ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 shrink-0">
                              <Check className="w-3 h-3" />
                              <span>{docs.length} fichier{docs.length > 1 ? 's' : ''} lié{docs.length > 1 ? 's' : ''}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200 shrink-0">
                              Requis
                            </span>
                          )}
                        </div>

                        {hasDocs ? (
                          <div className="space-y-2 pt-1 border-t border-neutral-200/80">
                            {docs.map((doc, docIdx) => (
                              <div
                                key={doc.id || docIdx}
                                className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-neutral-200 text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {doc.dataUrl && doc.dataUrl.startsWith('data:image/') ? (
                                    <img
                                      src={doc.dataUrl}
                                      alt={doc.title}
                                      className="w-7 h-7 object-cover rounded border border-neutral-300 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                                      PDF
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <span className="font-mono text-[11px] font-bold text-neutral-900 block truncate max-w-[140px] sm:max-w-[180px]">
                                      {doc.title || doc.fileName}
                                    </span>
                                    <span className="text-[9px] text-neutral-500 font-mono block">
                                      {doc.fileName} ({doc.fileSize})
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openAttachment({
                                      title: doc.title,
                                      subtitle: `Aperçu document — ${doc.fileName}`,
                                      content: `Scan certifié conforme pour le candidat ${nom} ${prenom} (CIN: ${cin}).\n\nTaille : ${doc.fileSize}\nNumérisé le : ${doc.uploadedAt}`,
                                      author: `${prenom} ${nom}`,
                                      date: doc.uploadedAt,
                                      dataUrl: doc.dataUrl,
                                    })
                                  }
                                  className="text-[11px] font-semibold text-neutral-800 hover:text-black underline shrink-0"
                                >
                                  Voir
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="pt-2.5 mt-2 border-t border-neutral-200/60">
                        <button
                          type="button"
                          onClick={() => handleOpenScanner(rd.type, rd.label)}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs ${
                            hasDocs
                              ? 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-200'
                              : 'bg-neutral-900 text-white hover:bg-neutral-800'
                          }`}
                        >
                          {hasDocs ? (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Ajouter un fichier ({rd.label})</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3" />
                              <span>Importer ce justificatif</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Note de motivation */}
            <div className="space-y-1.5 pt-3 border-t border-neutral-100">
              <label className="text-xs font-semibold text-neutral-800">
                4. Note de motivation / projet préliminaire (Optionnel)
              </label>
              <textarea
                rows={3}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Ex: Motivé par la recherche doctorale au sein du laboratoire, mes compétences s’alignent directement avec les objectifs du sujet..."
                className="w-full p-3 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400 leading-relaxed"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors text-center"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isDossierComplet || hasReachedMaxApplications}
                className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {hasReachedMaxApplications
                    ? 'Limite de 3 candidatures atteinte'
                    : isSubmitting
                    ? 'Transmission en cours...'
                    : isDossierComplet
                    ? 'Valider et transmettre ma candidature'
                    : '4 pièces requises pour valider'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Scanner modal within application submission */}
      <DocumentScannerModal
        isOpen={scanningType !== null}
        docType={scanningType}
        docTitle={scanningTitle}
        onClose={() => setScanningType(null)}
        onSave={handleSaveScanned}
      />
    </>
  );
};
