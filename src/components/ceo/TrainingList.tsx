"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import TrainingCreateModal from "./TrainingCreateModal";
import AssignTrainingModal from "./AssignTrainingModal";
import TrainingEditModal from "./TrainingEditModal";
import StatsBar from "./StatsBar";
import { toast } from "@/hooks/use-toast";

interface Training {
  id: string;
  title: string;
  type: string;
  description: string | null;
  visibility: string;
  url: string | null;
  fileKey: string | null;
  tags: string[];
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  stats: {
    totalAssigned: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  };
}

export default function TrainingList() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    loadTrainings();
  }, [typeFilter, visibilityFilter]);

  const normalizeTrainings = (json: any): Training[] => {
    // Support {items: [...]}, {trainings: [...]}, or raw [...]
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.items)) return json.items;
    if (json && Array.isArray(json.trainings)) return json.trainings;
    return [];
  };

  const loadTrainings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter) params.append("type", typeFilter);
      if (visibilityFilter) params.append("visibility", visibilityFilter);
      if (search) params.append("q", search);

      const response = await fetch(`/api/ceo/training?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch trainings");
      const json = await response.json();
      setTrainings(normalizeTrainings(json));
    } catch (error) {
      console.error("Failed to load trainings:", error);
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTrainings();
  };

  const handleDelete = async (trainingId: string, trainingTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${trainingTitle}"? This will also delete all assignments and completions.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ceo/training/${trainingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete training");
      }

      toast("Training deleted successfully", "success");
      loadTrainings();
    } catch (error) {
      console.error("Failed to delete training:", error);
      toast("Failed to delete training", "error");
    }
  };

  // Calculate aggregate stats - safe with defensive check
  const safeTrainings = Array.isArray(trainings) ? trainings : [];
  const aggregateStats = safeTrainings.reduce(
    (acc, training) => ({
      totalAssigned: acc.totalAssigned + (training.stats?.totalAssigned || 0),
      inProgress: acc.inProgress + (training.stats?.inProgress || 0),
      completed: acc.completed + (training.stats?.completed || 0),
      notStarted: acc.notStarted + (training.stats?.notStarted || 0),
    }),
    { totalAssigned: 0, inProgress: 0, completed: 0, notStarted: 0 }
  );

  const getCompletionRate = (stats: Training["stats"]) => {
    if (stats.totalAssigned === 0) return 0;
    return Math.round((stats.completed / stats.totalAssigned) * 100);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "DOC":
        return "bg-blue-500/20 text-blue-300";
      case "VIDEO":
        return "bg-purple-500/20 text-purple-300";
      case "QUIZ":
        return "bg-green-500/20 text-green-300";
      case "LINK":
        return "bg-orange-500/20 text-orange-300";
      default:
        return "bg-slate-500/20 text-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Training Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Create and assign training materials to your team
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Training
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass p-4 rounded-lg space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search trainings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Types</option>
            <option value="DOC">Document</option>
            <option value="VIDEO">Video</option>
            <option value="QUIZ">Quiz</option>
            <option value="LINK">Link</option>
          </select>

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Visibility</option>
            <option value="INTERNAL">Internal Only</option>
            <option value="PUBLIC">Public</option>
            <option value="CLIENT">Client Access</option>
          </select>

          {(typeFilter || visibilityFilter || search) && (
            <button
              onClick={() => {
                setTypeFilter("");
                setVisibilityFilter("");
                setSearch("");
              }}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Stats */}
      {safeTrainings.length > 0 && (
        <StatsBar
          totalAssigned={aggregateStats.totalAssigned}
          inProgress={aggregateStats.inProgress}
          completed={aggregateStats.completed}
          notStarted={aggregateStats.notStarted}
        />
      )}

      {/* Training List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          Loading trainings...
        </div>
      ) : safeTrainings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">No trainings found</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Your First Training
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {safeTrainings.map((training) => (
            <div
              key={training.id}
              className="glass p-6 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
              onClick={() => {
                /* TODO: Open training details */
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{training.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                        training.type
                      )}`}
                    >
                      {training.type}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300">
                      {training.visibility}
                    </span>
                  </div>

                  {training.description && (
                    <p className="text-sm text-slate-400 mb-3">
                      {training.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500">
                      Created by {training.createdBy.name || training.createdBy.email}
                    </span>
                    {training.tags.length > 0 && (
                      <div className="flex gap-2">
                        {training.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {training.tags.length > 3 && (
                          <span className="text-slate-500 text-xs">
                            +{training.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="ml-6 text-right">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {getCompletionRate(training.stats)}%
                  </div>
                  <p className="text-xs text-slate-500 mb-3">Completion Rate</p>

                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Assigned:</span>
                      <span className="ml-1 font-medium">{training.stats.totalAssigned}</span>
                    </div>
                    <div>
                      <span className="text-green-400">Complete:</span>
                      <span className="ml-1 font-medium">{training.stats.completed}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs mt-1">
                    <div>
                      <span className="text-yellow-400">In Progress:</span>
                      <span className="ml-1 font-medium">{training.stats.inProgress}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Not Started:</span>
                      <span className="ml-1 font-medium">{training.stats.notStarted}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTraining({
                          id: training.id,
                          title: training.title,
                        });
                        setAssignModalOpen(true);
                      }}
                      className="flex-1 px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30 transition-colors text-xs"
                    >
                      Assign
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTraining({
                          id: training.id,
                          title: training.title,
                        });
                        setEditModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600/20 text-blue-300 rounded hover:bg-blue-600/30 transition-colors text-xs"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(training.id, training.title);
                      }}
                      className="px-3 py-1.5 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 transition-colors text-xs"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <TrainingCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          loadTrainings();
        }}
      />

      {selectedTraining && (
        <>
          <AssignTrainingModal
            isOpen={assignModalOpen}
            onClose={() => {
              setAssignModalOpen(false);
              setSelectedTraining(null);
            }}
            onSuccess={() => {
              loadTrainings();
            }}
            trainingId={selectedTraining.id}
            trainingTitle={selectedTraining.title}
          />

          <TrainingEditModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedTraining(null);
            }}
            onSuccess={() => {
              loadTrainings();
            }}
            trainingId={selectedTraining.id}
          />
        </>
      )}
    </div>
  );
}
