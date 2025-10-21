"use client";

import { useState, useEffect } from "react";
import { Upload, File, Download, Trash2, FileText, Image, Video } from "lucide-react";

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
  if (mimeType.startsWith("image/")) return <Image className="w-6 h-6 text-cyan-400" />;
  if (mimeType.startsWith("video/")) return <Video className="w-6 h-6 text-purple-400" />;
  return <FileText className="w-6 h-6 text-blue-400" />;
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Files & Assets</h2>
            <p className="text-slate-400 mt-1">
              Access project deliverables and shared documents
            </p>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
          <p className="text-slate-400">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Files & Assets</h2>
          <p className="text-slate-400 mt-1">
            Access project deliverables and shared documents
          </p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload File
        </button>
      </div>

      {files.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
          <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No files yet</h3>
          <p className="text-slate-400 mb-6">
            Files shared by your team will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                  {getFileIcon(file.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{file.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDownload(file)}
                  className="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
