"use client";
import { useState } from "react";
import { createLead } from "./actions";
import { GlassCard } from "../../../components/ui/glass-card";
import { GlowButton } from "../../../components/ui/glow-button";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setResult(null);
    
    try {
      const response = await createLead(formData);
      setResult(response);
      
      if (response.ok) {
        // Reset form
        const form = document.getElementById('contact-form') as HTMLFormElement;
        form?.reset();
      }
    } catch (error) {
      setResult({ ok: false, error: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Get In Touch
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Ready to start your next project? Let&apos;s discuss how we can help bring your vision to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
            
            {result && (
              <div className={`mb-6 p-4 rounded-lg ${
                result.ok 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
              }`}>
                {result.ok 
                  ? "Thank you! Your message has been sent. We'll get back to you soon."
                  : result.error || "Something went wrong. Please try again."
                }
              </div>
            )}

            <form id="contact-form" action={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white/80 font-medium mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white/80 font-medium mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-white/80 font-medium mb-2">
                  Company (Optional)
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-white/80 font-medium mb-2">
                  Project Details *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
                />
              </div>

              <GlowButton
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </GlowButton>
            </form>
          </GlassCard>

          {/* Contact Info */}
          <div className="space-y-8">
            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-400 text-xl">📧</div>
                  <div>
                    <div className="text-white font-medium">Email</div>
                    <div className="text-white/70">hello@seezee.com</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-blue-400 text-xl">📱</div>
                  <div>
                    <div className="text-white font-medium">Phone</div>
                    <div className="text-white/70">+1 (555) 123-4567</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-blue-400 text-xl">📍</div>
                  <div>
                    <div className="text-white font-medium">Location</div>
                    <div className="text-white/70">Remote & On-site</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-4">What to Expect</h3>
              <div className="space-y-4 text-white/70">
                <div className="flex items-start space-x-3">
                  <div className="text-green-400 mt-1">✓</div>
                  <div>
                    <div className="font-medium text-white">Quick Response</div>
                    <div className="text-sm">We&apos;ll get back to you within 24 hours</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-green-400 mt-1">✓</div>
                  <div>
                    <div className="font-medium text-white">Free Consultation</div>
                    <div className="text-sm">Initial project discussion at no cost</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-green-400 mt-1">✓</div>
                  <div>
                    <div className="font-medium text-white">Detailed Proposal</div>
                    <div className="text-sm">Comprehensive project plan and timeline</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}