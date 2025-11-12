import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try a simple query
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      databaseUrl: process.env.DATABASE_URL 
        ? `${process.env.DATABASE_URL.substring(0, 20)}...` 
        : 'Not set',
      hasQuotes: process.env.DATABASE_URL?.startsWith("'") || process.env.DATABASE_URL?.startsWith('"'),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isConnectionError = errorMessage.includes('P1001') || 
                              errorMessage.includes('connection') ||
                              errorMessage.includes('ECONNREFUSED') ||
                              errorMessage.includes('timeout');
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      isConnectionError,
      databaseUrl: process.env.DATABASE_URL 
        ? `${process.env.DATABASE_URL.substring(0, 20)}...` 
        : 'Not set',
      hasQuotes: process.env.DATABASE_URL?.startsWith("'") || process.env.DATABASE_URL?.startsWith('"'),
      hint: isConnectionError 
        ? 'Check your DATABASE_URL in .env.local - it may have quotes around it or be incorrect'
        : 'Unknown database error',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


