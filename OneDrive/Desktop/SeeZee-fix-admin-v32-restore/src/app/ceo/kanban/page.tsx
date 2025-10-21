/**
 * CEO Kanban Board
 * Global organizational task board
 */

"use client";

import { SectionCard } from "@/components/admin/SectionCard";
import { Trello } from "lucide-react";

export default function CEOKanbanPage() {
  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Kanban</h1>
        <p className="admin-page-subtitle">
          Global organizational task board
        </p>
      </div>

      <SectionCard>
        <div className="text-center py-12 text-slate-500">
          <Trello className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Kanban board coming soon</p>
        </div>
      </SectionCard>
    </div>
  );
}
