import { z } from 'zod';

// ============================================
// MARK AS READ VALIDATOR (admin)
// ============================================
export const markAsReadSchema = z.object({
  isRead: z.boolean({
    error: 'isRead doit être un booléen',
  }),
});

export type MarkAsReadData = z.infer<typeof markAsReadSchema>;

export const validateMarkAsRead = (data: unknown) => {
  return markAsReadSchema.safeParse(data);
};

// ============================================
// MARK ALL AS READ VALIDATOR (admin)
// ============================================
export const markAllAsReadSchema = z.object({
  // Aucun paramètre requis
});

export type MarkAllAsReadData = z.infer<typeof markAllAsReadSchema>;

export const validateMarkAllAsRead = (data: unknown) => {
  return markAllAsReadSchema.safeParse(data);
};
