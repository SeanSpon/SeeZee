'use client';

import { motion } from 'framer-motion';
import { SERVICES, type Service } from '@/lib/qwiz/config';
import { useQwizStore } from '@/lib/qwiz/store';

export function ServiceSelector() {
  const { service, setService } = useQwizStore();

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          What are you building?
        </h2>
        <p className="text-white/60">Select your primary service</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(SERVICES)
          .filter(([key]) => key !== 'maintenance') // Exclude maintenance from initial selection
          .map(([key, svc]) => {
          const isSelected = service === key;

          return (
            <motion.button
              key={key}
              type="button"
              onClick={() => setService(key as Service)}
              className={`
                p-6 rounded-2xl border-2 transition-all text-left
                ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/25'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{svc.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {svc.label}
                  </h3>
                  <p className="text-white/60 text-sm mb-3">
                    {svc.description}
                  </p>
                  <div className="text-cyan-400 font-semibold">
                    {'monthly' in svc && svc.monthly
                      ? `$${(svc.monthly / 100).toFixed(0)}/month`
                      : `Starting at $${(svc.base / 100).toLocaleString()}`}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
