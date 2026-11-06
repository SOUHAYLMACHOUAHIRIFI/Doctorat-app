import { z } from 'zod';

export const applyTopicSchema = z.object({
  topicId: z.string().min(1, 'Identifiant du sujet requis'),
  notes: z.string().optional(),
  motivationLetter: z.string().optional(),
  profileDetails: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().min(8),
    cin: z.string().min(4),
    etablissementOrigine: z.string().min(2),
    diplomeOrigine: z.string().min(2),
  }).optional(),
});

export const evaluateApplicationSupervisorSchema = z.object({
  decision: z.enum(['FAVORABLE', 'DEFAVORABLE', 'A_CORRIGER']),
  grade: z.string().optional(),
  feedback: z.string().min(5, 'Une appréciation motivée d’au moins 5 caractères est requise').trim(),
});

export const validateApplicationStructureSchema = z.object({
  decision: z.enum(['VALIDE', 'REJETE']),
  feedback: z.string().min(5, 'Un avis motivé d’au moins 5 caractères est obligatoire').trim(),
});
