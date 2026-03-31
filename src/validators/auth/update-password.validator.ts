import { z } from 'zod';

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Le mot de passe actuel doit contenir au moins 8 caractères'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(8, 'La confirmation du mot de passe doit contenir au moins 8 caractères'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ['confirmPassword'],
  });

export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
