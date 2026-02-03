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
  Zap,
  Brain,
  Wand2,
  Info,
  CheckCircle,
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
  
  // Filter out completed milestones for selection
  const activeMilestones = milestones.filter(m => !m.completed);

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
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40 hover:border-purple-500/60 text-purple-300 hover:text-white rounded-xl transition-all group shadow-lg shadow-purple-500/10"
      >
        <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
        <span className="font-semibold">Generate Tasks with AI</span>
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
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-2xl md:max-h-[90vh] overflow-hidden bg-[#0d1526] border-2 border-purple-500/30 rounded-2xl shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Task Generator</h2>
                      <p className="text-sm text-white/60">Let AI create tasks for your project milestones</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Info Banner */}
              {suggestions.length === 0 && (
                <div className="mx-6 mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-300 font-medium mb-1">How it works:</p>
                    <ol className="text-sm text-blue-200/80 space-y-1 list-decimal list-inside">
                      <li>Select a milestone (or generate general project tasks)</li>
                      <li>Optionally add context about what you need</li>
                      <li>AI will suggest 5 relevant tasks</li>
                      <li>Review, select which tasks you want, and create them</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Step 1: Milestone Selection */}
                {activeMilestones.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold">1</span>
                      Choose a Milestone
                    </label>
                    <select
                      value={selectedMilestone || ""}
                      onChange={(e) => setSelectedMilestone(e.target.value || null)}
                      disabled={suggestions.length > 0}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:border-purple-500/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Generate general project tasks</option>
                      {activeMilestones.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-white/40 mt-2">
                      {selectedMilestone 
                        ? "Tasks will be automatically linked to this milestone" 
                        : "Tasks won't be linked to any milestone"}
                    </p>
                  </div>
                )}

                {/* Step 2: Additional Context */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold">
                      {activeMilestones.length > 0 ? "2" : "1"}
                    </span>
                    Add Context (Optional)
                  </label>
                  <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    disabled={suggestions.length > 0}
                    placeholder="Tell AI what kind of tasks you need...&#10;Examples:&#10;• Focus on frontend components&#10;• Need authentication setup&#10;• Database migration tasks"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/30 focus:border-purple-500/50 outline-none resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Step 3: Generate Button */}
                {suggestions.length === 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold">
                        {activeMilestones.length > 0 ? "3" : "2"}
                      </span>
                      Generate Tasks
                    </label>
                    <button
                      onClick={generateTasks}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          AI is thinking...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          Generate 5 Tasks
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Step 4: Review & Select Tasks */}
                {suggestions.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold">
                          <CheckCircle className="w-4 h-4" />
                        </span>
                        Review & Select Tasks
                      </label>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-white/60">
                          Click tasks to select/deselect • {selectedCount} of {suggestions.length} selected
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={selectAll}
                            className="text-xs px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors font-medium"
                          >
                            Select All
                          </button>
                          <button
                            onClick={deselectAll}
                            className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-colors font-medium"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {suggestions.map((task, index) => (
                        <div
                          key={index}
                          onClick={() => toggleTask(index)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            task.selected
                              ? "bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/10"
                              : "bg-white/5 border-white/10 opacity-50 hover:opacity-70"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                task.selected
                                  ? "bg-purple-500 text-white scale-110"
                                  : "bg-white/10 text-transparent border-2 border-white/20"
                              }`}
                            >
                              <Check className="w-4 h-4 font-bold" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="font-semibold text-white">{task.title}</h4>
                                <span
                                  className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                                    priorityColors[task.priority]
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              <p className="text-sm text-white/60 mb-2">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-white/40">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="w-3.5 h-3.5" />
                                  {task.estimatedHours}h estimated
                                </span>
                                {selectedMilestone && (
                                  <span className="flex items-center gap-1 text-purple-300">
                                    <Target className="w-3.5 h-3.5" />
                                    Will link to milestone
                                  </span>
                                )}
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
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-medium rounded-xl transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Generate Different Tasks
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              {suggestions.length > 0 && (
                <div className="px-6 py-5 border-t border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSuggestions([]);
                        setSelectedMilestone(null);
                        setAdditionalContext("");
                        setError(null);
                      }}
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-medium rounded-xl transition-all"
                    >
                      Start Over
                    </button>
                    <button
                      onClick={createSelectedTasks}
                      disabled={creating || selectedCount === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating {selectedCount} task{selectedCount !== 1 ? "s" : ""}...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Create {selectedCount} Task{selectedCount !== 1 ? "s" : ""}
                          {selectedMilestone && (
                            <span className="text-emerald-200 text-sm font-normal">
                              → {activeMilestones.find(m => m.id === selectedMilestone)?.name}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
