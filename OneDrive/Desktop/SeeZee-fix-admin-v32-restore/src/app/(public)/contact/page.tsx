"use client";
import React, { useState } from "react";
import { Section } from "@/components/ui/section";

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function Page() {
  const [state, setState] = useState({ name: "", email: "", message: "" });
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
        setState({ name: "", email: "", message: "" });
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
    <Section title="Contact" subtitle="Tell us what you're trying to build.">
      <form
        className="mx-auto max-w-xl rounded-2xl border border-white/10 seezee-glass p-6 backdrop-blur"
        onSubmit={handleSubmit}
      >
        <label htmlFor="name" className="block text-sm text-gray-300">
          Name
          <input
            id="name"
            type="text"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            required
            aria-required="true"
            aria-label="Your name"
          />
        </label>
        <label htmlFor="email" className="mt-4 block text-sm text-gray-300">
          Email
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            required
            aria-required="true"
            aria-label="Email address"
          />
        </label>
        <label htmlFor="message" className="mt-4 block text-sm text-gray-300">
          Message
          <textarea
            id="message"
            rows={5}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            value={state.message}
            onChange={(e) => setState({ ...state, message: e.target.value })}
            required
            aria-required="true"
            aria-label="Your message"
          />
        </label>

        {status === 'error' && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {errorMessage}
          </div>
        )}

        <button
          className="mt-5 w-full rounded-xl bg-cyan-400 text-black px-4 py-3 font-semibold hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </Section>
  );
}
