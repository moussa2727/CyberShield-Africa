import { z } from 'zod';

// ============================================
// DELETE MESSAGE VALIDATOR (admin)
// ============================================
export const deleteMessageSchema = z.object({
  id: z.string().min(1, 'ID de message invalide'),

  permanent: z.boolean().optional().default(false),
});

export type DeleteMessageData = z.infer<typeof deleteMessageSchema>;

export const validateDeleteMessage = (data: unknown) => {
  return deleteMessageSchema.safeParse(data);
};
