"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";

interface ProjectData {
  id: string;
  name: string;
  email: string;
  projectType: string;
  goal: string;
  timeline: string;
  budget: string;
  status: string;
  createdAt: string;
}

export default function ProjectTable({ data }: { data: ProjectData[] }) {
  const [projects, setProjects] = useState(data);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, newStatus: string) {
    setUpdating(id);
    try {
      await fetch("/api/projects/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(null);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
        <p className="text-white/60">No project requests yet.</p>
        <p className="text-white/40 text-sm mt-2">New submissions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-white/90 text-sm">
          <thead className="text-white/60 border-b border-white/10 bg-slate-900/60">
            <tr>
              <th className="py-4 px-6 font-medium">Client</th>
              <th className="py-4 px-6 font-medium">Type</th>
              <th className="py-4 px-6 font-medium">Timeline</th>
              <th className="py-4 px-6 font-medium">Budget</th>
              <th className="py-4 px-6 font-medium">Status</th>
              <th className="py-4 px-6 font-medium">Action</th>
              <th className="py-4 px-6 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-white/5 hover:bg-slate-800/40 transition-colors duration-200"
              >
                <td className="py-4 px-6">
                  <div className="font-medium text-white">{p.name}</div>
                  <div className="text-white/50 text-xs">{p.email}</div>
                </td>
                <td className="py-4 px-6 text-white/70 capitalize">{p.projectType}</td>
                <td className="py-4 px-6 text-white/70">{p.timeline}</td>
                <td className="py-4 px-6 text-white/70">{p.budget}</td>
                <td className="py-4 px-6">
                  <StatusBadge status={p.status} />
                </td>
                <td className="py-4 px-6">
                  <select
                    value={p.status}
                    onChange={(e) => updateStatus(p.id, e.target.value)}
                    disabled={updating === p.id}
                    className="bg-slate-800/60 border border-white/10 text-white/80 text-xs rounded-md px-2 py-1 outline-none focus:border-[#7c5cff] transition-colors disabled:opacity-50"
                  >
                    {["pending", "in progress", "review", "delivered"].map((s) => (
                      <option key={s} value={s} className="bg-slate-800 text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4 px-6 text-white/50 text-xs">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}