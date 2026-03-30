import { z } from 'zod';

// ============================================
// GET MESSAGE VALIDATOR (admin)
// ============================================
export const getMessageSchema = z.object({
  id: z
    .string()
    .min(1, 'ID de message invalide'),
});

export type GetMessageData = z.infer<typeof getMessageSchema>;

export const validateGetMessage = (data: unknown) => {
  return getMessageSchema.safeParse(data);
};

// ============================================
// GET STATISTICS VALIDATOR (admin)
// ============================================
export const getStatisticsSchema = z.object({
  // Aucun paramètre requis
});

export type GetStatisticsData = z.infer<typeof getStatisticsSchema>;

export const validateGetStatistics = (data: unknown) => {
  return getStatisticsSchema.safeParse(data);
};


// ============================================
// GET UNREAD COUNT VALIDATOR (admin)
// ============================================
export const getUnreadCountSchema = z.object({
  // Aucun paramètre requis
});

export type GetUnreadCountData = z.infer<typeof getUnreadCountSchema>;

export const validateGetUnreadCount = (data: unknown) => {
  return getUnreadCountSchema.safeParse(data);
};


// ============================================
// UNREAD COUNT VALIDATOR (admin)
// ============================================
export const unreadCountSchema = z.object({
  // Aucun paramètre requis pour compter les messages non lus
});

export type UnreadCountData = z.infer<typeof unreadCountSchema>;

export const validateUnreadCount = (data: unknown) => {
  return unreadCountSchema.safeParse(data);
};
