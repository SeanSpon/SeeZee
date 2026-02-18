"use client";

import { useNavigation } from "@/providers/NavigationProvider";
import { ZoomFolderView } from "./views/ZoomFolderView";
import { ListFolderView } from "./views/ListFolderView";
import { TabsFolderView } from "./views/TabsFolderView";
import type { NavGroup } from "@/lib/admin/nav-data";

interface FolderOpenViewProps {
  group: NavGroup;
  /** Whether we're at the /admin root (zoom mode) vs inside a page (list/tabs mode) */
  isRoot: boolean;
}

export function FolderOpenView({ group, isRoot }: FolderOpenViewProps) {
  const { folderClickMode } = useNavigation();

  // At root with zoom mode — show expanded folder grid
  if (isRoot && folderClickMode === "zoom") {
    return <ZoomFolderView group={group} />;
  }

  // Inside a page — show list or tabs above content
  if (folderClickMode === "tabs") {
    return <TabsFolderView group={group} />;
  }

  return <ListFolderView group={group} />;
}
