"use client";
import React from "react";
import { Section } from "@/components/ui/section";
import { FancyCard } from "@/components/ui/fancy-card";
import { Globe, LayoutDashboard, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const cards = [
    {
      title: "Website",
      eyebrow: "Marketing / portfolio",
      description: "Clean, fast, SEO-ready sites that look premium and load instantly.",
      icon: <Globe size={14} />,
      qp: "WEBSITE",
    },
    {
      title: "Portal",
      eyebrow: "Dashboards / client areas",
      description: "Auth, roles, data views & actions — polished internal or client portals.",
      icon: <LayoutDashboard size={14} />,
      qp: "PORTAL",
    },
    {
      title: "Automation",
      eyebrow: "Internal tools / scripts",
      description: "Zapier-style flows, cron jobs, integrations to remove manual work.",
      icon: <Workflow size={14} />,
      qp: "AUTOMATION",
    },
  ];

  return (
    <Section
      title="Services"
      subtitle="Pick a service to start your instant quote."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <FancyCard
            key={c.title}
            href={`/checkout?serviceType=${c.qp}`}
            title={c.title}
            eyebrow={c.eyebrow}
            description={c.description}
            icon={c.icon}
          />
        ))}
      </div>

      <div className="mt-12 rounded-2xl border bg-background/60 p-6 backdrop-blur">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h4 className="text-lg font-medium">Just need advice?</h4>
            <p className="text-sm text-muted-foreground">
              Not sure what to pick? Start the checkout — it's a quick questionnaire
              and you'll get a ballpark number instantly.
            </p>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Start instant quote
          </button>
        </div>
      </div>
    </Section>
  );
}