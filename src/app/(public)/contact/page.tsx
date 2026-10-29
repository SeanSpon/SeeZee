import { Suspense } from "react";
import { FiClock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { site } from "@/lib/site";
import ContactFormCard from "./ContactFormCard";

export default function ContactPage() {
  return (
    <div className="bg-[#0b0b0c] text-white">
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_0%,rgba(220,38,38,0.16),transparent_70%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-24 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
              <span aria-hidden className="h-px w-6 bg-current" />
              Contact
            </p>
            <h1 className="font-heading text-4xl font-extrabold !leading-[1.06] tracking-tight sm:text-6xl">
              Let’s talk about your website.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/65">
              Tell us a little about your business and what you need. We’ll reply within one business day with honest next
              steps — and a free quote if it’s a fit.
            </p>

            <dl className="mt-10 space-y-6">
              {[
                { Icon: FiPhone, label: "Call or text", value: site.phone, href: site.phoneHref },
                { Icon: FiMail, label: "Email", value: site.email, href: `mailto:${site.email}` },
                { Icon: FiMapPin, label: "Studio", value: "Louisville, KY — serving Kentuckiana & Cincinnati" },
                { Icon: FiClock, label: "Response time", value: "Within 1 business day" },
              ].map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-white/10 text-red-500">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <div>
                    <dt className="text-sm text-white/50">{label}</dt>
                    <dd className="mt-0.5 font-medium">
                      {href ? (
                        <a href={href} className="hover:text-red-400">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <Suspense fallback={<div className="min-h-[640px] rounded-3xl border border-white/[0.08] bg-[#111113]" />}>
            <ContactFormCard />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
