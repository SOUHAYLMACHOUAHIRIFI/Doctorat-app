import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  typeCode: z.enum(['baccalaureat', 'releve_notes', 'diplomes', 'cin']),
  fileName: z.string().min(3, 'Nom de fichier requis').trim(),
  fileSize: z.string().default('1.8 Mo'),
  fileMimeType: z.string().refine((val) => {
    return (
      val.startsWith('application/pdf') ||
      val.startsWith('image/jpeg') ||
      val.startsWith('image/png') ||
      val.startsWith('image/webp')
    );
  }, 'Format de fichier non autorisé. Formats acceptés : PDF, JPG, PNG, WEBP'),
  dataUrl: z.string().min(10, 'Données du document manquantes (Base64 requis)'),
  captureMethod: z.enum(['camera', 'upload']).default('upload'),
});

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
