"use server";

/**
 * Server actions for Payout management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { revalidatePath } from "next/cache";
import { createActivity } from "./activity";
import { Prisma } from "@prisma/client";

/**
 * Get all awaiting payouts
 */
export async function getAwaitingPayouts(projectId?: string) {
  const user = await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    // TODO: Add taskPayout model to Prisma schema
    // const where: any = {
    //   status: "AWAITING_CLIENT_PAYMENT",
    // };

    // if (projectId) {
    //   where.task = {
    //     projectId,
    //   };
    // }

    // const payouts = await db.taskPayout.findMany({
    //   where,
    //   include: {
    //     task: {
    //       include: {
    //         project: {
    //           select: {
    //             id: true,
    //             name: true,
    //             budget: true,
    //           },
    //         },
    //       },
    //     },
    //     user: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //       },
    //     },
    //   },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    // });

    return { success: true, payouts: [] };
  } catch (error) {
    console.error("Failed to fetch awaiting payouts:", error);
    return { success: false, error: "Failed to fetch awaiting payouts", payouts: [] };
  }
}

/**
 * Get ready payouts (client has paid)
 */
export async function getReadyPayouts(projectId?: string) {
  const user = await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    // TODO: Add taskPayout model to Prisma schema
    // const where: any = {
    //   status: "READY",
    // };

    // if (projectId) {
    //   where.task = {
    //     projectId,
    //   };
    // }

    // const payouts = await db.taskPayout.findMany({
    //   where,
    //   include: {
    //     task: {
    //       include: {
    //         project: {
    //           select: {
    //             id: true,
    //             name: true,
    //             budget: true,
    //           },
    //         },
    //       },
    //     },
    //     user: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //       },
    //     },
    //   },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    // });

    return { success: true, payouts: [] };
  } catch (error) {
    console.error("Failed to fetch ready payouts:", error);
    return { success: false, error: "Failed to fetch ready payouts", payouts: [] };
  }
}

/**
 * Process a payout (manual)
 */
export async function processPayout(
  payoutId: string,
  paymentMethod: string,
  stripePayoutId?: string
) {
  const user = await requireRole([ROLE.CEO]);

  try {
    // TODO: Add taskPayout model to Prisma schema
    // const payout = await db.taskPayout.update({
    //   where: { id: payoutId },
    //   data: {
    //     status: "PAID",
    //     payoutDate: new Date(),
    //     paymentMethod,
    //     stripePayoutId: stripePayoutId || null,
    //   },
    //   include: {
    //     task: {
    //       include: {
    //         project: {
    //           select: {
    //             id: true,
    //             name: true,
    //           },
    //         },
    //       },
    //     },
    //     user: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //       },
    //     },
    //   },
    // });

    // // Create activity
    // await createActivity({
    //   type: "SYSTEM_ALERT",
    //   title: "Payout processed",
    //   description: `Payout of $${payout.amount} processed for ${payout.user.name}`,
    //   userId: user.id,
    // });

    revalidatePath("/admin/payouts");
    return { success: true, payout: null };
  } catch (error) {
    console.error("Failed to process payout:", error);
    return { success: false, error: "Failed to process payout" };
  }
}

/**
 * Calculate project payouts when client pays
 * This should be called when a client payment is received
 */
export async function calculateProjectPayouts(projectId: string) {
  try {
    // TODO: Add taskPayout model to Prisma schema
    // Get all awaiting payouts for this project
    // const awaitingPayouts = await db.taskPayout.findMany({
    //   where: {
    //     status: "AWAITING_CLIENT_PAYMENT",
    //     task: {
    //       projectId,
    //     },
    //   },
    //   include: {
    //     task: {
    //       include: {
    //         project: {
    //           select: {
    //             id: true,
    //             name: true,
    //             budget: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    // // Mark all payouts as READY
    // const updatedPayouts = await Promise.all(
    //   awaitingPayouts.map((payout) =>
    //     db.taskPayout.update({
    //       where: { id: payout.id },
    //       data: {
    //         status: "READY",
    //       },
    //     })
    //   )
    // );

    return { success: true, payouts: [] };
  } catch (error) {
    console.error("Failed to calculate project payouts:", error);
    return { success: false, error: "Failed to calculate project payouts" };
  }
}

/**
 * Get payout statistics
 */
export async function getPayoutStats() {
  const user = await requireRole([ROLE.CEO, ROLE.CFO]);

  try {
    // TODO: Add taskPayout model to Prisma schema
    // const [awaiting, ready, paid, totalAmount] = await Promise.all([
    //   db.taskPayout.count({
    //     where: { status: "AWAITING_CLIENT_PAYMENT" },
    //   }),
    //   db.taskPayout.count({
    //     where: { status: "READY" },
    //   }),
    //   db.taskPayout.count({
    //     where: { status: "PAID" },
    //   }),
    //   db.taskPayout.aggregate({
    //     where: { status: "PAID" },
    //     _sum: {
    //       amount: true,
    //     },
    //   }),
    // ]);

    return {
      success: true,
      stats: {
        awaiting: 0,
        ready: 0,
        paid: 0,
        totalAmount: new Prisma.Decimal(0),
      },
    };
  } catch (error) {
    console.error("Failed to fetch payout stats:", error);
    return {
      success: false,
      error: "Failed to fetch payout stats",
      stats: {
        awaiting: 0,
        ready: 0,
        paid: 0,
        totalAmount: new Prisma.Decimal(0),
      },
    };
  }
}

