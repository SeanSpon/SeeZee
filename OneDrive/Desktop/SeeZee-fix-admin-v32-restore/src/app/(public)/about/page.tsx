'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Palette, Trophy, Mail, Instagram, MapPin } from 'lucide-react';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import { useState } from 'react';

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => setSubmitted(false), 3000);
    }, 1000);
  };

  return (
    <PageShell>
      {/* HERO SECTION */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-green-200 to-green-400 bg-clip-text text-transparent">
                Built by two full-stack devs<br />from Trinity High School.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-4 max-w-3xl mx-auto leading-relaxed">
              We're <span className="text-cyan-400 font-semibold">Sean</span> and <span className="text-green-400 font-semibold">Zach</span> — the duo behind SeeZee Studio.
            </p>
            <p className="text-lg md:text-xl text-white/60 mb-8">
              Students. FBLA competitors. Developers who turn ideas into working products.
            </p>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform"
            >
              Get in Touch <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* TEAM BIOS (SIDE-BY-SIDE) */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }} 
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-4">Meet the Team</h2>
            <p className="text-xl text-white/60">Two founders. One vision.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Sean McCulloch */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8, rotateY: 2 }}
              className="group relative perspective-1000"
            >
              <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 overflow-hidden hover:border-blue-500/30 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div
                  className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl"
                  animate={{
                    x: [0, 20, 0],
                    y: [0, 30, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <div className="relative z-10">
                  <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg">
                    <Code2 className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-1">Sean McCulloch</h3>
                  <p className="text-blue-400 font-semibold text-lg mb-2">Founder & Full-Stack Developer</p>
                  <p className="text-white/50 text-sm mb-6">Louisville, KY • Trinity High School (Class of 2026)</p>
                  
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <p className="text-green-400 text-sm font-semibold mb-2">FBLA Coding & Programming / Data Science competitor</p>
                  </div>
                  
                  <p className="text-white/80 mb-4 leading-relaxed">
                    I handle <span className="text-cyan-400 font-semibold">backend logic</span>, <span className="text-cyan-400 font-semibold">APIs</span>, <span className="text-cyan-400 font-semibold">databases</span>, and <span className="text-cyan-400 font-semibold">integrations</span>.
                  </p>
                  <p className="text-white/70 mb-6 italic text-sm">
                    I built SeeZee to merge creative design with clean, scalable code.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/50 font-semibold uppercase tracking-wide mb-2">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {['TypeScript', 'Python', 'SQL'].map((lang) => (
                          <span key={lang} className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 font-medium">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/50 font-semibold uppercase tracking-wide mb-2">Tools</p>
                      <div className="flex flex-wrap gap-2">
                        {['Next.js', 'Prisma', 'Stripe', 'Vercel'].map((tool) => (
                          <span key={tool} className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300 font-medium">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Zach Robards */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8, rotateY: -2 }}
              className="group relative perspective-1000"
            >
              <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 overflow-hidden hover:border-green-500/30 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div
                  className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl"
                  animate={{
                    x: [0, -20, 0],
                    y: [0, 30, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <div className="relative z-10">
                  <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-green-500 to-cyan-600 mb-6 shadow-lg">
                    <Palette className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-1">Zach Robards</h3>
                  <p className="text-green-400 font-semibold text-lg mb-2">Co-Founder & Full-Stack Developer</p>
                  <p className="text-white/50 text-sm mb-6">Louisville, KY • Trinity High School (Class of 2026)</p>
                  
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <p className="text-cyan-400 text-sm font-semibold mb-2">FBLA Mobile App Development competitor</p>
                  </div>
                  
                  <p className="text-white/80 mb-4 leading-relaxed">
                    I focus on the <span className="text-green-400 font-semibold">look and feel</span> — <span className="text-green-400 font-semibold">UI</span>, <span className="text-green-400 font-semibold">UX</span>, <span className="text-green-400 font-semibold">motion</span>, and <span className="text-green-400 font-semibold">frontend flow</span>.
                  </p>
                  <p className="text-white/70 mb-6 italic text-sm">
                    I like turning raw ideas into interfaces that feel alive.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/50 font-semibold uppercase tracking-wide mb-2">Tools</p>
                      <div className="flex flex-wrap gap-2">
                        {['React', 'Tailwind', 'Figma', 'Framer'].map((tool) => (
                          <span key={tool} className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-300 font-medium">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRINITY + FBLA SECTION */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-12"
          >
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="p-4 bg-green-500/20 rounded-xl">
                <Trophy className="w-12 h-12 text-green-400" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-white">
              Powered by Trinity + FBLA
            </h2>
            
            <div className="space-y-4 text-white/80 text-lg leading-relaxed">
              <p>
                <strong className="text-green-400">SeeZee Studio</strong> was founded at <span className="text-white font-semibold">Trinity High School</span> in Louisville, Kentucky, where we both study computer science and compete in <span className="text-cyan-400 font-semibold">FBLA (Future Business Leaders of America)</span>.
              </p>
              
              <p>
                Competing at state and national levels in <strong className="text-blue-400">Coding & Programming</strong>, <strong className="text-purple-400">Data Science</strong>, and <strong className="text-green-400">Mobile App Development</strong> shaped how we build — precise, goal-driven, and fast.
              </p>
              
              <p className="text-xl font-semibold text-cyan-400 text-center pt-6">
                Every SeeZee project is built with that same mindset.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">Get in Touch</h2>
            <p className="text-xl text-white/60">Want to work with us, ask a question, or collaborate on a project?</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Message */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Reach out — we answer everything personally.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/70">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  <a href="mailto:seezee.enterprises@gmail.com" className="hover:text-cyan-400 transition-colors">
                    seezee.enterprises@gmail.com
                  </a>
                </div>
                
                <div className="flex items-center gap-3 text-white/70">
                  <Instagram className="w-5 h-5 text-pink-400" />
                  <a href="https://instagram.com/seezeestudio" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
                    @seezeestudio
                  </a>
                </div>
                
                <div className="flex items-center gap-3 text-white/70">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <span>Louisville, KY</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
            >
              <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Message</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || submitted}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl text-white font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : submitted ? (
                    <>
                      ✓ Sent!
                    </>
                  ) : (
                    <>
                      Send Message <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              "Let's build something real together."
            </h2>
            <Link href="/start">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="mt-6 px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold text-lg shadow-lg flex items-center gap-2 mx-auto"
              >
                Start Your Project <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PageShell>
  );
}
