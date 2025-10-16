'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQwizStore } from '@/lib/qwiz/store';
import { PACKAGES, FEATURES, getLockedFeatures, getFeature, type PackageTier } from '@/lib/qwiz/packages';
import { formatPrice } from '@/lib/qwiz/pricing';
import { Check, X, ArrowRight, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function PackageSelector() {
  const { setPackage, setFeatures, setStep } = useQwizStore();
  const [showComparison, setShowComparison] = useState(false);

  const handleSelectPackage = (tier: PackageTier) => {
    // Set package
    setPackage(tier);

    // Pre-select all included features
    const lockedFeatures = getLockedFeatures(tier);
    setFeatures(lockedFeatures);

    // Move to feature builder
    setStep(1);
  };

  // Get all unique features across all packages for comparison
  const allFeatureIds = Array.from(
    new Set(PACKAGES.flatMap((pkg) => pkg.baseIncludedFeatures))
  );

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Choose Your Package
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Professional websites without agency-level prices
        </p>
        <p className="text-sm text-green-400 mt-2 font-medium">
          Most projects range from $1,200–$2,800 • No hidden fees
        </p>
      </motion.div>

      {/* Package Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12"
      >
        {PACKAGES.map((pkg) => {
          const savingsVsBasic = pkg.id === 'elite' 
            ? ((allFeatureIds.filter(id => pkg.baseIncludedFeatures.includes(id)).reduce((sum, id) => {
                const feat = getFeature(id);
                return sum + (feat?.price || 0);
              }, 0) - pkg.basePrice) / 100).toFixed(0)
            : null;

          return (
            <motion.div
              key={pkg.id}
              variants={item}
              className="relative"
            >
              {/* Badge */}
              {pkg.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {pkg.badge}
                  </div>
                </div>
              )}

              {/* Savings Badge for Elite */}
              {savingsVsBasic && (
                <div className="absolute -top-4 -right-2 z-10">
                  <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Save ${savingsVsBasic}+
                  </div>
                </div>
              )}

              {/* Card */}
              <div
                className={`
                  h-full glass-container p-6 lg:p-8
                  ${
                    pkg.badge
                      ? 'border-blue-500/30 shadow-lg shadow-blue-500/20'
                      : ''
                  }
                  ${pkg.id === 'elite' ? 'ring-2 ring-purple-500/20' : ''}
                `}
              >
                {/* Icon & Title */}
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{pkg.icon}</div>
                  <h3 className="text-2xl font-bold mb-1">{pkg.title}</h3>
                  <p className="text-sm text-blue-400 font-medium">{pkg.tagline}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6 pb-6 border-b border-gray-800">
                  <div className="text-sm text-gray-500 mb-1">Starting at</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {formatPrice(pkg.basePrice)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {pkg.id === 'starter' && '+ up to $1,300 in add-ons'}
                    {pkg.id === 'pro' && '+ up to $1,500 in add-ons'}
                    {pkg.id === 'elite' && 'Premium features included'}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-6 text-center min-h-[40px]">
                  {pkg.id === 'starter' && 'Perfect for small businesses starting out'}
                  {pkg.id === 'pro' && 'Everything you need to grow your business online'}
                  {pkg.id === 'elite' && 'Premium features with enterprise-level performance'}
                </p>

                {/* Included Features Count */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      {pkg.baseIncludedFeatures.length}
                    </div>
                    <div className="text-sm text-gray-400">Features Included</div>
                  </div>
                </div>

                {/* Included Features Preview */}
                <div className="space-y-2 mb-6">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    What's Included:
                  </div>
                  <ul className="space-y-2">
                    {pkg.baseIncludedFeatures.slice(0, 5).map((featureId) => {
                      const feature = getFeature(featureId);
                      return (
                        <li
                          key={featureId}
                          className="flex items-start gap-2 text-sm text-gray-300"
                        >
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{feature?.title || featureId.replace(/-/g, ' ')}</span>
                        </li>
                      );
                    })}
                    {pkg.baseIncludedFeatures.length > 5 && (
                      <li className="text-xs text-blue-400 pl-6 font-medium">
                        + {pkg.baseIncludedFeatures.length - 5} more features →
                      </li>
                    )}
                  </ul>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelectPackage(pkg.id)}
                  className={`
                    w-full py-3 px-6 rounded-xl font-semibold
                    flex items-center justify-center gap-2
                    transition-all duration-300
                    ${
                      pkg.badge
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }
                  `}
                >
                  Select {pkg.title}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Comparison Table Toggle */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="inline-flex items-center gap-2 bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-full px-6 py-3 hover:border-gray-700 transition-all"
        >
          <span className="text-sm text-gray-300">
            {showComparison ? 'Hide' : 'Show'} Detailed Comparison
          </span>
          {showComparison ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Detailed Comparison Table */}
      {showComparison && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-12 overflow-hidden"
        >
          <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-sm font-semibold text-gray-400 sticky left-0 bg-gray-900/40 backdrop-blur-sm">
                      Feature
                    </th>
                    {PACKAGES.map((pkg) => (
                      <th key={pkg.id} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl">{pkg.icon}</span>
                          <span className="text-sm font-semibold">{pkg.title}</span>
                          <span className="text-xs text-blue-400">{formatPrice(pkg.basePrice)}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatureIds.map((featureId, idx) => {
                    const feature = getFeature(featureId);
                    return (
                      <tr
                        key={featureId}
                        className={`border-b border-gray-800/50 ${
                          idx % 2 === 0 ? 'bg-gray-900/20' : ''
                        }`}
                      >
                        <td className="p-4 text-sm sticky left-0 bg-gray-900/40 backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <span>{feature?.icon}</span>
                            <span className="text-gray-300">{feature?.title || featureId}</span>
                          </div>
                        </td>
                        {PACKAGES.map((pkg) => {
                          const isIncluded = pkg.baseIncludedFeatures.includes(featureId);
                          return (
                            <td key={pkg.id} className="p-4 text-center">
                              {isIncluded ? (
                                <div className="flex justify-center">
                                  <div className="bg-green-500/20 rounded-full p-1">
                                    <Check className="w-5 h-5 text-green-400" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <div className="bg-gray-800/50 rounded-full p-1">
                                    <X className="w-5 h-5 text-gray-600" />
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  
                  {/* Maintenance Row */}
                  <tr className="border-b border-gray-800/50 bg-blue-500/5">
                    <td className="p-4 text-sm sticky left-0 bg-gray-900/40 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <span>🛡️</span>
                        <span className="text-gray-300 font-medium">Ongoing Maintenance & Support</span>
                      </div>
                    </td>
                    {PACKAGES.map((pkg) => (
                      <td key={pkg.id} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="bg-green-500/20 rounded-full p-1">
                            <Check className="w-5 h-5 text-green-400" />
                          </div>
                          <span className="text-xs text-gray-500">$60/mo</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Total Row */}
                  <tr className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                    <td className="p-4 text-sm font-semibold sticky left-0 bg-gray-900/40 backdrop-blur-sm">
                      Total Value
                    </td>
                    {PACKAGES.map((pkg) => (
                      <td key={pkg.id} className="p-4 text-center">
                        <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {formatPrice(pkg.basePrice)}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CTA Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-t border-gray-800">
              <div className="md:col-span-1 flex items-center justify-center">
                <span className="text-sm text-gray-400">Ready to start?</span>
              </div>
              {PACKAGES.map((pkg) => (
                <div key={pkg.id} className="flex justify-center">
                  <button
                    onClick={() => handleSelectPackage(pkg.id)}
                    className={`
                      px-6 py-2 rounded-lg font-semibold text-sm
                      transition-all duration-300
                      ${
                        pkg.badge
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-white'
                      }
                    `}
                  >
                    Select {pkg.title}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-full px-6 py-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <p className="text-sm text-gray-400">
            All packages are fully customizable in the next step
          </p>
        </div>
      </motion.div>
    </div>
  );
}
