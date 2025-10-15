/**
 * Training Modules with XP tracking
 */

import { getLearningResources } from "@/server/actions";
import { TrainingClient } from "@/components/admin/TrainingClient";

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const result = await getLearningResources({ category: "TRAINING" });
  const resources = result.success ? result.resources : [];

  return <TrainingClient resources={resources} />;
}


