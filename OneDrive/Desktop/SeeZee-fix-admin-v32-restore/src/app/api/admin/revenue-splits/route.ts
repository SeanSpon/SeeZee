import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow CEO, CFO, ADMIN roles
    if (!['CEO', 'CFO', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { projectId, totalAmount, businessShare, adminShares, notes } = data;

    // Validate required fields
    if (!projectId || totalAmount === undefined || businessShare === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create revenue split
    const revenueSplit = await prisma.revenueSplit.create({
      data: {
        projectId,
        totalAmount,
        businessShare,
        adminShares,
        notes: notes || null,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ success: true, revenueSplit });
  } catch (error) {
    console.error('Failed to save revenue split:', error);
    return NextResponse.json(
      { error: 'Failed to save revenue split' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow CEO, CFO, ADMIN roles
    if (!['CEO', 'CFO', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (projectId) {
      // Get splits for a specific project
      const splits = await prisma.revenueSplit.findMany({
        where: { projectId },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({ splits });
    } else {
      // Get all splits
      const splits = await prisma.revenueSplit.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          project: {
            select: {
              name: true,
              organization: {
                select: {
                  name: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({ splits });
    }
  } catch (error) {
    console.error('Failed to fetch revenue splits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue splits' },
      { status: 500 }
    );
  }
}

