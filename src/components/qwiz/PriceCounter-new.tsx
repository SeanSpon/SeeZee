'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQwizStore } from '@/lib/qwiz/store-new';
import { calculateTotals, formatPrice } from '@/lib/qwiz/pricing-new';
import { getPackage } from '@/lib/qwiz/packages';
import { DollarSign, Zap, TrendingUp } from 'lucide-react';

export function PriceCounter() {
  const { package: selectedPackage, features, contact, totals, setTotals } = useQwizStore();

  // Recalculate totals whenever selections change
  useEffect(() => {
    if (!selectedPackage) {
      setTotals({
        packageBase: 0,
        addons: 0,
        maintenance: 6000,
        rush: 0,
        subtotal: 0,
        deposit: 0,
        total: 0,
        monthly: 6000,
        recurring: true,
      });
      return;
    }

    const newTotals = calculateTotals({
      package: selectedPackage,
      selectedFeatures: features,
      rush: contact?.rush || false,
    });

    setTotals(newTotals);
  }, [selectedPackage, features, contact?.rush, setTotals]);

  // Don't show on step 0 (package selection)
  const { step } = useQwizStore();
  if (step === 0) return null;

  if (!selectedPackage) return null;

  const pkg = getPackage(selectedPackage);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Package Info */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">{pkg.icon}</div>
              <div>
                <div className="text-sm text-gray-400">{pkg.title} Package</div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatPrice(totals.subtotal)}</span>
                  {contact?.rush && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Rush +15%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="flex items-center gap-6 text-sm">
              {/* Package Base */}
              <div className="hidden sm:block">
                <div className="text-gray-500">Package</div>
                <div className="font-semibold">{formatPrice(totals.packageBase)}</div>
              </div>

              {/* Add-ons */}
              {totals.addons > 0 && (
                <div className="hidden sm:block">
                  <div className="text-gray-500">Add-ons</div>
                  <div className="font-semibold text-blue-400">
                    + {formatPrice(totals.addons)}
                  </div>
                </div>
              )}

              {/* Rush */}
              {totals.rush > 0 && (
                <div className="hidden sm:block">
                  <div className="text-gray-500">Rush</div>
                  <div className="font-semibold text-orange-400">
                    + {formatPrice(totals.rush)}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl px-4 py-2">
                <div className="text-gray-400 text-xs mb-0.5">Project Total</div>
                <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {formatPrice(totals.total)}
                </div>
              </div>

              {/* Maintenance */}
              <div className="bg-gray-800/50 rounded-xl px-4 py-2">
                <div className="text-gray-400 text-xs mb-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Monthly
                </div>
                <div className="font-semibold text-green-400">
                  {formatPrice(totals.monthly)}
                </div>
              </div>
            </div>

            {/* Deposit Info */}
            <div className="hidden lg:block text-right">
              <div className="text-gray-500 text-xs">Deposit to Start</div>
              <div className="font-semibold text-green-400">
                {formatPrice(totals.deposit)}
              </div>
            </div>
          </div>

          {/* Mobile Summary */}
          <div className="md:hidden mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <div>
              Package: {formatPrice(totals.packageBase)}
              {totals.addons > 0 && <> + Add-ons: {formatPrice(totals.addons)}</>}
            </div>
            <div>Deposit: {formatPrice(totals.deposit)}</div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
