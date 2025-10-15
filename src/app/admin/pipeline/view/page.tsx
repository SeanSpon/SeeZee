/**
 * Pipeline Kanban View
 */

"use client";

import { useState } from "react";
import { Kanban, type KanbanColumn, type KanbanItem } from "@/components/admin/Kanban";

// TODO: Fetch from Prisma
const initialColumns: KanbanColumn[] = [
  {
    id: "leads",
    title: "Leads",
    color: "bg-blue-500",
    items: [
      {
        id: "lead-1",
        title: "CloudTech Solutions",
        description: "E-commerce redesign inquiry",
        labels: ["Web Design", "E-commerce"],
        assignee: { name: "Sean" },
      },
      {
        id: "lead-2",
        title: "RetailCo",
        description: "Mobile app development",
        labels: ["Mobile", "Development"],
        assignee: { name: "Zach" },
      },
    ],
  },
  {
    id: "projects",
    title: "In Progress",
    color: "bg-yellow-500",
    items: [
      {
        id: "proj-1",
        title: "Startup Inc Website",
        description: "Brand identity and website",
        labels: ["Branding", "Web Design"],
        assignee: { name: "Sean" },
      },
      {
        id: "proj-2",
        title: "TechStart Platform",
        description: "SaaS platform development",
        labels: ["Development", "SaaS"],
        assignee: { name: "Zach" },
      },
    ],
  },
  {
    id: "invoices",
    title: "Invoiced",
    color: "bg-green-500",
    items: [
      {
        id: "inv-1",
        title: "Acme Corp - Final Invoice",
        description: "$15,000 - Due March 15",
        labels: ["Paid"],
      },
      {
        id: "inv-2",
        title: "GlobalTech - Milestone 2",
        description: "$8,000 - Due March 20",
        labels: ["Pending"],
      },
    ],
  },
];

export default function PipelineKanbanPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);

  const handleItemMove = (itemId: string, fromCol: string, toCol: string) => {
    // TODO: Persist to database
    console.log(`Move ${itemId} from ${fromCol} to ${toCol}`);
    
    setColumns((prev) => {
      const newColumns = [...prev];
      const sourceCol = newColumns.find((c) => c.id === fromCol);
      const targetCol = newColumns.find((c) => c.id === toCol);
      
      if (!sourceCol || !targetCol) return prev;
      
      const item = sourceCol.items.find((i) => i.id === itemId);
      if (!item) return prev;
      
      sourceCol.items = sourceCol.items.filter((i) => i.id !== itemId);
      targetCol.items.push(item);
      
      return newColumns;
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Drag and drop items between columns to update their status
      </p>
      
      <Kanban
        columns={columns}
        onItemMove={handleItemMove}
        onAddItem={(colId) => console.log("Add item to", colId)}
        onItemClick={(item) => console.log("Open item", item)}
      />
    </div>
  );
}


