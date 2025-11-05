/**
 * Prisma Client Configuration
 * 
 * This module exports a single PrismaClient instance to be used across the application.
 * It includes graceful shutdown handlers for SIGINT and SIGTERM signals to ensure
 * database connections are properly closed before the process exits.
 */

import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client with logging in development
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown handler for SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  console.log('\n[Prisma] SIGINT received. Closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

// Graceful shutdown handler for SIGTERM (termination signal)
process.on('SIGTERM', async () => {
  console.log('\n[Prisma] SIGTERM received. Closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
