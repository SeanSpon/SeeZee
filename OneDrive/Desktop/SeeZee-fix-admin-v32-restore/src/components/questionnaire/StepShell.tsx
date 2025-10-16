'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StepShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function StepShell({ title, description, children }: StepShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        {description && (
          <p className="text-white/60 text-sm">{description}</p>
        )}
      </div>
      
      {children}
    </motion.div>
  );
}
