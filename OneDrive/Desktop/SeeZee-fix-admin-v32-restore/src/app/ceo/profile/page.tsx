/**
 * CEO Profile Page
 */

import { getMyProfile } from "@/server/actions/profile";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CEOProfilePage() {
  const result = await getMyProfile();

  if (!result.success || !result.user) {
    redirect("/");
  }

  return <ProfileClient user={result.user} />;
}
