/**
 * Email Open Tracking Endpoint
 * 
 * When an email is opened, the tracking pixel makes a GET request to this endpoint.
 * We record the open event in the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  const { trackingId } = await params;

  try {
    // Find the sent email
    const sentEmail = await prisma.sentEmail.findUnique({
      where: { id: trackingId },
    });

    if (!sentEmail) {
      // Return 1x1 transparent GIF anyway
      return new NextResponse(TRANSPARENT_GIF, {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // Update email status to OPENED (only if not already opened)
    if (!sentEmail.openedAt) {
      await prisma.sentEmail.update({
        where: { id: trackingId },
        data: {
          status: 'OPENED',
          openedAt: new Date(),
        },
      });

      // Also update prospect
      await prisma.prospect.update({
        where: { id: sentEmail.prospectId },
        data: {
          emailOpenedAt: new Date(),
        },
      });

      // Log activity
      await prisma.prospectActivity.create({
        data: {
          prospectId: sentEmail.prospectId,
          type: 'EMAIL_OPENED',
          description: `Opened email: "${sentEmail.subject}"`,
          metadata: {
            sentEmailId: sentEmail.id,
            subject: sentEmail.subject,
          },
        },
      });
    }

    // Return 1x1 transparent GIF
    return new NextResponse(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error tracking email open:', error);
    
    // Return 1x1 transparent GIF anyway
    return new NextResponse(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
}

// 1x1 transparent GIF (base64)
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);
