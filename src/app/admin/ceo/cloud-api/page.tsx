import { AIManagerClient } from "@/components/admin/ai-manager/AIManagerClient";

export const metadata = {
  title: "Cloud / API SDK | CEO",
  description:
    "CEO-only cloud integrations, Clawd bot API keys, and SDK management",
};

export const dynamic = "force-dynamic";

export default function CEOCloudAPIPage() {
  // Auth is enforced by /admin/ceo/layout.tsx (CEO-only)
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <AIManagerClient />
    </div>
  );
}
