import { z } from 'zod';

// ============================================
// CREATE MESSAGE VALIDATOR (public)
// ============================================
export const createMessageSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Le nom complet doit contenir au moins 2 caractères')
    .max(100, 'Le nom complet ne peut pas dépasser 100 caractères')
    .optional()
    .transform((val: string | undefined) => val?.trim()),

  company: z
    .string()
    .min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères')
    .max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères')
    .optional()
    .transform((val: string | undefined) => val?.trim()),

  service: z
    .string()
    .min(1, 'Le service est requis')
    .max(50, 'Le service ne peut pas dépasser 50 caractères')
    .optional()
    .transform((val: string | undefined) => val?.trim()),

 
  email: z
    .string()
    .email('Email invalide')
    .min(1, "L'email est requis")
    .max(255, 'Email trop long')
    .toLowerCase()
    .trim(),

  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message ne peut pas dépasser 2000 caractères')
    .trim(),
});

export type CreateMessageData = z.infer<typeof createMessageSchema>;

export const validateCreateMessage = (data: unknown) => {
  return createMessageSchema.safeParse(data);
};

export const validateCreateMessageField = (
  field: keyof CreateMessageData,
  value: unknown
) => {
  const fieldSchema = createMessageSchema.shape[field];
  const result = fieldSchema.safeParse(value);
  
  if (!result.success) {
    return result.error.issues[0].message;
  }
  
  return undefined;
};
