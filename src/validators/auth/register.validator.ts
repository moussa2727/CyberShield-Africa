import { z } from 'zod';

// Schema de validation pour l'inscription
export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(50),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
    email: z.string().email('Email invalide').toLowerCase().trim(),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
