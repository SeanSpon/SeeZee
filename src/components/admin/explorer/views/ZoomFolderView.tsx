"use client";

import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useNavigation } from "@/providers/NavigationProvider";
import type { NavGroup } from "@/lib/admin/nav-data";

interface ZoomFolderViewProps {
  group: NavGroup;
}

export function ZoomFolderView({ group }: ZoomFolderViewProps) {
  const router = useRouter();
  const { setOpenFolderId } = useNavigation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Back button */}
      <button
        onClick={() => setOpenFolderId(null)}
        className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to folders
      </button>

      {/* Folder header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${group.folderColor}20` }}
        >
          <group.icon className="h-5 w-5" style={{ color: group.folderColor }} />
        </div>
        <h2 className="text-xl font-bold text-white">{group.title}</h2>
      </div>

      {/* Page items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {group.items.map((item, index) => (
          <motion.button
            key={item.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(item.href)}
            className="group flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left transition-all hover:border-slate-700 hover:bg-slate-800/50"
          >
            <div
              className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${group.folderColor}15` }}
            >
              <item.icon className="h-4 w-4" style={{ color: group.folderColor }} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white text-sm">{item.label}</p>
              {item.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
