import { z } from 'zod';

// ============================================
// MESSAGES QUERY VALIDATOR (admin)
// ============================================
export const messagesQuerySchema = z.object({
  page: z.number().min(1, 'La page doit être au moins 1').optional().default(1),

  limit: z
    .number()
    .min(1, 'La limite doit être au moins 1')
    .max(100, 'La limite ne peut pas dépasser 100')
    .optional()
    .default(10),

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

  sortBy: z
    .enum(['createdAt', 'updatedAt', 'email', 'isRead'], {
      message: 'Tri invalide',
    })
    .optional()
    .default('createdAt'),

  sortOrder: z
    .enum(['asc', 'desc'], {
      message: 'Ordre de tri invalide',
    })
    .optional()
    .default('desc'),

  showDeleted: z.boolean().optional().default(false),

  isReplied: z.boolean().optional(),
});

export type MessagesQueryData = z.infer<typeof messagesQuerySchema>;

export const validateMessagesQuery = (data: unknown) => {
  return messagesQuerySchema.safeParse(data);
};
