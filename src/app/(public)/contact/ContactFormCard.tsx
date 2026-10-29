"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiCheck, FiLoader } from "react-icons/fi";

type FormStatus = "idle" | "loading" | "success" | "error";

const INQUIRY_TYPES = [
  { value: "new-website", label: "A new website" },
  { value: "redesign", label: "Redesign my current site" },
  { value: "web-app", label: "A web app or portal" },
  { value: "seo", label: "Local SEO / Google visibility" },
  { value: "existing-issue", label: "Help with an existing site" },
  { value: "just-exploring", label: "Just exploring" },
];

const BUDGETS = ["Not sure yet", "Under $2,500", "$2,500 – $5,000", "$5,000 – $10,000", "$10,000+"];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder-white/30 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500";

export default function ContactFormCard() {
  const searchParams = useSearchParams();
  const inquiryParam = searchParams.get("inquiry") || "";
  const empty = { name: "", email: "", phone: "", company: "", budget: "", message: "", inquiryType: inquiryParam };

  const [state, setState] = useState(empty);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [receipt, setReceipt] = useState<{ referenceId: string; teamNotified: boolean; confirmationSent: boolean } | null>(null);

  const update = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setState((s) => ({ ...s, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const details = [
      state.inquiryType && `Looking for: ${INQUIRY_TYPES.find((t) => t.value === state.inquiryType)?.label || state.inquiryType}`,
      state.company && `Business: ${state.company}`,
      state.phone && `Phone: ${state.phone}`,
      state.budget && `Budget: ${state.budget}`,
    ].filter(Boolean);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          email: state.email,
          message: details.length ? `${details.join("\n")}\n\n${state.message}` : state.message,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setReceipt(data);
        setStatus("success");
        setState(empty);
      } else {
        setErrorMessage(data.error || "Something went wrong. Please try again or call us.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("We couldn't send your message. Please try again or call us.");
      setStatus("error");
    }
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#111113] p-6 sm:p-10">
      {status === "success" ? (
        <div role="status" className="py-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-600/15 text-red-500">
            <FiCheck aria-hidden className="h-7 w-7" />
          </span>
          <h2 className="mt-6 font-heading text-3xl font-bold">Message received</h2>
          <p className="mt-3 text-white/65">
            {receipt?.teamNotified
              ? "Thanks for reaching out — we’ll get back to you within one business day."
              : "Your message was saved, but our email notification is delayed. For anything urgent, please call us."}
          </p>
          {receipt?.confirmationSent && <p className="mt-2 text-white/50">Check your inbox for a confirmation.</p>}
          {receipt?.referenceId && <p className="mt-3 text-sm text-white/40">Reference: {receipt.referenceId}</p>}
          <div className="mt-10 grid gap-3">
            <Link href="/signup" className="rounded-full bg-red-600 px-6 py-3.5 font-semibold hover:bg-red-500">
              Create your client account
            </Link>
            <button onClick={() => setStatus("idle")} className="text-sm text-white/50 hover:text-white">
              Send another message
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="font-heading text-2xl font-bold">Get a free quote</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-white/80">
                Name <span className="text-red-500">*</span>
              </label>
              <input id="name" required autoComplete="name" value={state.name} onChange={update("name")} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                Email <span className="text-red-500">*</span>
              </label>
              <input id="email" type="email" required autoComplete="email" value={state.email} onChange={update("email")} className={inputClass} />
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-white/80">
                Phone
              </label>
              <input id="phone" type="tel" autoComplete="tel" value={state.phone} onChange={update("phone")} className={inputClass} />
            </div>
            <div>
              <label htmlFor="company" className="mb-2 block text-sm font-medium text-white/80">
                Business name
              </label>
              <input id="company" autoComplete="organization" value={state.company} onChange={update("company")} className={inputClass} />
            </div>
            <div>
              <label htmlFor="inquiryType" className="mb-2 block text-sm font-medium text-white/80">
                What do you need?
              </label>
              <select id="inquiryType" value={state.inquiryType} onChange={update("inquiryType")} className={inputClass}>
                <option value="">Choose one</option>
                {INQUIRY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="budget" className="mb-2 block text-sm font-medium text-white/80">
                Budget
              </label>
              <select id="budget" value={state.budget} onChange={update("budget")} className={inputClass}>
                <option value="">Choose one</option>
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-white/80">
              Tell us about your project <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={state.message}
              onChange={update("message")}
              placeholder="What does your business do, and what should the website help with?"
              className={`${inputClass} resize-y`}
            />
          </div>

          {status === "error" && (
            <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-4 font-semibold shadow-[0_8px_30px_-8px_rgba(220,38,38,0.6)] transition hover:bg-red-500 disabled:opacity-60"
          >
            {status === "loading" && <FiLoader aria-hidden className="h-4 w-4 animate-spin" />}
            {status === "loading" ? "Sending…" : "Send message"}
          </button>
          <p className="text-center text-xs text-white/40">No spam, no pressure. We reply within one business day.</p>
        </form>
      )}
    </div>
  );
}
