// ./src/lib/prisma.ts
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Global declaration for development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a function to get the Prisma client
const getPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  // Configure connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false, // Désactiver complètement SSL
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Create adapter
  const adapter = new PrismaPg(pool);

  // Return client with adapter
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Use global variable only in development to prevent too many connections
const prismaClient = process.env.NODE_ENV === 'production' 
  ? getPrismaClient()
  : (global.prisma ?? getPrismaClient());

export const prisma = prismaClient;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaClient;
}