import { AIManagerClient } from "@/components/admin/ai-manager/AIManagerClient";

export const metadata = {
  title: "AI Manager | SeeZee Admin",
  description: "Manage AI integrations, API keys, and connected Clawd bots",
};

export const dynamic = "force-dynamic";

export default function AIManagerPage() {
  // Auth check is handled in layout.tsx to prevent flash
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <AIManagerClient />
    </div>
  );
}
