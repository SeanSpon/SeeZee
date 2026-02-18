"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from "react-icons/fi";
import { motion } from "framer-motion";

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const INQUIRY_TYPES = [
  { value: 'need-help', label: 'I need help with technology' },
  { value: 'new-website', label: 'I need a website or app' },
  { value: 'existing-issue', label: 'I have an existing system that needs work' },
  { value: 'just-exploring', label: 'Just exploring — not sure yet' },
];

function ContactForm() {
  const searchParams = useSearchParams();
  const inquiryParam = searchParams.get('inquiry');

  const [state, setState] = useState({
    name: "",
    email: "",
    message: "",
    inquiryType: inquiryParam || "",
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.name,
          email: state.email,
          message: state.inquiryType
            ? `Inquiry Type: ${INQUIRY_TYPES.find(t => t.value === state.inquiryType)?.label || state.inquiryType}\n\n${state.message}`
            : state.message,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setState({ name: "", email: "", message: "", inquiryType: inquiryParam || "" });
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Something went wrong');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Failed to send message. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="w-full">
        <section className="bg-[#0a1128] py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-2xl text-center bg-gray-900/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-3xl font-heading font-bold mb-3 text-white">Message Sent!</h3>
              <p className="text-gray-400 mb-2 text-lg">Thanks for reaching out. Check your inbox for a confirmation.</p>

              <div className="mt-8 text-left space-y-4">
                <h4 className="text-lg font-semibold text-white text-center">What happens next?</h4>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold">1</span>
                  <p className="text-gray-300 pt-1">We review your message and match you with the right person on our team.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold">2</span>
                  <p className="text-gray-300 pt-1">We&apos;ll reach out within 24 hours to discuss your project.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold">3</span>
                  <p className="text-gray-300 pt-1">Track everything — messages, progress, invoices — in your client dashboard.</p>
                </div>
              </div>

              <div className="mt-10 space-y-3">
                <Link
                  href="/signup"
                  className="block w-full px-8 py-4 bg-red-500 text-white rounded-lg font-semibold text-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Create Your Free Account
                </Link>
                <Link
                  href="/login?returnUrl=/client"
                  className="block w-full px-8 py-3 bg-transparent text-gray-300 border border-gray-600 rounded-lg font-medium hover:border-gray-400 hover:text-white transition-colors duration-200"
                >
                  Already have an account? Log in
                </Link>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors mt-2"
                >
                  Send Another Message
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

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
              Let's Talk
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Have a question? Need tech help? Just want to chat about what's possible? We're here and we'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="bg-[#1a2332] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm p-6 text-center hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Email</h3>
              <a
                href="mailto:contact@seezeestudios.com"
                className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
              >
                contact@seezeestudios.com
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm p-6 text-center hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPhone className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Phone</h3>
              <a
                href="tel:+15024352986"
                className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
              >
                (502) 435-2986
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm p-6 text-center hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMapPin className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Location</h3>
              <p className="text-sm text-gray-400">Louisville, KY</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm p-6 text-center hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Response Time</h3>
              <p className="text-sm text-gray-400">Within 24 hours</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-[#0a1128] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 md:p-12"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <label htmlFor="name" className="block">
                <span className="block text-sm font-medium text-white mb-2">
                  Full Name <span className="text-red-500">*</span>
                </span>
                <input
                  id="name"
                  type="text"
                  className="w-full rounded-xl border border-gray-700 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                  value={state.name}
                  onChange={(e) => setState({ ...state, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </label>

              {/* Email */}
              <label htmlFor="email" className="block">
                <span className="block text-sm font-medium text-white mb-2">
                  Email Address <span className="text-red-500">*</span>
                </span>
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-xl border border-gray-700 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                  value={state.email}
                  onChange={(e) => setState({ ...state, email: e.target.value })}
                  required
                  placeholder="john@example.com"
                />
              </label>
            </div>

            {/* Inquiry Type */}
            <label htmlFor="inquiryType" className="mt-6 block">
              <span className="block text-sm font-medium text-white mb-2">
                What brings you here?
              </span>
              <select
                id="inquiryType"
                className="w-full rounded-xl border border-gray-700 bg-black/40 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                value={state.inquiryType}
                onChange={(e) => setState({ ...state, inquiryType: e.target.value })}
              >
                <option value="" className="bg-[#1a2332]">What brings you here?</option>
                {INQUIRY_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-[#1a2332]">
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Message */}
            <label htmlFor="message" className="mt-6 block">
              <span className="block text-sm font-medium text-white mb-2">
                Message <span className="text-red-500">*</span>
              </span>
              <textarea
                id="message"
                rows={6}
                className="w-full rounded-xl border border-gray-700 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none transition-all"
                value={state.message}
                onChange={(e) => setState({ ...state, message: e.target.value })}
                required
                placeholder="Tell us how we can help you..."
              />
            </label>

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm"
              >
                {errorMessage}
              </motion.div>
            )}

            <button
              className="mt-8 w-full rounded-xl bg-red-500 text-white px-6 py-4 font-semibold text-lg hover:bg-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              type="submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>

            <p className="mt-6 text-center text-sm text-gray-500">
              We typically respond within 24 hours
            </p>
          </motion.form>
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
              Want to see what we've built?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Check out our work with local schools, nonprofits, and community organizations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-500 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
              >
                View Our Work
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:bg-white/10"
              >
                See Our Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="w-full bg-[#0a1128] py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center">
            <div className="animate-pulse text-white">Loading contact form...</div>
          </div>
        </div>
      </div>
    }>
      <ContactForm />
    </Suspense>
  );
}
