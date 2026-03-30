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
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Créer l'adapter
const adapter = new PrismaPg(pool);

// Créer le client avec l'adapter et configuration explicite
export const prisma = global.prisma ?? new PrismaClient({ 
  adapter,
  errorFormat: 'pretty',
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;