'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FiArrowRight, 
  FiCheckCircle, 
  FiPackage, 
  FiClock,
  FiDollarSign,
  FiZap
} from 'react-icons/fi';

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0A0E27] to-[#1a0f2e] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Welcome Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 md:p-12 text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500/20 rounded-full mb-6"
          >
            <FiCheckCircle className="w-10 h-10 text-cyan-400" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to Your Client Portal!
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            To access your dashboard, you need to start a project first. 
            Here's how it works:
          </p>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                step: '1',
                icon: <FiPackage className="w-6 h-6" />,
                title: 'Pick a Project',
                desc: 'Choose what you need built',
              },
              {
                step: '2',
                icon: <FiDollarSign className="w-6 h-6" />,
                title: 'Get Estimate',
                desc: 'Receive transparent pricing',
              },
              {
                step: '3',
                icon: <FiZap className="w-6 h-6" />,
                title: 'Access Dashboard',
                desc: 'Track your project live',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-full mb-4 text-cyan-400">
                  {item.icon}
                </div>
                <div className="text-2xl font-bold text-cyan-400 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            href="/start"
            className="inline-flex items-center gap-2 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 text-lg"
          >
            Start Your First Project
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Options Card */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Maintenance Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FiPackage className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Already Have a Website?</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Subscribe to our maintenance plan for ongoing support, updates, and priority service.
            </p>
            <Link
              href="/client/hours#select-plan"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium"
            >
              View Maintenance Plans
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Hour Packs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 backdrop-blur-sm border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <FiClock className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Need Quick Updates?</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Purchase hour packs for one-time updates, fixes, or enhancements without a monthly commitment.
            </p>
            <Link
              href="/client/hours#hour-packs"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium"
            >
              View Hour Packs
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-slate-400"
        >
          <p>
            Questions? Email us at{' '}
            <a href="mailto:support@seezee.co" className="text-cyan-400 hover:text-cyan-300">
              support@seezee.co
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
