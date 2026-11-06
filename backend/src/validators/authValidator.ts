import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email invalide').toLowerCase(),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const candidateRegisterSchema = z.object({
  email: z
    .string()
    .email('Format email invalide')
    .toLowerCase()
    .refine((val) => val.endsWith('@usmba.ac.ma'), {
      message: 'L’inscription nécessite impérativement une adresse email institutionnelle (@usmba.ac.ma)',
    }),
  password: z
    .string()
    .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').trim(),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').trim(),
  cin: z
    .string()
    .min(4, 'Code CIN invalide')
    .max(12, 'Code CIN trop long')
    .regex(/^[A-Z0-9]+$/i, 'Format CIN invalide')
    .toUpperCase(),
  phone: z.string().min(8, 'Numéro de téléphone requis').trim(),
  etablissementOrigine: z.string().min(2, 'Établissement requis').trim(),
  diplomeOrigine: z.string().min(2, 'Diplôme d’origine requis').trim(),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Format email invalide').toLowerCase(),
});

export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(10, 'Jeton de réinitialisation invalide'),
  newPassword: z
    .string()
    .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
    .regex(/[A-Z]/, 'Au moins une lettre majuscule requise')
    .regex(/[0-9]/, 'Au moins un chiffre requis'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  cin: z.string().min(4).optional(),
  etablissementOrigine: z.string().optional(),
  diplomeOrigine: z.string().optional(),
});
