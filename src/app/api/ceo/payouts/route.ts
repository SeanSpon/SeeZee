import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCEO, getSession } from "@/server/http";
import { z } from "zod";

const processPayoutSchema = z.object({
  payoutId: z.string().min(1, "Payout ID is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  stripePayoutId: z.string().optional(),
});

/**
 * GET /api/ceo/payouts
 * CEO-only: Get all payouts (filtered by status)
 */
export const GET = withCEO(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // AWAITING_CLIENT_PAYMENT, READY, PAID
    const projectId = searchParams.get("projectId");

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (projectId) {
      where.task = {
        projectId,
      };
    }

    // TODO: Add TaskPayout model to Prisma schema
    // const payouts = await prisma.taskPayout.findMany({
    const payouts: any[] = []; // Temporary fix until TaskPayout model is added
    /* await prisma.taskPayout.findMany({
      where,
      include: {
        task: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                budget: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }); */

    return NextResponse.json({ success: true, payouts }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/ceo/payouts]", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/ceo/payouts
 * CEO-only: Process a payout (manual)
 */
export const POST = withCEO(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = processPayoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { payoutId, paymentMethod, stripePayoutId } = parsed.data;

    // Get the payout
    // TODO: Add TaskPayout model to Prisma schema
    const payout: any = null; // Temporary fix until TaskPayout model is added
    /* const payout = await prisma.taskPayout.findUnique({
      where: { id: payoutId },
      include: {
        task: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }); */

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    if (payout.status !== "READY") {
      return NextResponse.json(
        { error: "Payout is not ready to be processed" },
        { status: 400 }
      );
    }

    // Update payout
    // TODO: Add TaskPayout model to Prisma schema
    const updatedPayout: any = null; // Temporary fix until TaskPayout model is added
    /* const updatedPayout = await prisma.taskPayout.update({
      where: { id: payoutId },
      data: {
        status: "PAID",
        payoutDate: new Date(),
        paymentMethod,
        stripePayoutId: stripePayoutId || null,
      },
      include: {
        task: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }); */

    // Create notification for the worker
    // TODO: Re-enable when TaskPayout model is added
    /*
    await prisma.notification.create({
      data: {
        userId: payout.userId,
        title: "Payout Processed",
        message: `Your payout of $${payout.amount} for "${payout.task.title}" has been processed.`,
        type: "SUCCESS",
      },
    });

    // Log the payout
    await prisma.systemLog.create({
      data: {
        entityType: "TaskPayout",
        entityId: payout.id,
        action: "PAID",
        userId: session.user.id!,
        metadata: {
          payoutId: payout.id,
          amount: payout.amount.toString(),
          paymentMethod,
          stripePayoutId,
        },
        message: `Payout of $${payout.amount} processed for ${payout.user.name || payout.user.email}`,
      },
    });
    */

    return NextResponse.json(
      { success: true, payout: updatedPayout },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/ceo/payouts]", error);
    return NextResponse.json(
      { error: "Failed to process payout" },
      { status: 500 }
    );
  }
});

