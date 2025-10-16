'use client';

import { motion } from 'framer-motion';
import { Check, Shield, Zap, HeartHandshake, Wrench } from 'lucide-react';
import { useQwizStore } from '@/lib/qwiz/store';
import { SERVICES } from '@/lib/qwiz/config';

export function MaintenanceUpsell() {
  const { maintenance, setMaintenance } = useQwizStore();

  const benefits = [
    {
      icon: Shield,
      title: 'Security & Updates',
      description: 'Monthly security patches, dependency updates, and vulnerability monitoring',
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Speed monitoring, database optimization, and CDN management',
    },
    {
      icon: Wrench,
      title: 'Bug Fixes & Support',
      description: 'Priority support for issues, quick bug fixes, and technical assistance',
    },
    {
      icon: HeartHandshake,
      title: 'Content Updates',
      description: 'Minor content changes, image updates, and text modifications (up to 2hrs/month)',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="text-6xl mb-4">🔧</div>
        <h2 className="text-4xl font-bold text-white mb-4">
          Keep Your Site Running Smoothly
        </h2>
        <p className="text-xl text-white/70">
          Protect your investment with ongoing maintenance & support
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {benefits.map((benefit, idx) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
          >
            <benefit.icon className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
            <p className="text-white/60 text-sm">{benefit.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Pricing Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border-2 border-cyan-500/30 rounded-3xl p-8 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {SERVICES.maintenance.label}
            </h3>
            <p className="text-white/60">{SERVICES.maintenance.description}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-cyan-400">
              ${(SERVICES.maintenance.monthly! / 100).toFixed(0)}
            </div>
            <div className="text-white/60 text-sm">per month</div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="text-sm text-white/70 mb-3">Includes:</div>
          <div className="grid gap-2">
            {[
              'Monthly security updates',
              'Performance monitoring',
              'Priority bug fixes',
              'Content updates (2hrs/month)',
              '99.9% uptime guarantee',
              'SSL certificate management',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/80">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selection Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMaintenance(true)}
            className={`py-4 px-6 rounded-xl font-semibold transition-all ${
              maintenance
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-white/10 text-white/60 hover:bg-white/20 border border-white/10'
            }`}
          >
            <div className="text-lg">✅ Yes, Add Maintenance</div>
            <div className="text-xs opacity-75">Recommended</div>
          </button>
          <button
            onClick={() => setMaintenance(false)}
            className={`py-4 px-6 rounded-xl font-semibold transition-all ${
              !maintenance
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10'
            }`}
          >
            <div className="text-lg">No Thanks</div>
            <div className="text-xs opacity-75">Skip for now</div>
          </button>
        </div>
      </motion.div>

      {/* Alternative Option */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h4 className="text-white font-semibold mb-2">
          💡 Already have a website that needs maintenance?
        </h4>
        <p className="text-white/60 text-sm mb-4">
          We can take over maintenance of your existing site, perform a health check, and keep it running smoothly.
          Just mention it in the contact form and we'll provide a custom quote.
        </p>
        <div className="text-cyan-400 text-sm font-medium">
          → Common fixes: security updates, broken features, performance issues, hosting migrations
        </div>
      </motion.div>
    </div>
  );
}
