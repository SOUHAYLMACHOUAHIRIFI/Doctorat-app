import { db } from './database';
import { ApplicationDocumentEntity, DocumentReviewEntity } from '../types';
import { DocumentStatusCode } from '../config/constants';

export const documentRepository = {
  findAll(): ApplicationDocumentEntity[] {
    return [...db.get('documents')];
  },

  findById(id: string): ApplicationDocumentEntity | undefined {
    return db.get('documents').find((d) => d.id === id);
  },

  findByCandidate(candidateId: string): ApplicationDocumentEntity[] {
    return db.get('documents').filter((d) => d.candidateId === candidateId);
  },

  findByApplication(applicationId: string): ApplicationDocumentEntity[] {
    return db.get('documents').filter((d) => d.applicationId === applicationId);
  },

  create(doc: ApplicationDocumentEntity): ApplicationDocumentEntity {
    // Remove existing document of the same type for this candidate (replace)
    const docs = db.get('documents');
    const existingIndex = docs.findIndex(
      (d) => d.candidateId === doc.candidateId && d.typeCode === doc.typeCode
    );

    if (existingIndex !== -1) {
      docs.splice(existingIndex, 1);
    }

    docs.unshift(doc);
    db.save();
    return doc;
  },

  update(id: string, updates: Partial<ApplicationDocumentEntity>): ApplicationDocumentEntity | undefined {
    const doc = this.findById(id);
    if (!doc) return undefined;

    Object.assign(doc, updates, { updatedAt: new Date().toISOString().split('T')[0] });
    db.save();
    return doc;
  },

  delete(id: string): boolean {
    const docs = db.get('documents');
    const index = docs.findIndex((d) => d.id === id);
    if (index === -1) return false;

    docs.splice(index, 1);
    db.save();
    return true;
  },

  addReview(review: DocumentReviewEntity): DocumentReviewEntity {
    db.get('documentReviews').unshift(review);
    db.save();
    return review;
  },

  getReviewsByDocument(documentId: string): DocumentReviewEntity[] {
    return db.get('documentReviews').filter((r) => r.documentId === documentId);
  },
};
