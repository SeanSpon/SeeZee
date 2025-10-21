"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import TagPicker from "./TagPicker";
import { toast } from "@/hooks/use-toast";

interface TrainingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trainingId: string;
}

export default function TrainingEditModal({
  isOpen,
  onClose,
  onSuccess,
  trainingId,
}: TrainingEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("DOC");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("INTERNAL");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const loadTraining = async () => {
    if (!trainingId) return;
    
    try {
      setFetching(true);
      const response = await fetch(`/api/ceo/training/${trainingId}`);
      if (!response.ok) throw new Error("Failed to load training");
      
      const data = await response.json();
      setTitle(data.title || "");
      setType(data.type || "DOC");
      setDescription(data.description || "");
      setVisibility(data.visibility || "INTERNAL");
      setUrl(data.url || "");
      setTags(data.tags || []);
    } catch (error) {
      console.error("Failed to load training:", error);
      toast("Failed to load training details", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen && trainingId) {
      loadTraining();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, trainingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast("Title is required", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/ceo/training/${trainingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type,
          description: description.trim() || null,
          visibility,
          url: url.trim() || null,
          tags,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update training");
      }

      toast("Training updated successfully!", "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to update training:", error);
      toast(error.message || "Failed to update training", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold">Edit Training</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {fetching ? (
            <div className="text-center py-8 text-slate-400">
              Loading training details...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Security Best Practices"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="DOC">Document</option>
                  <option value="VIDEO">Video</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="LINK">Link</option>
                </select>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  URL/Link
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description of the training content..."
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Visibility
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="INTERNAL"
                      checked={visibility === "INTERNAL"}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="text-purple-600"
                    />
                    <span className="text-sm">
                      <span className="font-medium">Internal Only</span>
                      <span className="text-slate-400 ml-2">
                        Only visible to team members
                      </span>
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="CLIENT"
                      checked={visibility === "CLIENT"}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="text-purple-600"
                    />
                    <span className="text-sm">
                      <span className="font-medium">Client Access</span>
                      <span className="text-slate-400 ml-2">
                        Visible to clients
                      </span>
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="PUBLIC"
                      checked={visibility === "PUBLIC"}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="text-purple-600"
                    />
                    <span className="text-sm">
                      <span className="font-medium">Public</span>
                      <span className="text-slate-400 ml-2">
                        Visible to everyone
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <TagPicker
                  value={tags}
                  onChange={setTags}
                  placeholder="Add tags..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={loading || fetching}
                >
                  {loading ? "Updating..." : "Update Training"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
