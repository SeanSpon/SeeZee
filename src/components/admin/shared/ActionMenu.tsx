"use client";

import { useState, useRef, useEffect } from "react";
import { FiMoreHorizontal, FiEdit2, FiTrash2, FiCopy, FiEye } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export interface ActionMenuItem {
  label: string;
  icon: typeof FiEdit2;
  onClick: () => void;
  variant?: "default" | "danger";
  requiresConfirm?: boolean;
}

interface ActionMenuProps {
  actions: ActionMenuItem[];
}

export function ActionMenu({ actions }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setConfirmAction(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleActionClick = (action: ActionMenuItem) => {
    if (action.requiresConfirm && confirmAction !== action.label) {
      setConfirmAction(action.label);
      return;
    }
    action.onClick();
    setIsOpen(false);
    setConfirmAction(null);
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="rounded-lg border border-gray-700 bg-gray-800/50 p-2 text-gray-400 transition-all hover:border-trinity-red/50 hover:bg-gray-700 hover:text-white"
      >
        <FiMoreHorizontal className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-48 rounded-xl border-2 border-gray-700 glass-effect shadow-large overflow-hidden z-[9999]"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              const isConfirming = confirmAction === action.label;
              const isDanger = action.variant === "danger";

              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick(action);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isConfirming
                      ? "bg-red-500/20 text-red-300"
                      : isDanger
                      ? "text-red-400 hover:bg-red-500/10"
                      : "text-gray-300 hover:bg-white/10"
                  } ${index !== actions.length - 1 ? "border-b border-gray-700/50" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>
                    {isConfirming
                      ? `Confirm ${action.label}?`
                      : action.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// Pre-built action sets for common use cases
export const createDefaultActions = (
  onEdit: () => void,
  onDelete: () => void,
  onView?: () => void
): ActionMenuItem[] => {
  const actions: ActionMenuItem[] = [];

  if (onView) {
    actions.push({
      label: "View Details",
      icon: FiEye,
      onClick: onView,
    });
  }

  actions.push({
    label: "Edit",
    icon: FiEdit2,
    onClick: onEdit,
  });

  actions.push({
    label: "Delete",
    icon: FiTrash2,
    onClick: onDelete,
    variant: "danger",
    requiresConfirm: true,
  });

  return actions;
};

export const createCrudActions = (
  onEdit: () => void,
  onDuplicate: () => void,
  onDelete: () => void
): ActionMenuItem[] => [
  {
    label: "Edit",
    icon: FiEdit2,
    onClick: onEdit,
  },
  {
    label: "Duplicate",
    icon: FiCopy,
    onClick: onDuplicate,
  },
  {
    label: "Delete",
    icon: FiTrash2,
    onClick: onDelete,
    variant: "danger",
    requiresConfirm: true,
  },
];






