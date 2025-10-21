/**
 * Training Modules with XP tracking
 */

import { AdminTrainingClient } from "@/components/admin/AdminTrainingClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  // Fetch trainings directly from database
  const trainings = await prisma.training.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignments: {
        include: {
          completions: {
            select: {
              status: true,
            },
          },
        },
      },
    },
  });

  // Calculate stats for each training
  const trainingsWithStats = trainings.map((training) => {
    const totalAssigned = training.assignments.reduce(
      (acc, assignment) => acc + assignment.completions.length,
      0
    );
    const completed = training.assignments.reduce(
      (acc, assignment) =>
        acc +
        assignment.completions.filter((c) => c.status === "COMPLETE").length,
      0
    );
    const inProgress = training.assignments.reduce(
      (acc, assignment) =>
        acc +
        assignment.completions.filter((c) => c.status === "IN_PROGRESS")
          .length,
      0
    );

    // Remove assignments from response to keep it clean
    const { assignments, ...trainingData } = training;

    return {
      ...trainingData,
      stats: {
        totalAssigned,
        completed,
        inProgress,
        notStarted: totalAssigned - completed - inProgress,
      },
    };
  });

  return <AdminTrainingClient trainings={trainingsWithStats} />;
}


