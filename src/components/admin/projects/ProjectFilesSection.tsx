"use client";

/**
 * Project Files Section
 * Upload and manage project documents, resources, and materials
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/admin/SectionCard";
import {
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Upload,
  Download,
  Trash2,
  Plus,
  ExternalLink,
  Loader2,
  X,
  FolderOpen,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface ProjectFile {
  id: string;
  name: string;
  originalName?: string;
  url: string;
  mimeType?: string;
  size?: number;
  type?: string;
  createdAt: Date | string;
}

interface ProjectFilesSectionProps {
  projectId: string;
  files: ProjectFile[];
  canEdit?: boolean;
}

const fileTypeConfig: Record<string, { icon: any; color: string }> = {
  IMAGE: { icon: ImageIcon, color: "text-green-400 bg-green-500/20 border-green-500/30" },
  VIDEO: { icon: Video, color: "text-purple-400 bg-purple-500/20 border-purple-500/30" },
  DOCUMENT: { icon: FileText, color: "text-blue-400 bg-blue-500/20 border-blue-500/30" },
  OTHER: { icon: File, color: "text-slate-400 bg-slate-500/20 border-slate-500/30" },
};

function getFileType(mimeType?: string): string {
  if (!mimeType) return "OTHER";
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return "DOCUMENT";
  return "OTHER";
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function ProjectFilesSection({
  projectId,
  files: initialFiles,
  canEdit = true,
}: ProjectFilesSectionProps) {
  const router = useRouter();
  const [files, setFiles] = useState(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showUploadArea, setShowUploadArea] = useState(false);

  const handleUploadComplete = async (uploadedFiles: { url: string; name: string; size: number; type: string }[]) => {
    if (!uploadedFiles.length) return;

    // Create file records in the database
    for (const uploadedFile of uploadedFiles) {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: uploadedFile.name,
            url: uploadedFile.url,
            size: uploadedFile.size,
            mimeType: uploadedFile.type,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save file record");
        }

        const data = await response.json();
        setFiles((prev) => [data.file, ...prev]);
      } catch (error) {
        console.error("Error saving file record:", error);
        toast("File uploaded but failed to save record", "error");
      }
    }

    toast(`${uploadedFiles.length} file(s) uploaded successfully`, "success");
    setShowUploadArea(false);
    router.refresh();
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    setDeletingId(fileId);

    try {
      const response = await fetch(
        `/api/admin/projects/${projectId}/files?fileId=${fileId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast("File deleted successfully", "success");
      router.refresh();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast("Failed to delete file", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SectionCard
      title="Project Files & Materials"
      description={`${files.length} file${files.length !== 1 ? "s" : ""} uploaded`}
      action={
        canEdit && (
          <button
            onClick={() => setShowUploadArea(!showUploadArea)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Files
          </button>
        )
      }
    >
      <div className="space-y-4">
        {/* Upload Area */}
        {showUploadArea && canEdit && (
          <div className="p-4 rounded-xl border-2 border-dashed border-white/20 bg-slate-900/40 transition-all hover:border-blue-500/50">
            <div className="flex flex-col items-center justify-center py-4">
              <Upload className="w-8 h-8 text-blue-400 mb-3" />
              <p className="text-white font-medium mb-1">Upload project files</p>
              <p className="text-slate-500 text-sm mb-4">
                Documents, images, videos, and resources
              </p>
              
              <UploadButton<OurFileRouter, "adminProjectFileUploader">
                endpoint="adminProjectFileUploader"
                onClientUploadComplete={(res) => {
                  if (res) {
                    const uploadedFiles = res.map((file) => ({
                      url: file.url,
                      name: file.name,
                      size: file.size,
                      type: file.type || "application/octet-stream",
                    }));
                    handleUploadComplete(uploadedFiles);
                  }
                  setIsUploading(false);
                }}
                onUploadBegin={() => {
                  setIsUploading(true);
                }}
                onUploadError={(error: Error) => {
                  console.error("Upload error:", error);
                  toast(`Upload failed: ${error.message}`, "error");
                  setIsUploading(false);
                }}
                appearance={{
                  button:
                    "px-6 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all ut-uploading:bg-blue-400 ut-uploading:cursor-not-allowed",
                  allowedContent: "text-xs text-slate-500 mt-2",
                }}
                content={{
                  button({ ready, isUploading: uploading }) {
                    if (uploading) {
                      return (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </span>
                      );
                    }
                    return (
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {ready ? "Choose Files" : "Getting ready..."}
                      </span>
                    );
                  },
                  allowedContent() {
                    return "PDF, images, videos up to 64MB";
                  },
                }}
              />

              <button
                onClick={() => setShowUploadArea(false)}
                className="mt-3 text-sm text-slate-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Files List */}
        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file) => {
              const fileType = file.type || getFileType(file.mimeType);
              const config = fileTypeConfig[fileType] || fileTypeConfig.OTHER;
              const Icon = config.icon;

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all group"
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0 border`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.originalName || file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {file.size && <span>{formatFileSize(file.size)}</span>}
                      {file.createdAt && (
                        <>
                          <span>•</span>
                          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
                      title="Open"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={file.url}
                      download={file.originalName || file.name}
                      className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {canEdit && (
                      <button
                        onClick={() => handleDelete(file.id)}
                        disabled={deletingId === file.id}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === file.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm mb-1">No files uploaded yet</p>
            <p className="text-xs text-slate-500">
              Upload documents, images, and resources for this project
            </p>
            {canEdit && !showUploadArea && (
              <button
                onClick={() => setShowUploadArea(true)}
                className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Upload your first file
              </button>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
