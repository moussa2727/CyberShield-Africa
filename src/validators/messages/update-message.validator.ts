import { z } from 'zod';

// ============================================
// UPDATE MESSAGE VALIDATOR (admin)
// ============================================
export const updateMessageSchema = z.object({
  // ✅ ID du message à mettre à jour
  id: z.string().uuid('ID de message invalide'),

  // ✅ Statut de lecture
  isRead: z.boolean().optional(),

  // ✅ Réponse admin (optionnelle, peut être null pour effacer)
  adminResponse: z
    .string()
    .min(10, 'La réponse doit contenir au moins 10 caractères')
    .max(2000, 'La réponse ne peut pas dépasser 2000 caractères')
    .optional()
    .nullable()
    .transform((val) => val?.trim()),

  // ✅ Date de réponse (optionnelle, peut être null)
  respondedAt: z
    .union([z.string().datetime({ message: 'Format de date invalide (ISO 8601)' }), z.null()])
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)), // ✅ Convertir en Date

  // ✅ ID de l'admin qui a répondu (optionnel, peut être null)
  respondedBy: z
    .union([z.string().uuid('ID utilisateur invalide'), z.null()])
    .optional()
    .nullable(),

  // ✅ Timestamp optionnel pour la mise à jour (géré automatiquement par Prisma)
  updatedAt: z
    .union([z.string().datetime({ message: 'Format de date invalide (ISO 8601)' }), z.null()])
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

export type UpdateMessageData = z.infer<typeof updateMessageSchema>;

export const validateUpdateMessage = (data: unknown) => {
  return updateMessageSchema.safeParse(data);
};

export const validateUpdateMessageField = (field: keyof UpdateMessageData, value: unknown) => {
  const fieldSchema = updateMessageSchema.shape[field];
  const result = fieldSchema.safeParse(value);

  if (!result.success) {
    return result.error.issues[0].message;
  }

  return undefined;
};
