/**
 * Payout calculation logic
 * Handles calculating worker payouts and revenue splits when client pays
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Calculate project payouts when client pays
 * This should be called when a client payment is received
 */
export async function calculateProjectPayouts(projectId: string) {
  try {
    // TODO: Add taskPayout model to Prisma schema
    // Get all awaiting payouts for this project
    // const awaitingPayouts = await prisma.taskPayout.findMany({
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
    //     prisma.taskPayout.update({
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
 * Calculate revenue split for a project
 * Returns the split amounts for business, owner, and Robards
 */
export async function calculateRevenueSplit(
  projectId: string,
  totalAmount: Prisma.Decimal
) {
  try {
    // TODO: Add projectRevenueSplit model to Prisma schema
    // Get revenue split configuration (or use defaults)
    // let revenueSplit = await prisma.projectRevenueSplit.findUnique({
    //   where: { projectId },
    // });
    
    // Use defaults for now
    let revenueSplit = null;

    // If not configured, use defaults
    if (!revenueSplit) {
      revenueSplit = {
        id: "",
        projectId,
        businessPercent: new Prisma.Decimal(50),
        ownerPercent: new Prisma.Decimal(25),
        robardsPercent: new Prisma.Decimal(25),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Calculate split amounts
    const businessAmount = totalAmount
      .mul(revenueSplit.businessPercent)
      .div(100);
    const ownerAmount = totalAmount.mul(revenueSplit.ownerPercent).div(100);
    const robardsAmount = totalAmount
      .mul(revenueSplit.robardsPercent)
      .div(100);

    return {
      success: true,
      split: {
        business: businessAmount,
        owner: ownerAmount,
        robards: robardsAmount,
        total: totalAmount,
      },
      config: {
        businessPercent: revenueSplit.businessPercent,
        ownerPercent: revenueSplit.ownerPercent,
        robardsPercent: revenueSplit.robardsPercent,
      },
    };
  } catch (error) {
    console.error("Failed to calculate revenue split:", error);
    return {
      success: false,
      error: "Failed to calculate revenue split",
      split: {
        business: new Prisma.Decimal(0),
        owner: new Prisma.Decimal(0),
        robards: new Prisma.Decimal(0),
        total: new Prisma.Decimal(0),
      },
    };
  }
}

/**
 * Get total payouts for a project
 */
export async function getProjectPayoutTotal(projectId: string) {
  try {
    // TODO: Add taskPayout model to Prisma schema
    // const result = await prisma.taskPayout.aggregate({
    //   where: {
    //     task: {
    //       projectId,
    //     },
    //   },
    //   _sum: {
    //     amount: true,
    //   },
    // });

    // return result._sum.amount || new Prisma.Decimal(0);
    return new Prisma.Decimal(0);
  } catch (error) {
    console.error("Failed to get project payout total:", error);
    return new Prisma.Decimal(0);
  }
}

/**
 * Get project financial summary
 * Returns total project amount, payouts, and remaining revenue
 */
export async function getProjectFinancialSummary(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        budget: true,
        invoices: {
          where: {
            status: "PAID",
          },
          select: {
            total: true,
          },
        },
      },
    });

    if (!project) {
      return {
        success: false,
        error: "Project not found",
      };
    }

    // Calculate total paid amount
    const totalPaid = project.invoices.reduce(
      (sum, invoice) => sum.add(invoice.total),
      new Prisma.Decimal(0)
    );

    // Get total payouts
    const totalPayouts = await getProjectPayoutTotal(projectId);

    // Calculate remaining revenue
    const remainingRevenue = totalPaid.sub(totalPayouts);

    // Calculate revenue split
    const revenueSplit = await calculateRevenueSplit(projectId, remainingRevenue);

    return {
      success: true,
      summary: {
        projectBudget: project.budget || new Prisma.Decimal(0),
        totalPaid,
        totalPayouts,
        remainingRevenue,
        revenueSplit: revenueSplit.split,
        revenueSplitConfig: revenueSplit.config,
      },
    };
  } catch (error) {
    console.error("Failed to get project financial summary:", error);
    return {
      success: false,
      error: "Failed to get project financial summary",
    };
  }
}

