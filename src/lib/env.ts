// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_PASSWORD_RESET_SECRET: z.string().min(32),
  ADMIN_EMAIL: z.string().email(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // Email (Google API / Gmail OAuth)
  EMAIL_USER: z.string().email(),
  GMAIL_CLIENT_ID: z.string().min(1),
  GMAIL_CLIENT_SECRET: z.string().min(1),
  GMAIL_REFRESH_TOKEN: z.string().min(1),

  // Feature flags
  ENABLE_EMAIL_NOTIFICATIONS: z.enum(['true', 'false']).default('false'),
  ENABLE_EXPORT: z.enum(['true', 'false']).default('true'),
  ENABLE_BULK_OPERATIONS: z.enum(['true', 'false']).default('true'),
});

export const env = envSchema.parse(process.env);
