import { redirect } from "next/navigation";
import { getSession } from "../../../server/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user?.email) redirect("/login");
  return <>{children}</>;
}