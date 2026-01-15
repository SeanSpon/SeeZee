import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// NOTE: BriefQuestionnaire model has been removed from the schema.
// This endpoint is deprecated and should be updated to use ProjectRequest system.
// For now, returning an error to prevent build failures.

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'This endpoint is deprecated. Please use the ProjectRequest system instead.' },
      { status: 410 } // 410 Gone
    );
  } catch (error) {
    console.error('Failed to save brief questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to save questionnaire' },
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

    return NextResponse.json(
      { error: 'This endpoint is deprecated. Please use the ProjectRequest system instead.' },
      { status: 410 } // 410 Gone
    );
  } catch (error) {
    console.error('Failed to fetch brief questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questionnaire' },
      { status: 500 }
    );
  }
}

