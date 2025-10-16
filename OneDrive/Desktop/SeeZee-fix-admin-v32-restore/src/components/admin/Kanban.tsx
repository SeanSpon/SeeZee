"use client";

/**
 * Kanban Board component with drag-and-drop
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, Plus } from "lucide-react";

export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
  assignee?: {
    name: string;
    avatar?: string;
  };
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  items: KanbanItem[];
}

interface KanbanProps {
  columns: KanbanColumn[];
  onItemMove?: (itemId: string, fromCol: string, toCol: string) => void;
  onAddItem?: (columnId: string) => void;
  onItemClick?: (item: KanbanItem) => void;
}

export function Kanban({
  columns,
  onItemMove,
  onAddItem,
  onItemClick,
}: KanbanProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80 flex flex-col"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedItem && onItemMove) {
              // Find source column
              const sourceCol = columns.find((col) =>
                col.items.some((item) => item.id === draggedItem)
              );
              if (sourceCol && sourceCol.id !== column.id) {
                onItemMove(draggedItem, sourceCol.id, column.id);
              }
            }
            setDraggedItem(null);
          }}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-3 px-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${column.color}`}
              />
              <h3 className="font-semibold text-white text-sm">
                {column.title}
              </h3>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                {column.items.length}
              </span>
            </div>

            {onAddItem && (
              <button
                onClick={() => onAddItem(column.id)}
                className="
                  w-6 h-6 rounded-md
                  bg-slate-800 hover:bg-slate-700
                  text-slate-400 hover:text-slate-300
                  flex items-center justify-center
                  transition-all
                "
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Column Items */}
          <div className="flex-1 space-y-2 min-h-[200px]">
            {column.items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                draggable
                onDragStart={() => setDraggedItem(item.id)}
                onDragEnd={() => setDraggedItem(null)}
                onClick={() => onItemClick?.(item)}
                className={`
                  group relative p-4 rounded-lg
                  bg-slate-900/60 border border-white/5
                  hover:bg-slate-900/80 hover:border-white/10
                  hover:shadow-lg
                  transition-all duration-200
                  cursor-pointer
                  ${draggedItem === item.id ? "opacity-50" : ""}
                `}
              >
                {/* Drag handle */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-3 h-3 text-slate-500" />
                </div>

                {/* Content */}
                <div className="pl-4">
                  <h4 className="text-sm font-medium text-white mb-1">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Labels */}
                  {item.labels && item.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.labels.map((label) => (
                        <span
                          key={label}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Assignee */}
                  {item.assignee && (
                    <div className="flex items-center gap-2 mt-3">
                      {item.assignee.avatar ? (
                        <img
                          src={item.assignee.avatar}
                          alt={item.assignee.name}
                          className="w-5 h-5 rounded-full"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                          {item.assignee.name[0]}
                        </div>
                      )}
                      <span className="text-xs text-slate-500">
                        {item.assignee.name}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
