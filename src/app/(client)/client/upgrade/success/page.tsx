import { Suspense } from "react";
import { UpgradeSuccessClient } from "@/components/client/UpgradeSuccessClient";

export const dynamic = "force-dynamic";

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>}>
      <UpgradeSuccessClient />
    </Suspense>
  );
}
