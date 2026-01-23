"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface WelcomeScreenProps {
  userName?: string;
}

export default function WelcomeScreen({ userName }: WelcomeScreenProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#0a1128] p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-4xl"
        >
          👋
        </motion.div>
        
        <h1 className="mb-4 font-heading text-4xl font-bold text-white">
          Welcome{userName ? `, ${userName}` : ''}!
        </h1>
        
        <p className="mx-auto mb-8 max-w-lg text-lg text-slate-300">
          You're all set! Ready to bring your vision to life? Let's start building your project.
        </p>
        
        <Link
          href="/start"
          className="inline-flex items-center gap-2 rounded-xl bg-[#ef4444] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-[#dc2626] hover:shadow-xl hover:shadow-[#ef4444]/25"
        >
          <span className="text-xl">🚀</span>
          Start Your Project
        </Link>
      </motion.div>
      
      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/10 bg-white/5 p-8"
      >
        <h2 className="mb-6 font-heading text-2xl font-bold text-white">
          How It Works
        </h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
              📝
            </div>
            <h3 className="mb-2 font-semibold text-white">
              1. Tell Us Your Vision
            </h3>
            <p className="text-sm text-slate-400">
              Complete a brief questionnaire about your project goals and requirements.
            </p>
          </div>
          
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
              💻
            </div>
            <h3 className="mb-2 font-semibold text-white">
              2. We Build It
            </h3>
            <p className="text-sm text-slate-400">
              Our team brings your project to life while keeping you updated every step of the way.
            </p>
          </div>
          
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-2xl">
              🚀
            </div>
            <h3 className="mb-2 font-semibold text-white">
              3. Launch & Grow
            </h3>
            <p className="text-sm text-slate-400">
              Your project goes live, and we continue supporting you with maintenance and updates.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-white/10 bg-white/5 p-6 text-center"
      >
        <p className="mb-4 text-slate-400">
          Have questions before you start?
        </p>
        <Link
          href="/client/support"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
        >
          💬 Contact Support
        </Link>
      </motion.div>
    </div>
  );
}

