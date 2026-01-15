/**
 * FileDropzone - Drag-and-drop file upload component
 * Visual feedback on drag-over, clean empty state
 */

"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";

export function FileDropzone({ 
  onFiles 
}: { 
  onFiles: (files: File[]) => void 
}) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      onFiles(files);
    }
  }, [onFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFiles(files);
    }
  }, [onFiles]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        card 
        flex items-center justify-center 
        h-48 
        text-white/70 
        smooth-transition
        cursor-pointer
        ${isDragActive ? "drag-active" : "hover:bg-white/7"}
      `}
    >
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
        <Upload className={`w-10 h-10 mb-3 ${isDragActive ? "text-cyan-400" : "text-white/40"}`} />
        <div className="text-center px-4">
          <div className="text-sm font-medium text-white/80 mb-1">
            {isDragActive ? "Drop files here" : "Drag & drop files here"}
          </div>
          <div className="text-xs subtle">
            or click to browse
          </div>
          <div className="text-xs subtle mt-1">
            PNG, JPG, PDF, TXT • Max 25MB each
          </div>
        </div>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept="image/*,.pdf,.txt,.doc,.docx"
        />
      </label>
    </div>
  );
}
