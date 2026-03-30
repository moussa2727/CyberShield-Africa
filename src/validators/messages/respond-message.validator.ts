import { z } from 'zod';

// ============================================
// RESPOND MESSAGE VALIDATOR (admin)
// ============================================
export const respondMessageSchema = z.object({
  response: z
    .string()
    .min(10, 'La réponse doit contenir au moins 10 caractères')
    .max(2000, 'La réponse ne peut pas dépasser 2000 caractères')
    .trim(),

  markAsRead: z
    .boolean()
    .optional()
    .default(true),
});

export type RespondMessageData = z.infer<typeof respondMessageSchema>;

export const validateRespondMessage = (data: unknown) => {
  return respondMessageSchema.safeParse(data);
};

export const validateRespondMessageField = (
  field: keyof RespondMessageData,
  value: unknown
) => {
  const fieldSchema = respondMessageSchema.shape[field];
  const result = fieldSchema.safeParse(value);
  
  if (!result.success) {
    return result.error.issues[0].message;
  }
  
  return undefined;
};