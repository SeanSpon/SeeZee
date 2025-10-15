'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { FEATURES, CATEGORIES, type Category } from '@/lib/qwiz/config';
import { useQwizStore } from '@/lib/qwiz/store';
import { formatPrice } from '@/lib/qwiz/pricing';

export function FeatureGrid() {
  const { features, toggleFeature } = useQwizStore();

  const featuresByCategory = FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<Category, typeof FEATURES[number][]>);

  const isSelected = (featureId: string) =>
    features.some((f) => f.id === featureId);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Add Features & Integrations
        </h2>
        <p className="text-white/60">Select everything you need</p>
      </div>

      {Object.entries(featuresByCategory).map(([category, items]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-semibold text-white">
            {CATEGORIES[category as Category]}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((feature) => {
              const selected = isSelected(feature.id);

              return (
                <motion.button
                  key={feature.id}
                  type="button"
                  onClick={() => toggleFeature(feature.id)}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-left relative
                    ${
                      selected
                        ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{feature.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">
                        {feature.label}
                      </h4>
                      <p className="text-white/60 text-sm mb-2">
                        {feature.description}
                      </p>
                      <div className="text-cyan-400 font-semibold text-sm">
                        +{formatPrice(feature.price)}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
