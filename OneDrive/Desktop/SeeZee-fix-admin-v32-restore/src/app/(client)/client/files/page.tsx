"use client";

import { useState, useEffect } from "react";
import { Upload, Download, FileText, Image, Video, Plus, Folder } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/client/files")
      .then((res) => res.json())
      .then((data) => {
        setFiles(data.files || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownload = (file: FileItem) => {
    window.open(file.url, "_blank");
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
          <h1 className="heading-xl text-white mb-1">Files & Assets</h1>
          <p className="text-white/60 text-sm">Access project deliverables and shared documents</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload File
        </button>
      </div>

      {files.length === 0 ? (
        <div className="seezee-glass p-12 text-center rounded-2xl">
          <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No files yet</h3>
          <p className="text-white/60 mb-6">
            Files shared by your team will appear here
          </p>
          <button className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload Your First File
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="seezee-glass p-5 hover:bg-white/[0.08] transition-all rounded-2xl"
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
