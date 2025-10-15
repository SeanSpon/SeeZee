"use client";

/**
 * Leads Table Client Component
 */

import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { updateLeadStatus } from "@/server/actions";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  createdAt: Date;
  organization: { name: string } | null;
};

interface LeadsTableClientProps {
  leads: Lead[];
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CONTACTED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  QUALIFIED: "bg-green-500/20 text-green-400 border-green-500/30",
  PROPOSAL_SENT: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CONVERTED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  LOST: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

export function LeadsTableClient({ leads: initialLeads }: LeadsTableClientProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdating(leadId);
    const result = await updateLeadStatus(leadId, newStatus as any);

    if (result.success) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
    }
    setUpdating(null);
    router.refresh();
  };

  const columns: Column<Lead>[] = [
    { key: "name", label: "Name", sortable: true },
    {
      key: "company",
      label: "Company",
      sortable: true,
      render: (lead) => lead.company || lead.organization?.name || "-",
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", render: (lead) => lead.phone || "-" },
    {
      key: "status",
      label: "Status",
      render: (lead) => (
        <select
          value={lead.status}
          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
          disabled={updating === lead.id}
          className={`
            px-2 py-1 rounded-full text-xs font-medium border
            bg-transparent cursor-pointer
            ${statusColors[lead.status] || statusColors.NEW}
            ${updating === lead.id ? "opacity-50 cursor-wait" : ""}
          `}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (lead) => new Date(lead.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <DataTable
      data={leads}
      columns={columns}
      searchPlaceholder="Search leads by name, email, or company..."
      actions={
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      }
      onRowClick={(lead) => router.push(`/admin/pipeline/leads/${lead.id}`)}
    />
  );
}
