import React from "react";
import { Section } from "@/components/ui/section";

export default function Page() {
  return (
    <Section
      title="About SeeZee Studio"
      subtitle="Small studio. Big polish. Pragmatic builds that ship."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur">
          <h3 className="text-lg font-medium">What we do</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We build websites, portals, and automation that feel premium and
            stay maintainable. Next.js, Tailwind, Stripe, Prisma, and friends.
          </p>
        </div>
        <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur">
          <h3 className="text-lg font-medium">How we work</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Fixed scope or iterative sprints. Clear pricing, quick feedback
            loops, and zero fluff.
          </p>
        </div>
      </div>
    </Section>
  );
}