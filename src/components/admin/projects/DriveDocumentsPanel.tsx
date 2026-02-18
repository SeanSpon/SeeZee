"use client";

import { useState, useCallback, useTransition } from "react";
import {
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  FolderOpen,
} from "lucide-react";
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
}

interface DriveDocumentsPanelProps {
  projectId: string;
  documents: DriveDocument[];
}

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

const CATEGORIES: { value: DriveDocCategory; label: string }[] = [
  { value: "CONTRACT", label: "Contract" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "DESIGN", label: "Design" },
  { value: "INVOICE", label: "Invoice" },
  { value: "LEGAL", label: "Legal" },
  { value: "MEETING_NOTES", label: "Meeting Notes" },
  { value: "CLIENT_ASSETS", label: "Client Assets" },
  { value: "OTHER", label: "Other" },
];

export function DriveDocumentsPanel({ projectId, documents }: DriveDocumentsPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [pickerCategory, setPickerCategory] = useState<DriveDocCategory>("OTHER");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [pendingPickerFile, setPendingPickerFile] = useState<any>(null);

  const openGooglePicker = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/drive/picker-token");
      if (!res.ok) throw new Error("Failed to get picker token");
      const { accessToken, developerKey } = await res.json();

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
        projectId,
      });

      if (!result.success) {
        alert(result.error || "Failed to link document");
      }

      setPendingPickerFile(null);
      setShowCategoryPicker(false);
      setPickerCategory("OTHER");
    });
  }, [pendingPickerFile, pickerCategory, projectId]);

  const handleUnlink = useCallback((id: string, name: string) => {
    if (!confirm(`Unlink "${name}" from this project?`)) return;

    startTransition(async () => {
      const result = await unlinkDriveDocument(id);
      if (!result.success) {
        alert(result.error || "Failed to unlink document");
      }
    });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
          Documents ({documents.length})
        </h3>
        <button
          onClick={openGooglePicker}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" />
          Link Document
        </button>
      </div>

      {/* Category picker modal */}
      {showCategoryPicker && pendingPickerFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setShowCategoryPicker(false);
            setPendingPickerFile(null);
          }}
        >
          <div
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
              {CATEGORIES.map((cat) => (
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
          </div>
        </div>
      )}

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="py-8 text-center bg-white/5 rounded-lg border border-white/10">
          <FolderOpen className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-white/40 text-sm">No documents linked.</p>
          <p className="text-white/30 text-xs mt-1">Link files from Google Drive.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const catColors = CATEGORY_COLORS[doc.category];
            return (
              <div
                key={doc.id}
                className="group flex items-center gap-3 p-2.5 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all"
              >
                <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                  {doc.iconLink ? (
                    <img src={doc.iconLink} alt="" className="w-4 h-4" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-white/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{doc.name}</p>
                </div>
                <span
                  className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${catColors.bg} ${catColors.text} flex-shrink-0`}
                >
                  {doc.category.replace("_", " ")}
                </span>
                <a
                  href={doc.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-white/40 hover:text-[#ef4444] transition-colors flex-shrink-0"
                  title="Open in Drive"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleUnlink(doc.id, doc.name)}
                  disabled={isPending}
                  className="p-1 text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="Unlink"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
