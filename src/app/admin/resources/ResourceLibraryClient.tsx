"use client";

import { useState, useCallback, useTransition } from "react";
import {
  ExternalLink,
  Grid3x3,
  List,
  Search,
  Plus,
  Trash2,
  FileText,
  Tag,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { linkDriveDocument, unlinkDriveDocument } from "@/server/actions/drive";

type DriveDocCategory =
  | "CONTRACT"
  | "PROPOSAL"
  | "DESIGN"
  | "INVOICE"
  | "LEGAL"
  | "MEETING_NOTES"
  | "CLIENT_ASSETS"
  | "OTHER";

interface DriveDocument {
  id: string;
  driveFileId: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink: string | null;
  thumbnailLink: string | null;
  category: DriveDocCategory;
  tags: string[];
  notes: string | null;
  projectId: string | null;
  createdAt: Date | string;
  project?: {
    id: string;
    name: string;
  } | null;
}

interface ResourceLibraryClientProps {
  documents: DriveDocument[];
}

const CATEGORIES: { value: DriveDocCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "CONTRACT", label: "Contract" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "DESIGN", label: "Design" },
  { value: "INVOICE", label: "Invoice" },
  { value: "LEGAL", label: "Legal" },
  { value: "MEETING_NOTES", label: "Meeting Notes" },
  { value: "CLIENT_ASSETS", label: "Client Assets" },
  { value: "OTHER", label: "Other" },
];

const CATEGORY_COLORS: Record<DriveDocCategory, { bg: string; text: string }> = {
  CONTRACT: { bg: "bg-blue-500/20", text: "text-blue-400" },
  PROPOSAL: { bg: "bg-purple-500/20", text: "text-purple-400" },
  DESIGN: { bg: "bg-pink-500/20", text: "text-pink-400" },
  INVOICE: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  LEGAL: { bg: "bg-amber-500/20", text: "text-amber-400" },
  MEETING_NOTES: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  CLIENT_ASSETS: { bg: "bg-orange-500/20", text: "text-orange-400" },
  OTHER: { bg: "bg-slate-500/20", text: "text-slate-400" },
};

export function ResourceLibraryClient({ documents }: ResourceLibraryClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DriveDocCategory | "">("");
  const [isPending, startTransition] = useTransition();
  const [pickerCategory, setPickerCategory] = useState<DriveDocCategory>("OTHER");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [pendingPickerFile, setPendingPickerFile] = useState<any>(null);

  // Filter documents client-side for instant feedback
  const filtered = documents.filter((doc) => {
    if (categoryFilter && doc.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !doc.name.toLowerCase().includes(q) &&
        !(doc.notes || "").toLowerCase().includes(q) &&
        !doc.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    return true;
  });

  const openGooglePicker = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/drive/picker-token");
      if (!res.ok) throw new Error("Failed to get picker token");
      const { accessToken, developerKey } = await res.json();

      // Load the Google API script dynamically
      await new Promise<void>((resolve, reject) => {
        if ((window as any).google?.picker) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => {
          (window as any).gapi.load("picker", () => resolve());
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const google = (window as any).google;
      const picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.DOCS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(developerKey)
        .setCallback((data: any) => {
          if (data.action === google.picker.Action.PICKED) {
            const file = data.docs[0];
            // Store file and show category picker
            setPendingPickerFile({
              driveFileId: file.id,
              name: file.name,
              mimeType: file.mimeType,
              webViewLink: file.url,
              iconLink: file.iconUrl || null,
              thumbnailLink: file.thumbnails?.[0]?.url || null,
            });
            setShowCategoryPicker(true);
          }
        })
        .setTitle("Select a document to link")
        .build();

      picker.setVisible(true);
    } catch (error) {
      console.error("Google Picker error:", error);
      alert("Failed to open Google Drive picker. Make sure you have a linked Google account.");
    }
  }, []);

  const confirmLinkDocument = useCallback(() => {
    if (!pendingPickerFile) return;

    startTransition(async () => {
      const result = await linkDriveDocument({
        ...pendingPickerFile,
        category: pickerCategory,
      });

      if (!result.success) {
        alert(result.error || "Failed to link document");
      }

      setPendingPickerFile(null);
      setShowCategoryPicker(false);
      setPickerCategory("OTHER");
    });
  }, [pendingPickerFile, pickerCategory]);

  const handleUnlink = useCallback((id: string, name: string) => {
    if (!confirm(`Unlink "${name}" from resources?`)) return;

    startTransition(async () => {
      const result = await unlinkDriveDocument(id);
      if (!result.success) {
        alert(result.error || "Failed to unlink document");
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10"
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as DriveDocCategory | "")}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value} className="bg-slate-900 text-white">
              {cat.label}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
            }`}
            aria-label="Grid view"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
            }`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Link Document button */}
        <button
          onClick={openGooglePicker}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-[#ef4444]/20"
        >
          <Plus className="w-4 h-4" />
          Link Document
        </button>
      </div>

      {/* Category picker modal */}
      <AnimatePresence>
        {showCategoryPicker && pendingPickerFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowCategoryPicker(false);
              setPendingPickerFile(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-1">Link Document</h3>
              <p className="text-sm text-white/50 mb-4">
                Choose a category for "{pendingPickerFile.name}"
              </p>

              <label className="block text-xs text-white/60 uppercase tracking-wide mb-2">
                Category
              </label>
              <select
                value={pickerCategory}
                onChange={(e) => setPickerCategory(e.target.value as DriveDocCategory)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 appearance-none cursor-pointer mb-6"
              >
                {CATEGORIES.filter((c) => c.value !== "").map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-slate-900 text-white">
                    {cat.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCategoryPicker(false);
                    setPendingPickerFile(null);
                  }}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLinkDocument}
                  disabled={isPending}
                  className="px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  {isPending ? "Linking..." : "Link"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document count */}
      <p className="text-xs text-white/40">
        {filtered.length} document{filtered.length !== 1 ? "s" : ""}
        {categoryFilter && ` in ${CATEGORIES.find((c) => c.value === categoryFilter)?.label}`}
      </p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm mb-2">
            {documents.length === 0
              ? "No documents linked yet"
              : "No documents match your filters"}
          </p>
          {documents.length === 0 && (
            <p className="text-white/30 text-xs">
              Click "Link Document" to connect files from Google Drive.
            </p>
          )}
        </div>
      )}

      {/* Grid view */}
      {filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc, idx) => {
            const catColors = CATEGORY_COLORS[doc.category];
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all"
              >
                {/* Icon / Thumbnail */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {doc.iconLink ? (
                      <img src={doc.iconLink} alt="" className="w-6 h-6" />
                    ) : (
                      <FileText className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate" title={doc.name}>
                      {doc.name}
                    </h3>
                    <p className="text-xs text-white/40 truncate">{doc.mimeType}</p>
                  </div>
                </div>

                {/* Category badge */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${catColors.bg} ${catColors.text}`}
                  >
                    {doc.category.replace("_", " ")}
                  </span>
                  {doc.project && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60">
                      {doc.project.name}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {doc.tags.length > 0 && (
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    {doc.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/50"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="text-[10px] text-white/30">+{doc.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <a
                    href={doc.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#ef4444] hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in Drive
                  </a>
                  <button
                    onClick={() => handleUnlink(doc.id, doc.name)}
                    disabled={isPending}
                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Unlink document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {filtered.length > 0 && viewMode === "list" && (
        <div className="space-y-2">
          {filtered.map((doc, idx) => {
            const catColors = CATEGORY_COLORS[doc.category];
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="group flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all"
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  {doc.iconLink ? (
                    <img src={doc.iconLink} alt="" className="w-5 h-5" />
                  ) : (
                    <FileText className="w-4 h-4 text-white/40" />
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{doc.name}</p>
                  <p className="text-xs text-white/40">
                    {doc.project ? doc.project.name : "No project"}
                    {" · "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Category */}
                <span
                  className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${catColors.bg} ${catColors.text} flex-shrink-0`}
                >
                  {doc.category.replace("_", " ")}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={doc.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-white/40 hover:text-[#ef4444] transition-colors"
                    title="Open in Drive"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleUnlink(doc.id, doc.name)}
                    disabled={isPending}
                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Unlink document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
