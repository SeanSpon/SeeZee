"use client";

/**
 * Task Materials Section Component
 * Displays and manages learning materials, resources, PDFs, and assignments for a task
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/admin/SectionCard";
import {
  FileText,
  Link2,
  Video,
  Image as ImageIcon,
  BookOpen,
  ClipboardList,
  Plus,
  Download,
  ExternalLink,
  Trash2,
  Edit2,
  X,
  Upload,
  Calendar,
  CheckCircle,
  AlertCircle,
  File,
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

type TaskMaterial = {
  id: string;
  todoId: string;
  title: string;
  description: string | null;
  type: string;
  fileUrl: string | null;
  linkUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  dueDate: Date | null;
  isRequired: boolean;
  order: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
};

interface TaskMaterialsSectionProps {
  taskId: string;
  materials: TaskMaterial[];
  canEdit: boolean;
}

const materialTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
  PDF: { icon: FileText, color: "text-red-400 bg-red-500/20 border-red-500/30", label: "PDF Document" },
  DOCUMENT: { icon: File, color: "text-blue-400 bg-blue-500/20 border-blue-500/30", label: "Document" },
  VIDEO: { icon: Video, color: "text-purple-400 bg-purple-500/20 border-purple-500/30", label: "Video" },
  IMAGE: { icon: ImageIcon, color: "text-green-400 bg-green-500/20 border-green-500/30", label: "Image" },
  LINK: { icon: Link2, color: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30", label: "External Link" },
  ASSIGNMENT: { icon: ClipboardList, color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30", label: "Assignment" },
  RESOURCE: { icon: BookOpen, color: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30", label: "Resource" },
};

const materialTypes = [
  { value: "PDF", label: "PDF Document" },
  { value: "DOCUMENT", label: "Document" },
  { value: "VIDEO", label: "Video" },
  { value: "IMAGE", label: "Image" },
  { value: "LINK", label: "External Link" },
  { value: "ASSIGNMENT", label: "Assignment" },
  { value: "RESOURCE", label: "Resource" },
];

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function TaskMaterialsSection({
  taskId,
  materials: initialMaterials,
  canEdit,
}: TaskMaterialsSectionProps) {
  const router = useRouter();
  const [materials, setMaterials] = useState(initialMaterials);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<TaskMaterial | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
    size: number;
    type: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "PDF" as string,
    linkUrl: "",
    dueDate: "",
    isRequired: false,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "PDF",
      linkUrl: "",
      dueDate: "",
      isRequired: false,
    });
    setUploadedFile(null);
    setEditingMaterial(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (material: TaskMaterial) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description || "",
      type: material.type,
      linkUrl: material.linkUrl || "",
      dueDate: material.dueDate ? format(new Date(material.dueDate), "yyyy-MM-dd'T'HH:mm") : "",
      isRequired: material.isRequired,
    });
    if (material.fileUrl) {
      setUploadedFile({
        url: material.fileUrl,
        name: material.fileName || "File",
        size: material.fileSize || 0,
        type: material.mimeType || "",
      });
    }
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast("Title is required", "error");
      return;
    }

    // For link types, require a URL
    if (formData.type === "LINK" && !formData.linkUrl.trim()) {
      toast("URL is required for links", "error");
      return;
    }

    // For file types without a link, require an uploaded file
    if (["PDF", "DOCUMENT", "VIDEO", "IMAGE"].includes(formData.type) && !uploadedFile && !formData.linkUrl) {
      toast("Please upload a file or provide a URL", "error");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        linkUrl: formData.linkUrl || null,
        fileUrl: uploadedFile?.url || null,
        fileName: uploadedFile?.name || null,
        fileSize: uploadedFile?.size || null,
        mimeType: uploadedFile?.type || null,
        dueDate: formData.dueDate || null,
        isRequired: formData.isRequired,
      };

      let response;
      
      if (editingMaterial) {
        // Update existing material
        response = await fetch(`/api/admin/tasks/${taskId}/materials`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            materialId: editingMaterial.id,
            ...payload,
          }),
        });
      } else {
        // Create new material
        response = await fetch(`/api/admin/tasks/${taskId}/materials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save material");
      }

      const data = await response.json();

      if (editingMaterial) {
        setMaterials((prev) =>
          prev.map((m) => (m.id === editingMaterial.id ? data.material : m))
        );
        toast("Material updated successfully", "success");
      } else {
        setMaterials((prev) => [...prev, data.material]);
        toast("Material added successfully", "success");
      }

      setShowAddModal(false);
      resetForm();
      router.refresh();
    } catch (error) {
      console.error("Error saving material:", error);
      toast(error instanceof Error ? error.message : "Failed to save material", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material?")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/tasks/${taskId}/materials?materialId=${materialId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete material");
      }

      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      toast("Material deleted successfully", "success");
      router.refresh();
    } catch (error) {
      console.error("Error deleting material:", error);
      toast("Failed to delete material", "error");
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (material: TaskMaterial) => {
    return material.fileUrl || material.linkUrl;
  };

  const isAssignmentOverdue = (material: TaskMaterial) => {
    if (material.type !== "ASSIGNMENT" || !material.dueDate) return false;
    return new Date(material.dueDate) < new Date();
  };

  return (
    <>
      <SectionCard
        title="Learning Materials & Resources"
        description={`${materials.length} item${materials.length !== 1 ? "s" : ""}`}
        action={
          canEdit && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Material
            </button>
          )
        }
      >
        <div className="space-y-3">
          {materials.length > 0 ? (
            materials.map((material) => {
              const config = materialTypeConfig[material.type] || materialTypeConfig.RESOURCE;
              const Icon = config.icon;
              const url = getFileUrl(material);
              const isOverdue = isAssignmentOverdue(material);

              return (
                <div
                  key={material.id}
                  className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all group"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0 border`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                          {material.title}
                          {material.isRequired && (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs border border-red-500/30">
                              Required
                            </span>
                          )}
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs border border-orange-500/30 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Overdue
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {config.label}
                          {material.fileSize && ` • ${formatFileSize(material.fileSize)}`}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
                            title={material.type === "LINK" ? "Open Link" : "Download"}
                          >
                            {material.type === "LINK" ? (
                              <ExternalLink className="w-4 h-4" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </a>
                        )}
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(material)}
                              className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(material.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {material.description && (
                      <p className="text-sm text-slate-400 mt-2">
                        {material.description}
                      </p>
                    )}

                    {/* Due date for assignments */}
                    {material.type === "ASSIGNMENT" && material.dueDate && (
                      <div className={`flex items-center gap-1 mt-2 text-xs ${isOverdue ? "text-orange-400" : "text-slate-500"}`}>
                        <Calendar className="w-3 h-3" />
                        Due: {format(new Date(material.dueDate), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    )}

                    {/* File info */}
                    {material.fileName && (
                      <p className="text-xs text-slate-500 mt-1">
                        📎 {material.fileName}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No materials or resources yet</p>
              {canEdit && (
                <button
                  onClick={handleOpenAdd}
                  className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Add your first material
                </button>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {editingMaterial ? "Edit Material" : "Add Material"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., FBLA Study Guide"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {materialTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this material..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>

              {/* File Upload (for PDF, DOCUMENT, VIDEO, IMAGE types) */}
              {["PDF", "DOCUMENT", "VIDEO", "IMAGE"].includes(formData.type) && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Upload File
                  </label>
                  {uploadedFile ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/60 border border-white/10">
                      <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(uploadedFile.size)}</p>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <UploadButton<OurFileRouter, "taskMaterialUploader">
                      endpoint="taskMaterialUploader"
                      onClientUploadComplete={(res) => {
                        if (res?.[0]) {
                          setUploadedFile({
                            url: res[0].url,
                            name: res[0].name,
                            size: res[0].size,
                            type: res[0].type || "",
                          });
                          toast("File uploaded successfully", "success");
                        }
                      }}
                      onUploadError={(error: Error) => {
                        console.error("Upload error:", error);
                        toast(`Upload failed: ${error.message}`, "error");
                      }}
                      appearance={{
                        button:
                          "w-full px-4 py-3 rounded-lg bg-slate-800/60 border border-dashed border-white/20 text-slate-400 hover:bg-slate-800 hover:border-blue-500/50 hover:text-blue-400 transition-all ut-uploading:bg-blue-500/10 ut-uploading:border-blue-500/30",
                        allowedContent: "hidden",
                      }}
                      content={{
                        button({ ready, isUploading }) {
                          if (isUploading) {
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
                              {ready ? "Click to upload or drag and drop" : "Getting ready..."}
                            </span>
                          );
                        },
                      }}
                    />
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Or provide a URL below
                  </p>
                </div>
              )}

              {/* URL (for LINK type or as alternative to upload) */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  {formData.type === "LINK" ? "Link URL" : "File URL"}{" "}
                  {formData.type === "LINK" && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder={formData.type === "LINK" ? "https://example.com/resource" : "https://example.com/file.pdf"}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Due Date (for ASSIGNMENT type) */}
              {formData.type === "ASSIGNMENT" && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              )}

              {/* Required checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isRequired: e.target.checked }))}
                  className="w-4 h-4 rounded bg-slate-800 border-white/20 text-blue-500 focus:ring-blue-500/50"
                />
                <label htmlFor="isRequired" className="text-sm text-slate-400">
                  Mark as required
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-white/10 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingMaterial ? "Save Changes" : "Add Material"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
