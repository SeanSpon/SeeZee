'use client'

import { motion } from 'framer-motion'
import { TrendingUp, FileText, CreditCard, MessageSquare, ArrowRight, CheckCircle, Clock, FolderKanban, DollarSign, Upload, Download, Bell, Settings, Send, Shield, Wallet, Headphones } from 'lucide-react'
import Link from 'next/link'
import { Dashboard3D } from '../dashboard-3d'
import { ScrollReveal } from '../motion'

export function DashboardShowcase() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Real-time project tracking',
      description: 'Watch your project evolve in real-time with live updates and progress tracking',
      gradient: 'from-blue-500 to-cyan-500',
      color: 'text-blue-400'
    },
    {
      icon: FileText,
      title: 'File uploads and revisions',
      description: 'Share files, review designs, and manage versions all in one place',
      gradient: 'from-purple-500 to-pink-500',
      color: 'text-purple-400'
    },
    {
      icon: CreditCard,
      title: 'Built-in payments + receipts',
      description: 'Pay invoices, track expenses, and download receipts instantly',
      gradient: 'from-green-500 to-emerald-500',
      color: 'text-green-400'
    },
    {
      icon: MessageSquare,
      title: 'Chat directly with your team',
      description: 'Message your developers, ask questions, and get instant responses',
      gradient: 'from-yellow-500 to-orange-500',
      color: 'text-yellow-400'
    },
    {
      icon: Shield,
      title: 'Enterprise-grade security',
      description: 'Your data is protected with bank-level encryption and secure access',
      gradient: 'from-indigo-500 to-blue-500',
      color: 'text-indigo-400'
    },
    {
      icon: Wallet,
      title: 'Easy payment management',
      description: 'View invoices, track payments, and manage billing seamlessly',
      gradient: 'from-emerald-500 to-teal-500',
      color: 'text-emerald-400'
    },
    {
      icon: Headphones,
      title: '24/7 support access',
      description: 'Get help whenever you need it with direct communication channels',
      gradient: 'from-pink-500 to-rose-500',
      color: 'text-pink-400'
    },
    {
      icon: Bell,
      title: 'Smart notifications',
      description: 'Stay updated with instant alerts for milestones, messages, and updates',
      gradient: 'from-cyan-500 to-blue-500',
      color: 'text-cyan-400'
    }
  ]

  return (
    <section id="dashboard" className="py-32 relative overflow-hidden">
      {/* Background effects - Linear style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header - Linear style: Scroll reveal */}
        <ScrollReveal direction="up" className="text-center mb-20">
          <h2 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight">
            one{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              dashboard
            </span>
          </h2>
          <p className="text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Track your project like it's a live game.
          </p>
        </ScrollReveal>

        {/* Dashboard Preview Mockup - 3D with Linear style */}
        <ScrollReveal direction="up" delay={0.2} className="max-w-6xl mx-auto mb-16">
          <Dashboard3D>
            <div className="p-8">
              {/* Mock Dashboard Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Website Redesign</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                      In Development
                    </span>
                    <span className="text-xs text-gray-400">Updated 2 hours ago</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-12 gap-4">
                {/* Left Column - Main Content */}
                <div className="col-span-12 lg:col-span-8 space-y-4">
                  {/* Progress Section */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">Project Progress</span>
                      <span className="text-sm font-bold text-white">65%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: '65%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>Current Phase: <span className="text-purple-400 font-medium">Build</span></span>
                      <span>•</span>
                      <span>Next: Homepage draft due Friday</span>
                    </div>
                  </div>

                  {/* Quick Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Tasks Done</div>
                      <div className="text-lg font-bold text-white">12/20</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Invoice Paid</div>
                      <div className="text-lg font-bold text-green-400">50%</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">New Files</div>
                      <div className="text-lg font-bold text-blue-400">3</div>
                    </div>
                  </div>

                  {/* Recent Updates Feed */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      Recent Updates
                    </h4>
                    <div className="space-y-2">
                      {[
                        { icon: Upload, text: 'New homepage design uploaded', time: '2h ago', color: 'text-blue-400' },
                        { icon: CheckCircle, text: 'Milestone: Design phase completed', time: '5h ago', color: 'text-green-400' },
                        { icon: MessageSquare, text: 'New message from team', time: '1d ago', color: 'text-purple-400' }
                      ].map((update, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <update.icon className={`w-4 h-4 mt-0.5 ${update.color} flex-shrink-0`} />
                          <div className="flex-1">
                            <span className="text-gray-300">{update.text}</span>
                            <span className="text-gray-500 ml-2">{update.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Tasks */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-gray-400" />
                      Upcoming Tasks
                    </h4>
                    <div className="space-y-2">
                      {[
                        { text: 'Review homepage draft', urgent: true },
                        { text: 'Approve color scheme', urgent: false },
                        { text: 'Provide content for About page', urgent: false }
                      ].map((task, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 rounded border-2 border-white/20 flex items-center justify-center">
                            {task.urgent && <div className="w-2 h-2 rounded-full bg-red-400" />}
                          </div>
                          <span className="text-gray-300">{task.text}</span>
                          {task.urgent && <span className="ml-auto text-xs text-red-400">Urgent</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  {/* Payment Summary */}
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-green-400" />
                      <h4 className="text-sm font-semibold text-white">Payment Summary</h4>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Project</span>
                        <span className="text-white font-semibold">$2,500</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Paid</span>
                        <span className="text-green-400 font-semibold">$1,250</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Remaining</span>
                        <span className="text-white font-semibold">$1,250</span>
                      </div>
                    </div>
                    <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                      Pay Now
                    </button>
                  </div>

                  {/* File Preview Widget */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Latest Files
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'homepage-v2.pdf', type: 'PDF', size: '2.4 MB' },
                        { name: 'logo-final.png', type: 'PNG', size: '1.2 MB' },
                        { name: 'brand-guidelines.pdf', type: 'PDF', size: '3.1 MB' }
                      ].map((file, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-white truncate">{file.name}</div>
                            <div className="text-xs text-gray-500">{file.size}</div>
                          </div>
                          <Download className="w-4 h-4 text-gray-400 hover:text-white transition-colors cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Widget */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      Messages
                    </h4>
                    <div className="space-y-2 mb-3">
                      {[
                        { from: 'Sean', text: 'Homepage design ready for review', time: '2h', unread: true },
                        { from: 'Zach', text: 'Color scheme approved?', time: '5h', unread: false }
                      ].map((msg, i) => (
                        <div key={i} className={`p-2 rounded-lg ${msg.unread ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-white">{msg.from}</span>
                            <span className="text-xs text-gray-500">{msg.time}</span>
                            {msg.unread && <div className="ml-auto w-2 h-2 rounded-full bg-blue-400" />}
                          </div>
                          <p className="text-xs text-gray-300">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Open Chat
                    </button>
                  </div>

                  {/* Support Card */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                    <h4 className="text-sm font-semibold text-white mb-2">Need Help?</h4>
                    <p className="text-xs text-gray-400 mb-3">Our team is here to assist you</p>
                    <button className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Dashboard3D>
        </ScrollReveal>

        {/* Features Grid - Linear style: Scroll reveals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <ScrollReveal 
              key={feature.title}
              direction="up" 
              delay={index * 0.1}
              className="group relative"
            >
              <motion.div 
                className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:shadow-glow-purple"
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div 
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-glow-blue`}
                  whileHover={{ 
                    scale: 1.15,
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.5 }
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(59, 130, 246, 0)",
                      "0 0 20px rgba(59, 130, 246, 0.4)",
                      "0 0 0px rgba(59, 130, 246, 0)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.3,
                    repeatDelay: 2
                  }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover glow effect */}
                <motion.div 
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 blur-xl -z-10`}
                  whileHover={{ opacity: 0.15 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA - Linear style: Glowing button */}
        <ScrollReveal direction="up" delay={0.4} className="text-center">
          <motion.a
            href="/start"
            className="group relative inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-xl rounded-2xl overflow-hidden shadow-glow-lg-blue hover:shadow-glow-lg-purple transition-all"
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center gap-3">
              Get Your Dashboard
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            {/* Animated shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "linear"
              }}
            />
            {/* Glow pulse */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 blur-xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  )
}

