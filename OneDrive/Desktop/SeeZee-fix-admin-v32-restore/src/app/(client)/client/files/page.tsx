"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Download, FileText, Image, Video, Plus, Folder, X, CheckCircle2, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

interface FileItem {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  type: string;
  mimeType: string;
  url: string;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return <Image className="w-5 h-5 text-cyan-400" />;
  if (mimeType.startsWith("video/")) return <Video className="w-5 h-5 text-purple-400" />;
  return <FileText className="w-5 h-5 text-blue-400" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function ClientFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const refreshFiles = useCallback(() => {
    fetch("/api/client/files")
      .then((res) => res.json())
      .then((data) => {
        setFiles(data.files || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const handleDownload = (file: FileItem) => {
    window.open(file.url, "_blank");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError(null);
    setUploadSuccess(null);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    await uploadFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploadError(null);
    setUploadSuccess(null);
    await uploadFiles(selectedFiles);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const uploadFiles = async (filesToUpload: File[]) => {
    setUploading(true);
    const newProgress: Record<string, number> = {};

    try {
      for (const file of filesToUpload) {
        newProgress[file.name] = 0;
        setUploadProgress({ ...newProgress });

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/client/files", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to upload ${file.name}`);
        }

        newProgress[file.name] = 100;
        setUploadProgress({ ...newProgress });
      }

      setUploadSuccess(`Successfully uploaded ${filesToUpload.length} file(s)`);
      setTimeout(() => setUploadSuccess(null), 3000);
      
      // Refresh files list
      await refreshFiles();
    } catch (error: any) {
      setUploadError(error.message || "Failed to upload files");
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-xl text-white mb-1">Files & Assets</h1>
            <p className="text-white/60 text-sm">Loading your project files...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Files & Assets</h1>
          <p className="text-white/60 text-sm">Access project deliverables and shared documents</p>
        </div>
        <button
          onClick={openFileDialog}
          disabled={uploading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
      </div>

      {/* Upload Status Messages */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm flex-1">{uploadError}</p>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-300 text-sm flex-1">{uploadSuccess}</p>
            <button
              onClick={() => setUploadSuccess(null)}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!uploading && files.length === 0 ? openFileDialog : undefined}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
          ${
            dragActive
              ? "border-blue-400 bg-blue-500/10 scale-[1.02]"
              : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10"
          }
          ${uploading ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${dragActive ? "text-blue-400" : "text-white/40"}`} />
        <p className="text-white font-semibold mb-2">
          {dragActive ? "Drop files here" : "Drag & drop files here or click to browse"}
        </p>
        <p className="text-white/60 text-sm">
          Supported: Images, Videos, PDFs, Documents (Max 50MB per file)
        </p>
        {uploading && Object.keys(uploadProgress).length > 0 && (
          <div className="mt-6 space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="text-left">
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span className="truncate flex-1">{fileName}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-blue-500 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {files.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No files yet"
          description="Files shared by your team will appear here"
          action={{
            label: "Upload Your First File",
            href: "#",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-gray-900 border border-gray-800 p-5 hover:bg-gray-800 transition-all rounded-2xl hover:border-trinity-red"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                  {getFileIcon(file.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate text-sm">{file.name}</h3>
                  <p className="text-xs text-white/60 mt-1">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleDownload(file)}
                className="w-full px-3 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 border border-cyan-500/30"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
