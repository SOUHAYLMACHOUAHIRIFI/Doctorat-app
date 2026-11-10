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
    const docs = db.get('documents');
    // Only replace if updating the exact same document ID
    const existingIndex = docs.findIndex((d) => d.id === doc.id);

    if (existingIndex !== -1) {
      docs[existingIndex] = doc;
    } else {
      docs.unshift(doc);
    }

    db.save();
    return doc;
  },

  createMany(newDocs: ApplicationDocumentEntity[]): ApplicationDocumentEntity[] {
    const docs = db.get('documents');
    for (const doc of newDocs) {
      const existingIndex = docs.findIndex((d) => d.id === doc.id);
      if (existingIndex !== -1) {
        docs[existingIndex] = doc;
      } else {
        docs.unshift(doc);
      }
    }
    db.save();
    return newDocs;
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
