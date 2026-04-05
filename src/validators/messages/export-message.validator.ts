import { z } from 'zod';

// ============================================
// EXPORT MESSAGES VALIDATOR (admin)
// ============================================
export const exportMessagesSchema = z.object({
  format: z.enum(['csv', 'excel'], {
    message: 'Format invalide (csv ou excel)',
  }),

  isRead: z.boolean().optional(),

  email: z
    .string()
    .email('Email invalide')
    .optional()
    .transform((val) => val?.toLowerCase()),

  search: z
    .string()
    .max(100, 'La recherche est trop longue')
    .optional()
    .transform((val) => val?.trim()),

  startDate: z.string().datetime({ message: 'Format de date invalide (ISO 8601)' }).optional(),

  endDate: z.string().datetime({ message: 'Format de date invalide (ISO 8601)' }).optional(),

  isReplied: z.boolean().optional(),
});

export type ExportMessagesData = z.infer<typeof exportMessagesSchema>;

export const validateExportMessages = (data: unknown) => {
  return exportMessagesSchema.safeParse(data);
};
