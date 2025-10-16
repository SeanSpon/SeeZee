/**
 * Resources Library
 */

"use client";

import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  type: string;
  size: string;
  url: string;
}

const mockResources: Resource[] = [
  {
    id: "res-1",
    title: "Brand Guidelines 2024",
    type: "PDF",
    size: "2.4 MB",
    url: "#",
  },
  {
    id: "res-2",
    title: "Client Onboarding Template",
    type: "PDF",
    size: "1.8 MB",
    url: "#",
  },
  {
    id: "res-3",
    title: "Project Proposal Template",
    type: "PDF",
    size: "3.2 MB",
    url: "#",
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-4">
      {mockResources.map((resource, idx) => (
        <motion.div
          key={resource.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="
            flex items-center justify-between p-4 rounded-xl
            bg-slate-900/40 backdrop-blur-xl border border-white/5
            hover:border-white/10 hover:bg-slate-900/60
            transition-all
          "
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">
                {resource.title}
              </h3>
              <p className="text-xs text-slate-500">
                {resource.type} • {resource.size}
              </p>
            </div>
          </div>
          <a
            href={resource.url}
            download
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <Download className="w-4 h-4" />
          </a>
        </motion.div>
      ))}
    </div>
  );
}


