"use client";

import { motion } from "framer-motion";
import { FiFolder } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useNavigation } from "@/providers/NavigationProvider";
import type { NavGroup } from "@/lib/admin/nav-data";

interface FolderGridProps {
  groups: NavGroup[];
}

export function FolderGrid({ groups }: FolderGridProps) {
  const router = useRouter();
  const { folderClickMode, setOpenFolderId } = useNavigation();

  const handleFolderClick = (group: NavGroup) => {
    if (folderClickMode === "zoom") {
      setOpenFolderId(group.id);
    } else {
      // list or tabs — navigate to first page
      router.push(group.items[0].href);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {groups.map((group, index) => (
        <motion.button
          key={group.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleFolderClick(group)}
          className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-black/20"
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${group.folderColor}15` }}
          >
            <FiFolder className="h-8 w-8" style={{ color: group.folderColor }} />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{group.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {group.items.length} {group.items.length === 1 ? "page" : "pages"}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
