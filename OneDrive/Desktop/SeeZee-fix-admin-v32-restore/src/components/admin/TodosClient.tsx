"use client";

import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { FiCalendar } from "react-icons/fi";

interface TodoRow {
  id: string;
  title: string;
  project: string;
  dueDate: string | null;
  status: string;
}

interface TodosClientProps {
  rows: TodoRow[];
}

export function TodosClient({ rows }: TodosClientProps) {
  const columns: DataTableColumn<TodoRow>[] = [
    {
      header: "Task",
      key: "title",
      render: (todo) => (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{todo.title}</p>
          <p className="text-xs text-gray-400">{todo.project}</p>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (todo) => <StatusBadge status={todo.status} size="sm" />,
    },
    {
      header: "Due",
      key: "dueDate",
      render: (todo) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiCalendar className="h-3.5 w-3.5 text-gray-500" />
          {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : "No due date"}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={rows} emptyMessage="No open todos" />;
}



