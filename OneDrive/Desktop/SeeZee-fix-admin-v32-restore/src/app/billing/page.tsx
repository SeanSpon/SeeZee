import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

/**
 * Global billing route that redirects to the appropriate billing page
 * based on the user's role
 */
export default async function BillingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // For now, redirect all users to client settings billing tab
  // In the future, you might want separate billing pages for different roles
  redirect("/client/settings?tab=billing");
}


