import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(50)
      .optional(),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50).optional(),
    email: z.string().email('Email invalide').toLowerCase().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni',
    path: [],
  });

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
