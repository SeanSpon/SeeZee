'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Sparkles, Brain, Code2, Database, Paintbrush, Zap } from 'lucide-react';
import Link from 'next/link';
import PageShell from '@/components/PageShell';

const services = [
  {
    tier: 'Starter',
    price: '$1,200',
    tagline: 'Professional landing site, fast turnaround',
    features: ['5-page website', 'Mobile responsive', 'Contact forms', 'SEO basics', '2-week delivery'],
    icon: Rocket,
  },
  {
    tier: 'Pro',
    price: '$1,999',
    tagline: 'Full CMS, animations, Stripe checkout',
    features: ['CMS integration', 'Custom animations', 'Payment processing', 'Admin dashboard', '3-week delivery'],
    icon: Sparkles,
    popular: true,
  },
  {
    tier: 'Elite',
    price: '$2,999',
    tagline: 'Dashboards, AI features, admin panels',
    features: ['Advanced admin panels', 'AI automation', 'Multi-user auth', 'Real-time dashboards', 'Priority support'],
    icon: Brain,
  },
];

const addons = [
  { name: '3D Graphics', icon: Sparkles, price: '+$400' },
  { name: 'Video Production', icon: Paintbrush, price: '+$300' },
  { name: 'SEO Package', icon: Zap, price: '+$250' },
  { name: 'Brand Identity', icon: Paintbrush, price: '+$500' },
  { name: 'Database Architecture', icon: Database, price: '+$350' },
  { name: 'Monthly Maintenance', icon: Code2, price: '$60/mo' },
];

export default function ServicesPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block mb-6 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
              <span className="text-cyan-400 text-sm font-semibold">Built by students. Powered by ambition.</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-green-400 bg-clip-text text-transparent">
                What We Build
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 mb-10 max-w-3xl mx-auto">
              Modern websites, apps, and AI systems that make small businesses look professional and perform fast.
            </p>
            <Link href="/start">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold text-lg shadow-lg shadow-cyan-500/25">
                Start Your Project
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Service Packages */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4">Service Packages</h2>
            <p className="text-xl text-white/60">Choose your level. We'll handle the rest.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div key={service.tier} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -8, scale: 1.02 }} className="relative group">
                  {service.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <div className={`relative h-full bg-white/5 backdrop-blur-xl border ${service.popular ? 'border-cyan-500/30' : 'border-white/10'} rounded-2xl p-8 transition-all`}>
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">{service.tier}</h3>
                    <div className="text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{service.price}</div>
                    <p className="text-white/60 mb-6 text-sm">{service.tagline}</p>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-white/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/start">
                      <button className={`w-full py-3 rounded-xl font-semibold transition-all ${service.popular ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'bg-white/10 hover:bg-white/20 border border-white/10'}`}>
                        Get Started
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4">Add-Ons</h2>
            <p className="text-xl text-white/60">Custom features to level up your project</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addons.map((addon, idx) => {
              const Icon = addon.icon;
              return (
                <motion.div key={addon.name} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.05 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 transition-all cursor-pointer">
                  <Icon className="w-8 h-8 text-cyan-400 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">{addon.name}</h3>
                  <p className="text-cyan-400 font-bold">{addon.price}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl md:text-6xl font-black mb-6">Ready to stand out?</h2>
            <p className="text-xl text-white/60 mb-8">Let's build something real. Get your instant quote in under 2 minutes.</p>
            <Link href="/start">
              <motion.button whileHover={{ scale: 1.05 }} className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-cyan-500/25">
                Start Your Project →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PageShell>
  );
}
