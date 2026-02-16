'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PhilosophyPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-[#0a1128] py-20 overflow-hidden">
        {/* Subtle tech grid background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, #22d3ee 1px, transparent 1px),
                linear-gradient(to bottom, #22d3ee 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]"
            style={{
              background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)'
            }}
          />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              How We Build
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              AI is changing how organizations operate. Most aren't ready.
            </p>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              We help teams integrate modern systems, automation, and AI without chaos or confusion. Not hype. Real implementation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Shift Is Already Happening */}
      <section className="bg-[#1a2332] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
              The Shift Is Already Happening
            </h2>

            <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-300 leading-relaxed">
              <p className="text-xl text-white font-medium">
                Every organization is becoming a technology organization.
              </p>
              <p>
                Workflows are automating. Decisions are becoming data-driven. AI is being embedded into everyday tools.
              </p>
              <p>
                The gap isn't between companies that use AI and those that don't.
              </p>
              <p>
                The gap is between organizations that <span className="text-white font-semibold">integrate it correctly</span> and those that bolt it on randomly.
              </p>
            </div>

            {/* Poor vs Good integration comparison */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-900/50 border border-red-500/20 rounded-xl p-8 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-full font-semibold tracking-wide uppercase">Poor Integration</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-red-400 mt-1 flex-shrink-0">-</span>
                    <span>Fragile systems</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-red-400 mt-1 flex-shrink-0">-</span>
                    <span>Staff frustration</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-red-400 mt-1 flex-shrink-0">-</span>
                    <span>Wasted money</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-red-400 mt-1 flex-shrink-0">-</span>
                    <span>Security risks</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/50 border-2 border-cyan-500/30 rounded-xl p-8 backdrop-blur-sm shadow-lg shadow-cyan-500/5">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full font-semibold tracking-wide uppercase">Good Integration</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-cyan-400 mt-1 flex-shrink-0">+</span>
                    <span>Time savings</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-cyan-400 mt-1 flex-shrink-0">+</span>
                    <span>Clarity</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-cyan-400 mt-1 flex-shrink-0">+</span>
                    <span>Scalability</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="text-cyan-400 mt-1 flex-shrink-0">+</span>
                    <span>Calmer operations</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-4 text-lg text-gray-300 leading-relaxed text-center">
              <p>
                Most teams don't need more software. They need their systems to <span className="text-white font-semibold">work together</span>.
              </p>
              <p className="text-gray-400">
                That's where we build.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="bg-[#0a1128] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
              Our Approach
            </h2>

            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p className="text-xl text-white font-medium text-center">
                We don't treat AI like a gimmick. We treat it like infrastructure.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                {[
                  'Integrating with existing tools',
                  'Simplifying workflows',
                  'Building maintainable systems',
                  'Supporting long-term',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 bg-gray-900/30 border border-gray-700/50 rounded-lg px-5 py-4">
                    <span className="text-cyan-400 flex-shrink-0">+</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-center text-gray-400 pt-4">
                Technology should reduce stress, not create it.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="bg-[#1a2332] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
              What We Believe
            </h2>

            <div className="space-y-16 max-w-3xl mx-auto">
              {/* Belief 1 */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  AI should support people, not replace them
                </h3>
                <div className="text-lg text-gray-300 leading-relaxed space-y-3">
                  <p>The goal isn't to remove humans. The goal is to remove friction.</p>
                  <p>We design systems that make teams faster and less overwhelmed.</p>
                </div>
              </div>

              {/* Belief 2 */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  Simplicity scales
                </h3>
                <div className="text-lg text-gray-300 leading-relaxed space-y-3">
                  <p>Complex dashboards don't help anyone.</p>
                  <p>Clear interfaces, predictable workflows, and accessible design win long-term.</p>
                  <p className="text-gray-400">If someone on your team struggles with tech, the system should still work for them.</p>
                </div>
              </div>

              {/* Belief 3 */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  Integration matters more than tools
                </h3>
                <div className="text-lg text-gray-300 leading-relaxed space-y-3">
                  <p>Most organizations already have software, data, and systems. They just don't talk to each other.</p>
                  <p>We focus on connecting and improving what exists before adding more tools.</p>
                </div>
              </div>

              {/* Belief 4 */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  Build. Support. Evolve.
                </h3>
                <div className="text-lg text-gray-300 leading-relaxed space-y-3">
                  <p>We don't launch and disappear.</p>
                  <p>We build systems that can grow with you and support them long-term. When your needs change, the system adapts instead of breaking.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Risk of Waiting */}
      <section className="bg-[#0a1128] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
              The Risk of Waiting
            </h2>

            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p>
                AI adoption isn't a future decision anymore.
              </p>
              <p>
                It's already happening inside competitors, vendors, and tools you use daily.
              </p>
              <p>
                Organizations that delay too long don't just fall behind. They accumulate <span className="text-white font-semibold">technical debt</span> that becomes harder to unwind later.
              </p>
              <p className="text-gray-400">
                The goal isn't to chase trends. It's to implement modern systems calmly and correctly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How We Build cards */}
      <section className="bg-[#1a2332] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
              How We Build
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-3">Simple UX</h3>
                <p className="text-gray-300 leading-relaxed">
                  Clear interfaces. Low cognitive load. Real usability.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-3">Clean Systems</h3>
                <p className="text-gray-300 leading-relaxed">
                  Maintainable structure. Documented. Supportable.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-3">No Hype</h3>
                <p className="text-gray-300 leading-relaxed">
                  Only what actually improves operations.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="bg-[#0a1128] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-8 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Who This Is For
            </h2>

            <p className="text-lg text-gray-300">Organizations that:</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Rely on technology daily',
                "Don't have an internal dev team",
                'Want practical AI adoption',
                'Need long-term support',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 bg-gray-900/30 border border-gray-700/50 rounded-lg px-5 py-4 text-left">
                  <span className="text-cyan-400 flex-shrink-0">+</span>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-gray-400">
              If your systems feel scattered or manual, we can help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-500 py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Figuring out how AI fits into your workflow?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We should talk.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/start"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-500 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
              >
                Start a Project
              </Link>
              <Link
                href="/start/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:bg-white/10"
              >
                Book a Consult
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
