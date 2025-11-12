"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Clock, DollarSign, User, FileText, ListTodo, History as TimelineIcon, Folder, Download, Eye, Upload, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectDetailClientProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    budget: any;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    assignee: {
      name: string | null;
      email: string | null;
      image: string | null;
    } | null;
    milestones: Array<{
      id: string;
      name: string;
      description: string | null;
      completed: boolean;
      dueDate: Date | null;
      createdAt: Date;
    }>;
    feedEvents: Array<{
      id: string;
      type: string;
      title: string;
      description: string | null;
      createdAt: Date;
      user: {
        name: string | null;
      } | null;
    }>;
    files?: Array<{
      id: string;
      name: string;
      originalName: string;
      mimeType: string;
      size: number;
      url: string;
      type: string;
      createdAt: Date;
    }>;
    questionnaire: any;
  };
}

type TabType = "overview" | "tasks" | "timeline" | "files";

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatusBadge = (status: string) => {
    const config = {
      COMPLETED: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Completed" },
      ACTIVE: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "Active" },
      IN_PROGRESS: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "In Progress" },
      DESIGN: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30", label: "Design" },
      BUILD: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30", label: "Build" },
      REVIEW: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30", label: "Review" },
      ON_HOLD: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: "On Hold" },
      PLANNING: { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-500/30", label: "Planning" },
      PAID: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30", label: "Paid" },
      LEAD: { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/30", label: "Lead" },
      LAUNCH: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Launch" },
    }[status] || { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: status };
    
    return config;
  };

  const badge = getStatusBadge(project.status);
  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Extract questionnaire data
  const questionnaireData = project.questionnaire?.data as any;
  const packageName = questionnaireData?.selectedPackage || 'starter';
  const selectedFeatures = questionnaireData?.selectedFeatures || [];
  const totals = questionnaireData?.totals;
  const timeline = questionnaireData?.questionnaire?.timeline || 'Flexible';
  const totalAmount = totals?.finalTotal || totals?.subtotal || project.budget || 0;

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: FileText },
    { id: "tasks" as TabType, label: "Tasks", icon: ListTodo },
    { id: "timeline" as TabType, label: "Timeline", icon: TimelineIcon },
    { id: "files" as TabType, label: "Files", icon: Folder },
  ];

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", project.id);

        const response = await fetch(`/api/client/files?projectId=${project.id}`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to upload ${file.name}`);
        }
      }

      setUploadSuccess(`Successfully uploaded ${files.length} file(s)`);
      setTimeout(() => {
        setUploadSuccess(null);
        window.location.reload(); // Refresh to show new files
      }, 2000);
    } catch (error: any) {
      setUploadError(error.message || "Failed to upload files");
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [project.id]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Project Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/60 text-sm">Status</span>
                    <span className={`font-medium ${badge.text}`}>{badge.label}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/60 text-sm">Milestones</span>
                    <span className="font-medium text-white">
                      {completedMilestones} / {totalMilestones}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/60 text-sm">Created</span>
                    <span className="font-medium text-white">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {project.startDate && (
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-white/60 text-sm">Start Date</span>
                      <span className="font-medium text-white">
                        {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-white/60 text-sm">End Date</span>
                      <span className="font-medium text-white">
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {project.assignee && (
                <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                    <User className="w-4 h-4" />
                    <span>Assigned To</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {project.assignee.image ? (
                      <img
                        src={project.assignee.image}
                        alt={project.assignee.name || "Team"}
                        className="w-10 h-10 rounded-full border-2 border-cyan-500/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border-2 border-cyan-500/30" />
                    )}
                    <div>
                      <p className="font-medium text-white text-sm">{project.assignee.name}</p>
                      <p className="text-xs text-white/60">{project.assignee.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {project.budget && (
                <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Budget</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">
                    ${Number(project.budget).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "tasks":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Milestones</h3>
              <span className="text-sm text-white/60">
                {completedMilestones} of {totalMilestones} completed
              </span>
            </div>
            {project.milestones.length === 0 ? (
              <div className="text-center py-12">
                <ListTodo className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No milestones yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="p-4 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        milestone.completed
                          ? "bg-emerald-500/20 border-emerald-500/50"
                          : "bg-white/5 border-white/20"
                      }`}>
                        {milestone.completed && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-white">{milestone.name}</h4>
                          {milestone.completed && (
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
                              Completed
                            </span>
                          )}
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-white/60 mb-2">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          {milestone.dueDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Due {new Date(milestone.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Created {new Date(milestone.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "timeline":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Activity Timeline</h3>
            {project.feedEvents.length === 0 ? (
              <div className="text-center py-12">
                <TimelineIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {project.feedEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex gap-4 relative"
                  >
                    {index < project.feedEvents.length - 1 && (
                      <div className="absolute left-3 top-8 bottom-0 w-px bg-white/10" />
                    )}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border-2 border-cyan-500/50 flex items-center justify-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{event.title}</h4>
                        <span className="text-xs text-white/40">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-white/60 mb-2">{event.description}</p>
                      )}
                      {event.user && (
                        <p className="text-xs text-white/40">by {event.user.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "files":
        const files = project.files || [];
        const formatFileSize = (bytes: number): string => {
          if (bytes < 1024) return `${bytes} B`;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
          return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
        };

        const getFileIcon = (mimeType: string) => {
          if (mimeType.startsWith("image/")) return "🖼️";
          if (mimeType.startsWith("video/")) return "🎥";
          if (mimeType.includes("pdf")) return "📄";
          if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
          if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
          return "📎";
        };

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Project Files</h3>
              <div className="flex items-center gap-3">
                <Link
                  href={`/client/projects/${project.id}/requests`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Change Requests
                </Link>
                <button
                  onClick={openFileDialog}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload File"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
              </div>
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
                  <p className="text-red-300 text-sm flex-1">{uploadError}</p>
                  <button
                    onClick={() => setUploadError(null)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ×
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
                  <p className="text-emerald-300 text-sm flex-1">{uploadSuccess}</p>
                  <button
                    onClick={() => setUploadSuccess(null)}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {files.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 mb-2">No files uploaded yet</p>
                <p className="text-sm text-white/40">Files shared by your team will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl flex-shrink-0">{getFileIcon(file.mimeType)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate mb-1 group-hover:text-blue-300 transition-colors">
                          {file.originalName || file.name}
                        </h4>
                        <p className="text-xs text-white/60 mb-2">{formatFileSize(file.size)}</p>
                        <p className="text-xs text-white/40">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-blue-500/30"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </a>
                      <a
                        href={file.url}
                        download
                        className="flex-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-cyan-500/30"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <div>
        <Link 
          href="/client/projects" 
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-white/60 text-sm max-w-2xl">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/client/projects/${project.id}/requests`}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Change Requests
            </Link>
            <span
              className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Package & Timeline Info Bar */}
      {questionnaireData && (
        <div className="seezee-glass p-4 rounded-2xl">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-white/50">Package:</span>
              <span className="font-semibold capitalize">{packageName}</span>
            </div>
            {selectedFeatures.length > 0 && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-white/50">Features:</span>
                  <span className="font-semibold">{selectedFeatures.length} selected</span>
                </div>
              </>
            )}
            {totalAmount > 0 && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-white/50">Total:</span>
                  <span className="font-semibold">${Number(totalAmount / 100).toLocaleString()}</span>
                </div>
              </>
            )}
            {timeline && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="w-4 h-4 text-white/50" />
                  <span className="font-semibold">{timeline}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Milestones Progress */}
      {totalMilestones > 0 && (
        <div className="seezee-glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold text-white">Milestones Progress</span>
            </div>
            <span className="text-2xl font-bold text-white">
              {completedMilestones} / {totalMilestones}
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-white/50 mt-2 text-right">{progress}% Complete</div>
        </div>
      )}

      {/* Tabs */}
      <div className="seezee-glass rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/10 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-3 text-sm font-medium transition-all whitespace-nowrap
                  flex items-center gap-2
                  ${
                    isActive
                      ? "text-white bg-cyan-500/20 border-b-2 border-cyan-400"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

