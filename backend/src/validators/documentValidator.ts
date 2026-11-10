import { z } from 'zod';

const validDocumentTypes = ['baccalaureat', 'releve_notes', 'diplomes', 'cin'] as const;

const normalizeTypeCode = (val: string): 'baccalaureat' | 'releve_notes' | 'diplomes' | 'cin' => {
  const normalized = val.trim().toLowerCase();
  const map: Record<string, 'baccalaureat' | 'releve_notes' | 'diplomes' | 'cin'> = {
    bac: 'baccalaureat',
    baccalaureat: 'baccalaureat',
    notes: 'releve_notes',
    releve_notes: 'releve_notes',
    releves: 'releve_notes',
    releves_notes: 'releve_notes',
    transcript: 'releve_notes',
    transcripts: 'releve_notes',
    diplome: 'diplomes',
    diplomes: 'diplomes',
    diploma: 'diplomes',
    diplomas: 'diplomes',
    cin: 'cin',
  };
  return map[normalized] || (normalized as any);
};

export const singleDocumentItemSchema = z.object({
  typeCode: z.string().transform(normalizeTypeCode).pipe(z.enum(validDocumentTypes)),
  fileName: z.string().min(1, 'Nom de fichier requis').trim(),
  title: z.string().optional(),
  fileSize: z.string().default('1.8 Mo'),
  fileMimeType: z.string().optional().default('application/pdf'),
  dataUrl: z.string().min(5, 'Données du document manquantes'),
  captureMethod: z.string().optional().default('upload'),
});

const fileItemSchema = z.object({
  fileName: z.string().min(1, 'Nom de fichier requis').trim(),
  title: z.string().optional(),
  fileSize: z.string().default('1.8 Mo'),
  fileMimeType: z.string().optional().default('application/pdf'),
  dataUrl: z.string().min(5, 'Données du document manquantes'),
  captureMethod: z.string().optional().default('upload'),
});

export const batchCategoryFilesSchema = z.object({
  typeCode: z.string().transform(normalizeTypeCode).pipe(z.enum(validDocumentTypes)),
  title: z.string().optional(),
  files: z.array(fileItemSchema).min(1, 'Au moins un fichier requis'),
});

export const batchDocumentsListSchema = z.object({
  documents: z.array(singleDocumentItemSchema).min(1, 'Au moins un document requis'),
});

export const uploadDocumentSchema = z.union([
  singleDocumentItemSchema,
  batchCategoryFilesSchema,
  batchDocumentsListSchema,
  z.array(singleDocumentItemSchema).min(1, 'Au moins un document requis'),
]);

export const reviewDocumentSchema = z.object({
  status: z.enum(['VALIDE', 'REJETE', 'A_CORRIGER']),
  reason: z.string().optional(),
}).refine((data) => {
  if (data.status === 'REJETE' || data.status === 'A_CORRIGER') {
    return typeof data.reason === 'string' && data.reason.trim().length >= 5;
  }
  return true;
}, {
  message: 'Un motif ou une explication détaillée d’au moins 5 caractères est obligatoire en cas de rejet ou de correction demandée.',
  path: ['reason'],
});
