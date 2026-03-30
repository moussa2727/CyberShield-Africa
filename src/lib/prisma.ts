// ./src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  var prisma: PrismaClient | undefined;
}

// Only create these in non-production environments or handle gracefully
const getPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  // Create the pool of connections
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Create the adapter
  const adapter = new PrismaPg(pool);

  // Create the client with the adapter
  return new PrismaClient({ 
    adapter,
    errorFormat: 'pretty',
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = global.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}