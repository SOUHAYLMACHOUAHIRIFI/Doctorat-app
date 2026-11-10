import { documentRepository } from '../repositories/documentRepository';
import { db } from '../repositories/database';
import { ApplicationDocumentEntity, SafeUser } from '../types';
import { DOCUMENT_STATUS, MANDATORY_DOCUMENT_TYPES, DocumentStatusCode } from '../config/constants';
import { auditService } from './auditService';
import { notificationService } from './notificationService';

export const documentService = {
  getCandidateDocuments(candidateUserId: string): ApplicationDocumentEntity[] {
    const candidates = db.get('candidates');
    let cand = candidates.find((c) => c.userId === candidateUserId || c.id === candidateUserId);
    const users = db.get('users');
    const user = users.find((u) => u.id === candidateUserId || (cand && u.id === cand.userId));

    if (!cand && user) {
      cand = {
        id: `cand-${Date.now().toString(36)}`,
        userId: user.id,
        etablissementOrigine: user.establishment || 'FST Fès',
        diplomeOrigine: 'Master de Recherche',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      candidates.push(cand);
      db.save();
    }

    const allDocs = db.get('documents');
    const matched = allDocs.filter((d) => {
      if (cand && d.candidateId === cand.id) return true;
      if (cand && d.candidateId === cand.userId) return true;
      if (d.candidateId === candidateUserId) return true;
      if (user && d.candidateEmail && d.candidateEmail.toLowerCase() === user.email.toLowerCase()) return true;
      return false;
    });

    return matched.map((d) => ({
      ...d,
      candidateEmail: user?.email || d.candidateEmail,
    }));
  },

  isDossierComplet(candidateUserId: string): boolean {
    const docs = this.getCandidateDocuments(candidateUserId);
    const validOrUploaded = docs.filter(
      (d) => d.status !== DOCUMENT_STATUS.REJETE && d.status !== DOCUMENT_STATUS.NON_DEPOSE
    );
    return MANDATORY_DOCUMENT_TYPES.every((typeCode) =>
      validOrUploaded.some((d) => d.typeCode === typeCode)
    );
  },

  uploadDocument(
    user: SafeUser,
    data: {
      typeCode: string;
      title?: string;
      fileName: string;
      fileSize: string;
      fileMimeType: string;
      dataUrl: string;
      captureMethod?: string;
    }
  ): ApplicationDocumentEntity {
    const candidates = db.get('candidates');
    let cand = candidates.find((c) => c.userId === user.id);

    if (!cand) {
      cand = {
        id: `cand-${Date.now().toString(36)}`,
        userId: user.id,
        etablissementOrigine: user.establishment || 'FST Fès',
        diplomeOrigine: 'Master de Recherche',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      candidates.push(cand);
      db.save();
    }

    const titles: Record<string, string> = {
      baccalaureat: 'Diplôme du Baccalauréat',
      releve_notes: 'Fiches et Relevés de Notes (Licence & Master)',
      diplomes: 'Diplômes (Licence / Master / Ingénieur)',
      cin: 'Carte d’Identité Nationale (CIN)',
    };

    const now = new Date().toISOString().split('T')[0];

    const newDoc: ApplicationDocumentEntity = {
      id: `doc-${Date.now().toString(36)}`,
      candidateId: cand.id,
      candidateEmail: user.email,
      typeCode: data.typeCode,
      title: data.title?.trim() || titles[data.typeCode] || 'Document Justificatif',
      fileName: data.fileName,
      fileSize: data.fileSize || '1.8 Mo',
      fileMimeType: data.fileMimeType || 'application/pdf',
      dataUrl: data.dataUrl,
      status: DOCUMENT_STATUS.DEPOSE,
      captureMethod: (data.captureMethod as any) || 'upload',
      uploadedAt: now,
      updatedAt: now,
    };

    documentRepository.create(newDoc);

    auditService.log(
      user.email,
      user.role,
      'UPLOAD_DOCUMENT',
      'ApplicationDocument',
      newDoc.id,
      { typeCode: data.typeCode, fileName: data.fileName, captureMethod: data.captureMethod },
      user.id
    );

    return newDoc;
  },

  reviewDocument(
    reviewer: SafeUser,
    documentId: string,
    newStatus: DocumentStatusCode,
    reason?: string
  ): ApplicationDocumentEntity {
    const doc = documentRepository.findById(documentId);
    if (!doc) throw new Error('Document non trouvé.');

    // Rejection or correction requires reason
    if ((newStatus === DOCUMENT_STATUS.REJETE || newStatus === DOCUMENT_STATUS.A_CORRIGER) && (!reason || reason.trim().length < 5)) {
      throw new Error('Un motif ou une explication détaillée d’au moins 5 caractères est obligatoire pour un rejet ou une demande de correction.');
    }

    const prevStatus = doc.status;
    const updated = documentRepository.update(documentId, {
      status: newStatus,
      rejectionReason: newStatus === DOCUMENT_STATUS.REJETE ? reason : undefined,
      correctionNotes: newStatus === DOCUMENT_STATUS.A_CORRIGER ? reason : undefined,
    });

    if (!updated) throw new Error('Erreur de mise à jour du document.');

    // Record review in history
    documentRepository.addReview({
      id: `rev-${Date.now().toString(36)}`,
      documentId,
      reviewerId: reviewer.id,
      reviewerName: `${reviewer.firstName} ${reviewer.lastName}`,
      previousStatus: prevStatus,
      newStatus,
      reason: reason?.trim(),
      reviewedAt: new Date().toISOString().split('T')[0],
    });

    auditService.log(
      reviewer.email,
      reviewer.role,
      'REVIEW_DOCUMENT',
      'ApplicationDocument',
      documentId,
      { prevStatus, newStatus, reason },
      reviewer.id
    );

    // Notify candidate
    const cand = db.get('candidates').find((c) => c.id === doc.candidateId);
    if (cand) {
      const candidateUser = db.get('users').find((u) => u.id === cand.userId);
      if (candidateUser) {
        notificationService.notify(
          candidateUser.id,
          `Statut de pièce mis à jour : ${doc.title}`,
          newStatus === DOCUMENT_STATUS.VALIDE
            ? `Votre pièce "${doc.title}" a été validée administrativement.`
            : `Votre pièce "${doc.title}" a été marquée "${newStatus}" : ${reason}`,
          newStatus === DOCUMENT_STATUS.VALIDE ? 'SUCCESS' : 'WARNING',
          '/candidat'
        );
      }
    }

    return updated;
  },

  deleteDocument(user: SafeUser, documentId: string): boolean {
    const doc = documentRepository.findById(documentId);
    if (!doc) throw new Error('Document non trouvé.');

    const cand = db.get('candidates').find((c) => c.userId === user.id);
    if (!cand || cand.id !== doc.candidateId) {
      throw new Error('Vous n’avez pas le droit de supprimer ce document.');
    }

    const success = documentRepository.delete(documentId);
    if (success) {
      auditService.log(user.email, user.role, 'DELETE_DOCUMENT', 'ApplicationDocument', documentId, {}, user.id);
    }
    return success;
  },
};
