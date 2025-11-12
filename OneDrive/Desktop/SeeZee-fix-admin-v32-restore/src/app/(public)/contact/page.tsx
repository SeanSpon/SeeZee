"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Section } from "@/components/ui/section";

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const SERVICE_TYPES = [
  { value: 'new-project', label: 'New Project' },
  { value: 'web-care', label: 'Website Maintenance' },
  { value: 'quick-repairs', label: 'Quick Repairs' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'other', label: 'Other' },
];

const BUDGET_RANGES = [
  { value: 'under-1k', label: 'Under $1,000' },
  { value: '1k-3k', label: '$1,000 - $3,000' },
  { value: '3k-5k', label: '$3,000 - $5,000' },
  { value: '5k-10k', label: '$5,000 - $10,000' },
  { value: 'over-10k', label: 'Over $10,000' },
  { value: 'not-sure', label: 'Not sure yet' },
];

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-2-weeks', label: '1-2 weeks' },
  { value: '1-month', label: 'Within 1 month' },
  { value: '2-3-months', label: '2-3 months' },
  { value: 'flexible', label: 'Flexible / No rush' },
];

function ContactForm() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get('service');

  const [state, setState] = useState({ 
    name: "", 
    email: "", 
    message: "",
    serviceType: serviceParam || "",
    budget: "",
    timeline: "",
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
        body: JSON.stringify(state),
      });

      if (response.ok) {
        setStatus('success');
        setState({ name: "", email: "", message: "", serviceType: serviceParam || "", budget: "", timeline: "" });
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
      <Section title="Contact" subtitle="Tell us what you're trying to build.">
        <div className="mx-auto max-w-xl text-center seezee-glass rounded-2xl p-12 border border-white/10">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-2xl font-bold mb-2 text-white">Message Sent!</h3>
          <p className="text-gray-400 mb-6">We'll get back to you within 24 hours.</p>
          <button
            onClick={() => setStatus('idle')}
            className="px-6 py-2 bg-cyan-400 text-black rounded-lg font-semibold hover:bg-cyan-300 transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Contact Us" subtitle="Tell us about your project and we'll get back to you within 24 hours.">
      <form
        className="mx-auto max-w-2xl rounded-2xl border border-white/10 seezee-glass p-8 backdrop-blur"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <label htmlFor="name" className="block text-sm text-gray-300">
            Full Name *
            <input
              id="name"
              type="text"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              required
              placeholder="John Doe"
            />
          </label>

          {/* Email */}
          <label htmlFor="email" className="block text-sm text-gray-300">
            Email Address *
            <input
              id="email"
              type="email"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
              value={state.email}
              onChange={(e) => setState({ ...state, email: e.target.value })}
              required
              placeholder="john@example.com"
            />
          </label>

          {/* Service Type */}
          <label htmlFor="serviceType" className="block text-sm text-gray-300">
            What can we help you with? *
            <select
              id="serviceType"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
              value={state.serviceType}
              onChange={(e) => setState({ ...state, serviceType: e.target.value })}
              required
            >
              <option value="">Select a service...</option>
              {SERVICE_TYPES.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </label>

          {/* Budget */}
          <label htmlFor="budget" className="block text-sm text-gray-300">
            Budget Range
            <select
              id="budget"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
              value={state.budget}
              onChange={(e) => setState({ ...state, budget: e.target.value })}
            >
              <option value="">Select a budget range...</option>
              {BUDGET_RANGES.map((budget) => (
                <option key={budget.value} value={budget.value}>
                  {budget.label}
                </option>
              ))}
            </select>
          </label>

          {/* Timeline */}
          <label htmlFor="timeline" className="md:col-span-2 block text-sm text-gray-300">
            Preferred Timeline
            <select
              id="timeline"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
              value={state.timeline}
              onChange={(e) => setState({ ...state, timeline: e.target.value })}
            >
              <option value="">Select a timeline...</option>
              {TIMELINE_OPTIONS.map((timeline) => (
                <option key={timeline.value} value={timeline.value}>
                  {timeline.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Message */}
        <label htmlFor="message" className="mt-6 block text-sm text-gray-300">
          Project Details *
          <textarea
            id="message"
            rows={6}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none transition-all"
            value={state.message}
            onChange={(e) => setState({ ...state, message: e.target.value })}
            required
            placeholder="Tell us about your project, goals, and any specific requirements..."
          />
        </label>

        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
            {errorMessage}
          </div>
        )}

        <button
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-4 font-semibold text-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          type="submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          We typically respond within 24 hours
        </p>
      </form>
    </Section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Section title="Contact Us" subtitle="Loading..."><div className="mx-auto max-w-2xl text-center">Loading contact form...</div></Section>}>
      <ContactForm />
    </Suspense>
  );
}
