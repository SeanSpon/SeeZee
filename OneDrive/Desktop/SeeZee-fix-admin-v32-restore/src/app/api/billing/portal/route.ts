import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

/**
 * POST /api/billing/portal
 * Create a Stripe customer portal session
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId required" },
        { status: 400 }
      );
    }

    // Get project with Stripe customer ID
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          include: {
            members: {
              where: {
                user: { email: session.user.email },
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify user has access
    if (project.organization.members.length === 0 && session.user.role !== "CEO" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!project.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found for this project" },
        { status: 400 }
      );
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: project.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/client/settings?tab=billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[Billing Portal Error]", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
