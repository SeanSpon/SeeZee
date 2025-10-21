"use client";

import { motion } from "framer-motion";
import { FileText, Download, ExternalLink, Tag, Eye } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  visibility: string;
  tags: string[];
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ResourcesClientProps {
  resources: Resource[];
}

export function ResourcesClient({ resources }: ResourcesClientProps) {
  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC":
        return "text-green-400";
      case "CLIENT":
        return "text-blue-400";
      case "INTERNAL":
      default:
        return "text-slate-400";
    }
  };

  if (resources.length === 0) {
    return (
      <div className="glass p-8 rounded-lg text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 mb-2">No resources available yet</p>
        <p className="text-sm text-slate-500">
          Resources will appear here once they are created by the CEO
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource, idx) => (
        <motion.div
          key={resource.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="
            p-5 rounded-xl
            bg-slate-900/40 backdrop-blur-xl border border-white/5
            hover:border-white/10 hover:bg-slate-900/60
            transition-all
          "
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-white truncate">
                    {resource.title}
                  </h3>
                  <span className={`flex items-center gap-1 text-xs ${getVisibilityColor(resource.visibility)}`}>
                    <Eye className="w-3 h-3" />
                    {resource.visibility}
                  </span>
                </div>
                {resource.description && (
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                    {resource.description}
                  </p>
                )}
                {resource.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {resource.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="text-xs text-slate-500">
                        +{resource.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-2">
                  Added by {resource.createdBy.name || resource.createdBy.email} • {new Date(resource.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                  title="Open resource"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
