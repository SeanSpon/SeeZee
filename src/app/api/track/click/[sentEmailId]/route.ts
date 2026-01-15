/**
 * Email Click Tracking Endpoint
 * 
 * When a link in an email is clicked, this endpoint records the click
 * and redirects to the original URL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sentEmailId: string }> }
) {
  const { sentEmailId } = await params;
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // Find the sent email
    const sentEmail = await prisma.sentEmail.findUnique({
      where: { id: sentEmailId },
    });

    if (sentEmail) {
      // Update email status to CLICKED (only if not already clicked)
      if (!sentEmail.clickedAt) {
        await prisma.sentEmail.update({
          where: { id: sentEmailId },
          data: {
            status: 'CLICKED',
            clickedAt: new Date(),
          },
        });

        // Also update prospect
        await prisma.prospect.update({
          where: { id: sentEmail.prospectId },
          data: {
            emailOpenedAt: sentEmail.openedAt || new Date(), // Clicking implies opening
          },
        });

        // Log activity (EMAIL_OPENED used for click tracking as well)
        await prisma.prospectActivity.create({
          data: {
            prospectId: sentEmail.prospectId,
            type: 'EMAIL_OPENED',
            description: `Clicked link in email: "${sentEmail.subject}"`,
            metadata: {
              sentEmailId: sentEmail.id,
              clickedUrl: url,
            },
          },
        });
      }
    }

    // Redirect to original URL
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Error tracking email click:', error);
    
    // Redirect to URL anyway
    return NextResponse.redirect(url);
  }
}
