"use client";

/**
 * Training Client Component
 */

import { motion } from "framer-motion";
import { Play, CheckCircle, Award, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type LearningResource = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string;
  url: string | null;
  content: string | null;
  isPublished: boolean;
  tags: string[];
  createdAt: Date;
};

interface TrainingClientProps {
  resources: LearningResource[];
}

export function TrainingClient({ resources }: TrainingClientProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Training Resources</h1>
          <p className="text-slate-400 text-sm">
            {resources.length} training modules available
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, idx) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="
              relative overflow-hidden rounded-xl
              bg-slate-900/40 backdrop-blur-xl
              border border-white/5
              hover:border-white/10 hover:shadow-xl
              transition-all duration-300
              p-6
              cursor-pointer
            "
            onClick={() => {
              if (resource.url) {
                window.open(resource.url, "_blank");
              }
            }}
          >
            {!resource.isPublished && (
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                  Draft
                </span>
              </div>
            )}

            <h3 className="text-lg font-semibold text-white mb-2">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                {resource.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap mb-4">
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs bg-slate-800/60 text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`
                  inline-flex px-2 py-1 rounded-full text-xs font-medium
                  ${
                    resource.type === "VIDEO"
                      ? "bg-purple-500/20 text-purple-400"
                      : resource.type === "ARTICLE"
                      ? "bg-blue-500/20 text-blue-400"
                      : resource.type === "COURSE"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-slate-500/20 text-slate-400"
                  }
                `}
              >
                {resource.type}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(resource.createdAt).toLocaleDateString()}
              </span>
            </div>

            {resource.url && (
              <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
                <Play className="w-4 h-4" />
                Open Resource
              </button>
            )}
          </motion.div>
        ))}

        {resources.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400">No training resources yet</p>
            <button className="mt-4 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
              Create First Resource
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
