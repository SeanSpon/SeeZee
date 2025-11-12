"use client";

import { motion } from "framer-motion";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatCard } from "@/components/admin/StatCard";
import { Server, Key, Database, Activity, Settings } from "lucide-react";
import Link from "next/link";

interface SystemsClientProps {
  uptime: string;
  dbStatus: string;
  activeSessions: number;
  activeProjects: number;
}

export function SystemsClient({
  uptime,
  dbStatus,
  activeSessions,
  activeProjects,
}: SystemsClientProps) {
  return (
    <div className="space-y-6">
      {/* Premium Header with Animated Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-blue-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        
        {/* Animated glow orbs */}
        <motion.div 
          className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <div className="relative z-10 p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500"
            >
              <Settings className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
              Systems
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-[60px]">
            Infrastructure status and controls
          </p>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="System Uptime"
          value={uptime}
          icon={<Server className="w-5 h-5" />}
        />
        <StatCard
          label="API Status"
          value="Healthy"
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          label="Database"
          value={dbStatus}
          icon={<Database className="w-5 h-5" />}
        />
        <StatCard
          label="Active Sessions"
          value={activeSessions}
          icon={<Key className="w-5 h-5" />}
        />
      </motion.div>

      {/* Environment Variables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SectionCard title="Environment Keys (Masked)">
        <div className="space-y-2 font-mono text-sm">
          {[
            { key: "DATABASE_URL", value: "postgresql://••••••••••••" },
            { key: "NEXTAUTH_SECRET", value: "••••••••••••••••••••" },
            { key: "GOOGLE_CLIENT_ID", value: "1234567890-••••••••••••" },
            { key: "STRIPE_SECRET_KEY", value: "sk_live_••••••••••••" },
          ].map((env) => (
            <div
              key={env.key}
              className="flex justify-between items-center p-3 rounded-lg bg-slate-900/40 border border-white/5"
            >
              <span className="text-blue-400">{env.key}</span>
              <span className="text-slate-500">{env.value}</span>
            </div>
          ))}
        </div>
      </SectionCard>
      </motion.div>

      {/* Quick Links */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-4"
      >
        <Link href="/admin/ceo/systems/logs">
          <div className="p-6 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-900/60 transition-all cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">
              System Logs
            </h3>
            <p className="text-sm text-slate-400">
              View activity, system, and security logs
            </p>
          </div>
        </Link>

        <Link href="/admin/ceo/systems/automations">
          <div className="p-6 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-900/60 transition-all cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">
              Automations
            </h3>
            <p className="text-sm text-slate-400">
              Manage automated workflows and rules
            </p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}


