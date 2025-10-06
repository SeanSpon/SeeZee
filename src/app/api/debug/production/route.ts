import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';

export async function GET() {
  try {
    // Check what data exists in production
    const [userCount, leadCount, projectCount] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
      prisma.project.count(),
    ]);

    // Get recent users (without sensitive data)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            accounts: true,
            sessions: true,
          }
        }
      }
    });

    // Get recent leads
    const recentLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      status: 'success',
      environment: 'production',
      database: {
        connected: true,
        counts: {
          users: userCount,
          leads: leadCount,
          projects: projectCount,
        },
        data: {
          recentUsers,
          recentLeads,
        }
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Production database check error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      database: { connected: false }
    }, { status: 500 });
  }
}