import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Test database connection on startup (non-blocking)
if (typeof window === 'undefined') {
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connection established');
    })
    .catch((error) => {
      console.error('❌ Failed to connect to database:', error.message);
      console.error('💡 Make sure DATABASE_URL is set correctly in your .env file');
      console.error('💡 Ensure your database server is running');
      
      // Check for common connection issues
      const errorMessage = error.message || String(error);
      if (errorMessage.includes('P1001') || errorMessage.includes("Can't reach database server")) {
        console.error('💡 Database server is not reachable. Check if it\'s running and accessible.');
      } else if (errorMessage.includes('P1000') || errorMessage.includes('authentication')) {
        console.error('💡 Database authentication failed. Check your DATABASE_URL credentials.');
      } else if (errorMessage.includes('ECONNREFUSED')) {
        console.error('💡 Connection refused. Is your database server running?');
      }
    });
}

/**
 * Health check function to verify database connection
 * Used before critical operations like OAuth callbacks
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  error?: string;
  latency?: number;
}> {
  const startTime = Date.now();
  
  try {
    // Use a simple query to check connection health
    // This is faster than $connect() and tests actual query capability
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database health check timeout')), 5000)
      )
    ]);
    
    const latency = Date.now() - startTime;
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for specific error types
    let errorType = 'Unknown database error';
    if (errorMessage.includes('P1001') || errorMessage.includes("Can't reach database server")) {
      errorType = 'Database server unreachable';
    } else if (errorMessage.includes('P1000') || errorMessage.includes('authentication')) {
      errorType = 'Database authentication failed';
    } else if (errorMessage.includes('ECONNREFUSED')) {
      errorType = 'Connection refused';
    } else if (errorMessage.includes('timeout')) {
      errorType = 'Database connection timeout';
    }
    
    return {
      healthy: false,
      error: errorType,
      latency,
    };
  }
}

/**
 * Retry database operation with exponential backoff
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors (e.g., validation errors)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('P2002') || errorMessage.includes('Unique constraint')) {
        throw error; // Don't retry unique constraint violations
      }
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`⚠️ Database operation failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}