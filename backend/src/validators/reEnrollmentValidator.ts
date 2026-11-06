import { z } from 'zod';

export const createReEnrollmentSchema = z.object({
  yearNumber: z.number().int().min(2).max(6),
  summary: z.string().min(20, 'Le rapport d’activité synthétique doit comporter au moins 20 caractères').trim(),
  publicationsCount: z.number().int().min(0).default(0),
  communicationsCount: z.number().int().min(0).default(0),
  progressPercentage: z.number().int().min(0).max(100),
  reportFileName: z.string().optional(),
  reportDataUrl: z.string().optional(),
});

export const evaluateReEnrollmentSupervisorSchema = z.object({
  status: z.enum(['AVIS_FAVORABLE_ENCADRANT', 'A_CORRIGER_ENCADRANT', 'AVIS_DEFAVORABLE_ENCADRANT']),
  feedback: z.string().min(5, 'Une appréciation motivée est obligatoire').trim(),
});

export const validateReEnrollmentCedSchema = z.object({
  status: z.enum(['VALIDE_CED', 'REJETE_CED']),
  feedback: z.string().min(5, 'L’avis de la commission CED est obligatoire').trim(),
});
