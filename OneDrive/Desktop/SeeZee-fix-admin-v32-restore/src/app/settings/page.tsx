import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

/**
 * Global settings route that redirects to the appropriate settings page
 * based on the user's role and context
 */
export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  // Redirect based on role
  // CEO uses admin dashboard, so redirect to admin settings
  if (role === "CEO" || role === "CFO" || role === "FRONTEND" || role === "BACKEND" || role === "OUTREACH") {
    redirect("/admin/settings");
  } else {
    // Default to client settings
    redirect("/client/settings");
  }
}

