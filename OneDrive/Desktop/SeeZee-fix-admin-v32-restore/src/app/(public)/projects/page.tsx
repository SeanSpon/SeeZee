'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Trophy, Code2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PageShell from '@/components/PageShell';

const projects = [
  { name: 'Red Head Printing', status: 'In Development', description: 'Modern e-commerce platform for vintage print shop with custom product configurator and Stripe checkout', tech: ['Next.js', 'Stripe', 'Tailwind'], launchDate: 'Coming Soon' },
  { name: 'Big Red Bus', status: 'In Development', description: 'Community impact dashboard for Louisville nonprofit with real-time analytics and volunteer management', tech: ['React', 'Prisma', 'PostgreSQL'], launchDate: 'Q1 2025' },
  { name: 'Trinity FBLA — Coding & Programming', status: 'Live Soon', description: 'Advanced web application built for FBLA Nationals competition showcasing full-stack development', tech: ['TypeScript', 'Next.js', 'AI Integration'], launchDate: 'FBLA 2025' },
  { name: 'Trinity FBLA — Data Science', status: 'In Development', description: 'Data visualization and analytics platform competing at FBLA Nationals with machine learning', tech: ['Python', 'TensorFlow', 'D3.js'], launchDate: 'FBLA 2025' },
  { name: 'SeeZee Studio v2.0', status: 'Live Now', description: 'Next-gen agency platform you\'re using right now with AI-powered project management and instant quotes', tech: ['Next.js 15', 'OpenAI', 'Stripe'], launchDate: 'Live' },
  { name: 'Your Project Here', status: 'Available', description: 'This could be YOUR business. Ready to build something that stands out? Let\'s make it happen.', tech: ['Your Vision', 'Our Code'], launchDate: 'Let\'s Talk', cta: true },
];

export default function ProjectsPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block mb-6 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
              <span className="text-green-400 text-sm font-semibold">Trinity High School • FBLA Competitors</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-green-400 bg-clip-text text-transparent">
                Our Work in Progress
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 mb-8 max-w-3xl mx-auto">
              Big things start small. Here's what we're building.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <motion.div key={project.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -8 }} className="group relative">
              <div className={`relative h-full bg-white/5 backdrop-blur-xl border rounded-2xl p-6 transition-all ${project.cta ? 'border-cyan-500/30' : 'border-white/10'}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-white/10 border border-white/10">
                  {project.status === 'In Development' && <Clock className="w-3 h-3 animate-pulse" />}
                  {project.status}
                </div>
                <h3 className="text-2xl font-bold mb-2">{project.name}</h3>
                <p className="text-white/60 mb-6 text-sm">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80">{tech}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">{project.launchDate}</span>
                  {project.cta && (
                    <Link href="/start">
                      <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white text-sm font-semibold flex items-center gap-2">
                        Get Started <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4">Our Journey</h2>
            <p className="text-xl text-white/60">From students to studio founders</p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-cyan-500/20 to-transparent" />
            <div className="space-y-12">
              {[
                { year: '2024', event: 'Founded SeeZee Studio', icon: Sparkles },
                { year: '2024–25', event: 'Competing at FBLA Nationals', icon: Trophy },
                { year: '2025', event: 'Launching Client Portfolio', icon: Code2 },
                { year: '2025+', event: 'Building the Future', icon: Code2 },
              ].map((item, idx) => {
                const Icon = item.icon;
                const isEven = idx % 2 === 0;
                return (
                  <motion.div key={item.year} initial={{ opacity: 0, x: isEven ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className={`relative flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'} gap-8`}>
                    <div className={`flex-1 ${isEven ? 'text-right' : 'text-left'}`}>
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2" style={{ justifyContent: isEven ? 'flex-end' : 'flex-start' }}>
                          <Icon className="w-5 h-5 text-cyan-400" />
                          <span className="text-2xl font-bold text-cyan-400">{item.year}</span>
                        </div>
                        <p className="text-white/80">{item.event}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-500 rounded-full border-4 border-black" />
                    <div className="flex-1" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Trophy className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-5xl md:text-6xl font-black mb-6">Want to be our next case study?</h2>
            <p className="text-xl text-white/60 mb-8">Let's build your project and show the world what we can do together.</p>
            <Link href="/start">
              <motion.button whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold text-lg shadow-lg">
                Let's Build Your Project <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PageShell>
  );
}