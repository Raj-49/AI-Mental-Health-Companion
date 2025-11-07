/**
 * Server Entry Point
 * 
 * This module loads environment variables, imports the Express app,
 * and starts the HTTP server on the specified port.
 */

import dotenv from 'dotenv';
import app from './app.js';
import prisma from './config/prismaClient.js';
import { initializeEmailAgent } from './jobs/emailAgent.js';

// Load environment variables from .env file
dotenv.config();

// Get port from environment or use default
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connected successfully');

    // Initialize email agent for weekly summaries
    if (NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
      initializeEmailAgent();
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Server running in ${NODE_ENV} mode`);
      console.log(`📡 Listening on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if not running on Vercel serverless
if (NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  startServer();
} else {
  // On Vercel, just ensure database connection
  prisma.$connect()
    .then(() => console.log('✓ Database connected (Vercel serverless mode)'))
    .catch((error) => console.error('❌ Database connection failed:', error));
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log
  if (NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('⚠️  Uncaught Exception:', error);
  process.exit(1);
});

// Export app for Vercel serverless functions
export default app;