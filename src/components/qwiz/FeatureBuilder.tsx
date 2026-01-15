'use client';

import { motion } from 'framer-motion';
import { useQwizStore } from '@/lib/qwiz/store';
import {
  FEATURES,
  CATEGORIES,
  getPackage,
  isFeatureLocked,
  isFeatureRecommended,
  type Category,
} from '@/lib/qwiz/packages';
import { formatPrice, wouldExceedCeiling, wouldExceedPackageLimit, getRemainingBudget } from '@/lib/qwiz/pricing';
import { Check, Lock, Star, AlertCircle } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

export function FeatureBuilder() {
  const { package: selectedPackage, features, totals, toggleFeature } = useQwizStore();

  if (!selectedPackage) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please select a package first</p>
      </div>
    );
  }

  const pkg = getPackage(selectedPackage);
  const remainingBudget = getRemainingBudget(selectedPackage, totals.addons);

  // Group features by category
  const featuresByCategory = FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<Category, typeof FEATURES>);

  const handleToggle = (featureId: string) => {
    const isLocked = isFeatureLocked(featureId, selectedPackage);
    if (isLocked) return; // Can't toggle locked features

    const isSelected = features.includes(featureId);
    
    if (!isSelected) {
      // Check if adding would exceed limits
      const feature = FEATURES.find((f) => f.id === featureId);
      if (!feature) return;

      // Check package limit
      if (wouldExceedPackageLimit(selectedPackage, totals.addons, featureId)) {
        // Show warning or prevent toggle
        return;
      }

      // Check ceiling limit
      if (wouldExceedCeiling(totals, featureId)) {
        // Show warning or prevent toggle
        return;
      }
    }

    toggleFeature(featureId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-full px-4 py-2 mb-4">
          <span className="text-2xl">{pkg.icon}</span>
          <span className="font-semibold">{pkg.title} Package</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Customize Your Features
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Your package includes {pkg.baseIncludedFeatures.length} features. Add more to customize your project.
        </p>
      </motion.div>

      {/* Budget Warning */}
      {remainingBudget <= 50000 && remainingBudget > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-300">
                Approaching package limit
              </p>
              <p className="text-xs text-orange-400/80 mt-1">
                You have {formatPrice(remainingBudget)} remaining for add-ons in this package
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {remainingBudget === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-300">
                Package limit reached
              </p>
              <p className="text-xs text-red-400/80 mt-1">
                You've reached the maximum add-ons for this package. For more features, contact us for a custom quote.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Features by Category */}
      <div className="space-y-12">
        {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
          <div key={category}>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              {CATEGORIES[category as Category]}
              <span className="text-sm text-gray-500 font-normal">
                ({categoryFeatures.filter((f) => features.includes(f.id)).length} selected)
              </span>
            </h3>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {categoryFeatures.map((feature) => {
                const isSelected = features.includes(feature.id);
                const isLocked = isFeatureLocked(feature.id, selectedPackage);
                const isRecommended = isFeatureRecommended(feature.id, selectedPackage);
                const isIncluded = pkg.baseIncludedFeatures.includes(feature.id);

                return (
                  <motion.button
                    key={feature.id}
                    variants={item}
                    onClick={() => handleToggle(feature.id)}
                    disabled={isLocked}
                    className={`
                      relative glass-feature-card text-left
                      ${
                        isSelected
                          ? 'border-blue-500/40 !bg-blue-500/20'
                          : ''
                      }
                      ${isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}
                      group
                    `}
                  >
                    {/* Status Badges */}
                    <div className="absolute top-3 right-3 flex gap-1">
                      {isLocked && (
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Included
                        </div>
                      )}
                      {isRecommended && !isLocked && (
                        <div className="bg-yellow-500 text-gray-900 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Recommended
                        </div>
                      )}
                    </div>

                    {/* Feature Icon */}
                    <div className="text-3xl mb-3">{feature.icon}</div>

                    {/* Feature Title */}
                    <h4 className="font-semibold mb-2 pr-20">{feature.title}</h4>

                    {/* Feature Description */}
                    <p className="text-sm text-gray-400 mb-3">{feature.description}</p>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">
                        {isIncluded ? (
                          <span className="text-green-400">✓ Included</span>
                        ) : feature.price === 0 ? (
                          <span className="text-green-400">Free</span>
                        ) : (
                          <span className="text-blue-400">+ {formatPrice(feature.price)}</span>
                        )}
                      </div>

                      {/* Checkbox */}
                      {!isLocked && (
                        <div
                          className={`
                            w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                            ${
                              isSelected
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-600 group-hover:border-gray-500'
                            }
                          `}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Maintenance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="bg-blue-500/20 p-3 rounded-xl">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">
              Ongoing Support & Maintenance
              <span className="ml-2 text-sm text-blue-400 font-normal">(Required)</span>
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              All packages include comprehensive maintenance and support to keep your site running smoothly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-sm">
                <div className="text-gray-500">✓ Client dashboard access</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">✓ Monthly updates</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">✓ Priority support</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">✓ Content updates (2hrs/mo)</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">✓ Analytics monitoring</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">✓ 99.9% uptime guarantee</div>
              </div>
            </div>
            <div className="text-sm font-semibold text-blue-400">
              {formatPrice(6000)}/month
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
