"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  Loader2,
  Check,
  X,
  Target,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Brain,
  Wand2,
} from "lucide-react";

interface TaskSuggestion {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimatedHours: number;
  selected?: boolean;
}

interface Milestone {
  id: string;
  name: string; // Using name to match data from parent
  title?: string;
  description: string | null;
  dueDate: Date | string | null;
  completed: boolean;
}

interface AITaskGeneratorProps {
  projectId: string;
  milestones?: Milestone[];
  onTasksCreated?: () => void;
}

export function AITaskGenerator({ projectId, milestones = [], onTasksCreated }: AITaskGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [additionalContext, setAdditionalContext] = useState("");

  const generateTasks = async () => {
    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const res = await fetch("/api/ai/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          milestoneId: selectedMilestone,
          context: additionalContext,
          taskType: selectedMilestone ? "milestone" : "project",
          numberOfTasks: 5,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate tasks");
      }

      // Mark all tasks as selected by default
      setSuggestions(data.tasks.map((t: TaskSuggestion) => ({ ...t, selected: true })));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const createSelectedTasks = async () => {
    const selectedTasks = suggestions.filter((t) => t.selected);
    if (selectedTasks.length === 0) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/create-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          milestoneId: selectedMilestone,
          tasks: selectedTasks.map((t) => ({
            title: t.title,
            description: t.description,
            priority: t.priority,
            estimatedHours: t.estimatedHours,
          })),
          aiContext: {
            milestone: selectedMilestone,
            additionalContext,
            generatedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create tasks");
      }

      // Success - close and refresh
      setIsOpen(false);
      setSuggestions([]);
      setSelectedMilestone(null);
      setAdditionalContext("");
      onTasksCreated?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleTask = (index: number) => {
    setSuggestions((prev) =>
      prev.map((t, i) => (i === index ? { ...t, selected: !t.selected } : t))
    );
  };

  const selectAll = () => {
    setSuggestions((prev) => prev.map((t) => ({ ...t, selected: true })));
  };

  const deselectAll = () => {
    setSuggestions((prev) => prev.map((t) => ({ ...t, selected: false })));
  };

  const selectedCount = suggestions.filter((t) => t.selected).length;

  const priorityColors = {
    LOW: "text-blue-400 bg-blue-500/20",
    MEDIUM: "text-amber-400 bg-amber-500/20",
    HIGH: "text-red-400 bg-red-500/20",
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 hover:text-white rounded-xl transition-all group"
      >
        <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
        Generate Tasks with AI
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-2xl md:max-h-[85vh] overflow-hidden bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">AI Task Generator</h2>
                      <p className="text-xs text-white/50">Generate tasks based on project context</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Milestone Selection */}
                {milestones.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Generate for Milestone (optional)
                    </label>
                    <select
                      value={selectedMilestone || ""}
                      onChange={(e) => setSelectedMilestone(e.target.value || null)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500/50 outline-none"
                    >
                      <option value="">All Project Tasks</option>
                      {milestones.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.completed ? "(Done)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Additional Context */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Additional Context (optional)
                  </label>
                  <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="e.g., Focus on frontend components, Need authentication setup..."
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-purple-500/50 outline-none resize-none"
                  />
                </div>

                {/* Generate Button */}
                {suggestions.length === 0 && (
                  <button
                    onClick={generateTasks}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Tasks...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Generate Tasks
                      </>
                    )}
                  </button>
                )}

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">
                        Generated Tasks ({selectedCount} selected)
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={selectAll}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          Select All
                        </button>
                        <span className="text-white/20">|</span>
                        <button
                          onClick={deselectAll}
                          className="text-xs text-white/40 hover:text-white"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {suggestions.map((task, index) => (
                        <div
                          key={index}
                          onClick={() => toggleTask(index)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            task.selected
                              ? "bg-purple-500/10 border-purple-500/30"
                              : "bg-white/5 border-white/10 opacity-60"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                task.selected
                                  ? "bg-purple-500 text-white"
                                  : "bg-white/10 text-transparent"
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-white">{task.title}</h4>
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                    priorityColors[task.priority]
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              <p className="text-sm text-white/50 line-clamp-2">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {task.estimatedHours}h
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Regenerate Button */}
                    <button
                      onClick={generateTasks}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm rounded-xl transition-all"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      Regenerate
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              {suggestions.length > 0 && (
                <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                  <button
                    onClick={createSelectedTasks}
                    disabled={creating || selectedCount === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Tasks...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create {selectedCount} Task{selectedCount !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
