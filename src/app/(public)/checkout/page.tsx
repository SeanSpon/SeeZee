"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Section } from "@/components/ui/section";
import { Globe, LayoutDashboard, Workflow } from "lucide-react";

type WizardData = {
  serviceType?: "WEBSITE" | "PORTAL" | "AUTOMATION";
  timeline?: "RUSH" | "STANDARD" | "FLEX";
  budget?: { min: number; max: number } | null;
  contact?: { name: string; email: string } | null;
  quote?: { id: string; total: number; currency: string; depositPercent: number } | null;
};

const steps = ["Service", "Timeline", "Budget", "Contact", "Review", "Pay"];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const initialService = (searchParams.get("serviceType") as WizardData["serviceType"]) || undefined;

  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({ serviceType: initialService, budget: null, contact: null, quote: null });

  // convenience
  const next = (patch?: Partial<WizardData>) => {
    setData((d) => ({ ...d, ...(patch || {}) }));
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));
  const canBack = step > 0;

  // compute progress
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  return (
    <Section
      title="Checkout"
      subtitle="Answer a few quick questions to get an instant quote."
    >
      <div className="mx-auto max-w-2xl">
        <div className="h-2 w-full rounded-full bg-muted mb-8">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {step === 0 && <ServiceStep value={data.serviceType} onNext={(v) => next({ serviceType: v })} />}
        {step === 1 && <TimelineStep value={data.timeline} onNext={(v) => next({ timeline: v })} onBack={canBack ? back : undefined} />}
        {step === 2 && <BudgetStep value={data.budget} onNext={(v) => next({ budget: v })} onBack={back} />}
        {step === 3 && <ContactStep value={data.contact} onNext={(v) => next({ contact: v })} onBack={back} />}
        {step === 4 && <ReviewStep data={data} onBack={back} onQuoted={(q) => next({ quote: q })} />}
        {step === 5 && <PaymentStep data={data} onBack={back} />}
      </div>
    </Section>
  );
}

/* ---------- Beautiful Service Step ---------- */
function ServiceStep({
  value,
  onNext,
}: {
  value?: WizardData["serviceType"];
  onNext: (v: WizardData["serviceType"]) => void;
}) {
  const [v, setV] = useState<WizardData["serviceType"]>(value);

  const options = [
    {
      key: "WEBSITE" as const,
      title: "Website",
      eyebrow: "Marketing / portfolio",
      description: "Beautiful, fast, SEO-ready sites that convert visitors into customers.",
      icon: <Globe size={16} />,
    },
    {
      key: "PORTAL" as const,
      title: "Portal",
      eyebrow: "Dashboards / client areas",
      description: "Secure auth, role management, data visualization, and client workflows.",
      icon: <LayoutDashboard size={16} />,
    },
    {
      key: "AUTOMATION" as const,
      title: "Automation",
      eyebrow: "Internal tooling / scripts",
      description: "API integrations, webhooks, background jobs, and workflow automation.",
      icon: <Workflow size={16} />,
    },
  ];

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">What do you need?</h2>
      <div className="grid gap-4 md:grid-cols-1">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => setV(option.key)}
            className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
              v === option.key 
                ? "border-cyan-400 bg-cyan-500/5 ring-2 ring-cyan-400/20" 
                : "border-border bg-background/60 backdrop-blur hover:border-cyan-300/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`rounded-lg p-2 ${v === option.key ? "bg-cyan-500/20 text-cyan-400" : "bg-muted text-muted-foreground"}`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className={`text-xs tracking-wide ${v === option.key ? "text-cyan-400" : "text-muted-foreground"}`}>
                    {option.eyebrow}
                  </span>
                </div>
                <h3 className="font-medium text-lg mb-2">{option.title}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </div>
            {v === option.key && (
              <div className="absolute -right-12 -bottom-12 h-24 w-24 rounded-full bg-cyan-500/20 blur-xl" />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <span className="text-xs text-muted-foreground">Step 1 of {steps.length}</span>
        <button 
          disabled={!v} 
          onClick={() => v && onNext(v)} 
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </section>
  );
}

/* ---------- Other Steps (keeping original functionality) ---------- */
function TimelineStep({
  value,
  onNext,
  onBack,
}: {
  value?: WizardData["timeline"];
  onNext: (v: WizardData["timeline"]) => void;
  onBack?: () => void;
}) {
  const [v, setV] = useState<WizardData["timeline"]>(value || "STANDARD");
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Timeline</h2>
      <div className="grid gap-3">
        {(["RUSH", "STANDARD", "FLEX"] as const).map((opt) => (
          <button
            key={opt}
            className={`rounded-xl border p-4 text-left transition-all ${v === opt ? "border-cyan-400 bg-cyan-500/5" : "border-border hover:border-cyan-300/50"}`}
            onClick={() => setV(opt)}
          >
            <div className="font-medium">{opt}</div>
            <div className="text-sm text-muted-foreground">
              {opt === "RUSH" && "ASAP (premium)"}
              {opt === "STANDARD" && "Normal speed"}
              {opt === "FLEX" && "Flexible / best price"}
            </div>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4">
        <div className="flex gap-3">
          {onBack && (
            <button onClick={onBack} className="rounded-xl border px-4 py-2 text-sm hover:bg-accent">
              Back
            </button>
          )}
        </div>
        <button onClick={() => onNext(v)} className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2 text-sm font-medium text-white">
          Continue
        </button>
      </div>
    </section>
  );
}

function BudgetStep({
  value,
  onNext,
  onBack,
}: {
  value: WizardData["budget"];
  onNext: (v: NonNullable<WizardData["budget"]>) => void;
  onBack: () => void;
}) {
  const [min, setMin] = useState(value?.min ?? 1000);
  const [max, setMax] = useState(value?.max ?? 5000);
  const valid = min > 0 && max >= min;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Budget</h2>
      <div className="grid gap-4">
        <label className="space-y-2">
          <span className="text-sm text-muted-foreground">Min (USD)</span>
          <input 
            className="w-full rounded-xl border bg-background px-3 py-2" 
            type="number" 
            value={min} 
            onChange={(e) => setMin(parseInt(e.target.value || "0"))} 
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-muted-foreground">Max (USD)</span>
          <input 
            className="w-full rounded-xl border bg-background px-3 py-2" 
            type="number" 
            value={max} 
            onChange={(e) => setMax(parseInt(e.target.value || "0"))} 
          />
        </label>
      </div>
      <div className="flex items-center justify-between pt-4">
        <button onClick={onBack} className="rounded-xl border px-4 py-2 text-sm hover:bg-accent">Back</button>
        <button 
          disabled={!valid} 
          onClick={() => onNext({ min, max })} 
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </section>
  );
}

function ContactStep({
  value,
  onNext,
  onBack,
}: {
  value: WizardData["contact"];
  onNext: (v: NonNullable<WizardData["contact"]>) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(value?.name ?? "");
  const [email, setEmail] = useState(value?.email ?? "");
  const valid = name.trim().length > 1 && email.includes("@");

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Your details</h2>
      <div className="grid gap-4">
        <label className="space-y-2">
          <span className="text-sm text-muted-foreground">Name</span>
          <input 
            className="w-full rounded-xl border bg-background px-3 py-2" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-muted-foreground">Email</span>
          <input 
            className="w-full rounded-xl border bg-background px-3 py-2" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </label>
      </div>
      <div className="flex items-center justify-between pt-4">
        <button onClick={onBack} className="rounded-xl border px-4 py-2 text-sm hover:bg-accent">Back</button>
        <button 
          disabled={!valid} 
          onClick={() => onNext({ name, email })} 
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </section>
  );
}

function ReviewStep({
  data,
  onBack,
  onQuoted,
}: {
  data: WizardData;
  onBack: () => void;
  onQuoted: (quote: NonNullable<WizardData["quote"]>) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function getQuote() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: data.serviceType,
          timeline: data.timeline,
          budget: data.budget,
          contact: data.contact,
        }),
      });
      if (!res.ok) throw new Error("Quote failed");
      const q = await res.json();
      onQuoted({ id: q.id, total: q.total, currency: q.currency, depositPercent: q.depositPercent });
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getQuote();
  }, []);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Review</h2>
      <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur">
        <ul className="space-y-2 text-sm">
          <li><b>Service:</b> {data.serviceType}</li>
          <li><b>Timeline:</b> {data.timeline}</li>
          <li><b>Budget:</b> ${data.budget?.min} - ${data.budget?.max}</li>
          <li><b>Name:</b> {data.contact?.name}</li>
          <li><b>Email:</b> {data.contact?.email}</li>
        </ul>
      </div>

      {loading && <p className="text-center">Getting your quote…</p>}
      {err && <p className="text-red-600 text-center">{err}</p>}
      {data.quote && (
        <div className="rounded-2xl border bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 p-6">
          <div className="text-lg font-medium">Total: ${data.quote.total} {data.quote.currency.toUpperCase()}</div>
          <div className="text-sm text-muted-foreground">
            Deposit: {(data.quote.depositPercent * 100).toFixed(0)}% (${Math.round(data.quote.total * data.quote.depositPercent)})
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <button onClick={onBack} className="rounded-xl border px-4 py-2 text-sm hover:bg-accent">Back</button>
        <button
          disabled={!data.quote || loading}
          onClick={() => onQuoted(data.quote!)}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </section>
  );
}

function PaymentStep({ data, onBack }: { data: WizardData; onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const deposit = data.quote ? Math.round(data.quote.total * data.quote.depositPercent) : 0;

  async function pay() {
    if (!data.quote) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: data.quote.id, amount: data.quote.total }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error("Failed to create checkout session");
      window.location.href = json.url;
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Payment</h2>
      <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur text-center">
        <p className="text-sm text-muted-foreground mb-4">
          You'll be taken to Stripe to pay the deposit of <b className="text-foreground">${deposit}</b>.
        </p>
        {err && <p className="text-red-600 mb-3">{err}</p>}
      </div>
      <div className="flex items-center justify-between pt-4">
        <button onClick={onBack} className="rounded-xl border px-4 py-2 text-sm hover:bg-accent">Back</button>
        <button 
          onClick={pay} 
          disabled={!data.quote || loading} 
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Pay deposit"}
        </button>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <CheckoutContent />
    </Suspense>
  )
}