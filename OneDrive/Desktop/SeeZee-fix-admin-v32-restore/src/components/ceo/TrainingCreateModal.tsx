"use client";

import { useState } from "react";
import { X, Upload, Link as LinkIcon, FileText } from "lucide-react";
import TagPicker from "./TagPicker";
import VisibilityBadge from "./VisibilityBadge";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";

interface TrainingCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTraining?: {
    id: string;
    title: string;
    type: string;
    description: string | null;
    visibility: string;
    url: string | null;
    tags: string[];
  };
}

export default function TrainingCreateModal({
  isOpen,
  onClose,
  onSuccess,
  editingTraining,
}: TrainingCreateModalProps) {
  const [formData, setFormData] = useState({
    title: editingTraining?.title || "",
    type: editingTraining?.type || "DOC",
    description: editingTraining?.description || "",
    visibility: editingTraining?.visibility || "INTERNAL",
    url: editingTraining?.url || "",
  });
  const [tags, setTags] = useState<string[]>(editingTraining?.tags || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ url: string; key: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const { startUpload } = useUploadThing("trainingUploader", {
    onClientUploadComplete: (files) => {
      if (files && files[0]) {
        setUploadedFile({ url: files[0].url, key: files[0].key });
        toast("File uploaded successfully!", "success");
        setUploading(false);
      }
    },
    onUploadError: (error) => {
      toast(`Upload failed: ${error.message}`, "error");
      setUploading(false);
    },
  });

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      await startUpload([files[0]]);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        description: formData.description || null,
        visibility: formData.visibility,
        url: uploadedFile?.url || formData.url || null,
        fileKey: uploadedFile?.key || null,
        tags: tags,
      };

      const url = editingTraining
        ? `/api/ceo/training/${editingTraining.id}`
        : "/api/ceo/training";
      const method = editingTraining ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save training");
      }

      toast(
        editingTraining ? "Training updated successfully!" : "Training created successfully!",
        "success"
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast(err.message || "Failed to save training", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-2xl rounded-lg border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold">
            {editingTraining ? "Edit Training" : "Create New Training"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="e.g. React Fundamentals"
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Type & Visibility */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Type <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="DOC">Document (PDF)</option>
                <option value="VIDEO">Video</option>
                <option value="QUIZ">Quiz</option>
                <option value="LINK">External Link</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Visibility <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.visibility}
                onChange={(e) =>
                  setFormData({ ...formData, visibility: e.target.value })
                }
                required
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="INTERNAL">Internal Only</option>
                <option value="PUBLIC">Public</option>
                <option value="CLIENT">Client Access</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              placeholder="Brief description of this training..."
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {formData.type === "LINK" ? "External URL" : "Resource URL"}
              {formData.type === "LINK" && (
                <span className="text-red-400"> *</span>
              )}
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                required={formData.type === "LINK"}
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {formData.type === "DOC" && (
              <p className="text-xs text-slate-500 mt-1">
                For PDFs/videos, you can upload files (UploadThing integration
                coming soon)
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <TagPicker
              value={tags}
              onChange={setTags}
              placeholder="Add tags (e.g., react, frontend, beginner)"
            />
          </div>

          {/* File Upload */}
          {(formData.type === "DOC" || formData.type === "VIDEO") && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload File (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept={formData.type === "DOC" ? ".pdf" : "video/*"}
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center gap-3 p-4 bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800/50 hover:border-purple-500/50 transition-all ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-slate-400">Uploading...</span>
                    </>
                  ) : uploadedFile ? (
                    <>
                      <FileText className="w-5 h-5 text-green-400" />
                      <div className="text-sm">
                        <p className="text-green-400 font-medium">File uploaded</p>
                        <p className="text-xs text-slate-500">Click to replace</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-400" />
                      <div className="text-sm text-slate-400">
                        <p className="font-medium">Click to upload file</p>
                        <p className="text-xs">
                          {formData.type === "DOC"
                            ? "PDF up to 32MB"
                            : "Video up to 128MB"}
                        </p>
                      </div>
                    </>
                  )}
                </label>
              </div>
              {uploadedFile && (
                <p className="text-xs text-slate-500 mt-2">
                  File will be used instead of URL field
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingTraining
                ? "Update Training"
                : "Create Training"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
