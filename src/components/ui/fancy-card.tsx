import React from "react";
import Link from "next/link";

export function FancyCard({
  href,
  title,
  description,
  eyebrow,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  eyebrow?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border bg-background/60 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-cyan-500/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="p-6">
        {eyebrow ? (
          <div className="mb-2 inline-flex items-center gap-2 text-xs text-cyan-300/90">
            {icon} <span className="tracking-wide">{eyebrow}</span>
          </div>
        ) : null}
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 inline-flex items-center text-sm font-medium text-cyan-400">
          Get started →
        </div>
      </div>
      <div className="absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-2xl transition-all group-hover:scale-125" />
    </Link>
  );
}