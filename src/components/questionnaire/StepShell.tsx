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
      className="glass-effect rounded-xl border-2 border-gray-700 hover:border-#ef4444 transition-all duration-300 p-8 shadow-medium hover:shadow-large"
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold gradient-text mb-2">{title}</h1>
        {description && (
          <p className="text-white/60 text-sm md:text-base">{description}</p>
        )}
      </div>
      
      {children}
    </motion.div>
  );
}
