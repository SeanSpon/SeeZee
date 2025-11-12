import { redirect } from "next/navigation";

export default async function ClientOverviewPage() {
  // Redirect to /client (main dashboard) to avoid duplicate routes
  redirect("/client");
}
