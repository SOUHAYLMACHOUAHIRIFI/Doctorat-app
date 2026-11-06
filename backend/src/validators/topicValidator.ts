import { z } from 'zod';

export const createTopicSchema = z.object({
  title: z.string().min(10, 'Le titre du sujet doit contenir au moins 10 caractères').trim(),
  summary: z.string().min(30, 'Le résumé scientifique doit contenir au moins 30 caractères').trim(),
  keywords: z.array(z.string().trim()).min(1, 'Au moins un mot-clé requis'),
  establishment: z.string().min(2, 'Établissement requis').trim(),
  laboratoryId: z.string().min(2, 'Laboratoire requis').trim(),
  slotsTotal: z.number().int().min(1).max(5).default(1),
});

export const updateTopicSchema = z.object({
  title: z.string().min(10).trim().optional(),
  summary: z.string().min(30).trim().optional(),
  keywords: z.array(z.string().trim()).optional(),
  slotsTotal: z.number().int().min(1).max(5).optional(),
});

export const reviewTopicStructureSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  feedback: z.string().min(5, 'Un avis motivé d’au moins 5 caractères est obligatoire').trim(),
});
