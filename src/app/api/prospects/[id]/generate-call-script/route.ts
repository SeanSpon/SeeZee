import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";

// Simple call script generator
function generateCallScript(data: any) {
  const script = `Hi, this is [Your Name] from SeeZee Studios. 

I noticed ${data.company || data.name} ${data.city ? `in ${data.city}` : ''} and wanted to reach out about your website.

${data.hasWebsite ? 
  `I took a look at your current site and noticed some opportunities for improvement.` : 
  `I noticed you don't currently have a website. In today's digital world, having a strong online presence is crucial.`
}

SeeZee Studios specializes in affordable, modern websites${data.category?.toLowerCase().includes('nonprofit') || data.category?.toLowerCase().includes('501') ? `, especially for nonprofits like yours. We actually offer a 40% discount for 501(c)(3) organizations` : ''}.

${data.opportunities ? `\nI noticed: ${data.opportunities}` : ''}

Would you have 10 minutes this week to discuss how we could help grow your online presence?`;

  return { script, error: null };
}

/**
 * POST /api/prospects/[id]/generate-call-script
 * Generate AI-powered cold call script for a prospect
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
    if (!allowedRoles.includes(user.role as any)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Fetch prospect
    const prospect = await prisma.prospect.findUnique({
      where: { id },
    });

    if (!prospect) {
      return NextResponse.json(
        { success: false, error: "Prospect not found" },
        { status: 404 }
      );
    }

    // Generate call script using AI
    const result = await generateCallScript({
      name: prospect.name,
      company: prospect.company || prospect.name,
      category: prospect.category || undefined,
      city: prospect.city || undefined,
      state: prospect.state || undefined,
      websiteUrl: prospect.websiteUrl || undefined,
      hasWebsite: prospect.hasWebsite,
      leadScore: prospect.leadScore,
      googleRating: prospect.googleRating || undefined,
      googleReviews: prospect.googleReviews || undefined,
      opportunities: prospect.opportunities || undefined,
      redFlags: prospect.redFlags || undefined,
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Save the script to the prospect record
    await prisma.prospect.update({
      where: { id },
      data: {
        callScript: result.script,
      },
    });

    return NextResponse.json({
      success: true,
      script: result.script,
    });
  } catch (error: any) {
    console.error("Error generating call script:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate call script" },
      { status: 500 }
    );
  }
}
