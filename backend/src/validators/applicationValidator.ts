import { z } from 'zod';

export const applyTopicSchema = z.object({
  topicId: z.string().min(1, 'Identifiant du sujet requis'),
  notes: z.string().optional(),
  motivationLetter: z.string().optional(),
  profileDetails: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      prenom: z.string().optional(),
      nom: z.string().optional(),
      phone: z.string().optional(),
      cin: z.string().optional(),
      etablissementOrigine: z.string().optional(),
      diplomeOrigine: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
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
