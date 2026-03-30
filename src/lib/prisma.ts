import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Import dynamique pour éviter les erreurs en production
const { PrismaClient } = require('@prisma/client');

declare global {
  var prisma: any;
}

// Créer le pool de connexions PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Créer l'adapter
const adapter = new PrismaPg(pool);

// Créer le client avec l'adapter
export const prisma = global.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;