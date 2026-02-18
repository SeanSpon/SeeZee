import { getAllDocuments } from "@/server/actions/drive";
import { ResourceLibraryClient } from "./ResourceLibraryClient";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const result = await getAllDocuments();
  const documents = result.success ? result.documents : [];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ef4444]">
          Document Library
        </span>
        <h1 className="text-3xl font-bold text-white">Resources</h1>
        <p className="max-w-2xl text-sm text-white/50">
          Google Drive documents linked across all projects. Link contracts, proposals, designs, and more.
        </p>
      </header>

      <ResourceLibraryClient documents={documents} />
    </div>
  );
}
