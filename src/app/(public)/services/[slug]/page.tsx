import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { services, studio } from "@/lib/studio";
import { PageIntro, ContactBand } from "@/components/marketing/Studio";
import { generatePageMetadata } from "@/lib/metadata";
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  return service
    ? generatePageMetadata({
        title: `${service.name} in Louisville`,
        description: service.description,
        path: `/services/${slug}`,
      })
    : {};
}
export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = services.find((s) => s.slug === slug);
  if (!s) notFound();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    url: `${studio.url}/services/${s.slug}`,
    provider: { "@id": `${studio.url}/#organization` },
    areaServed: [
      { "@type": "City", name: "Louisville" },
      { "@type": "Country", name: "United States" },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\u003c"),
        }}
      />
      <PageIntro label={`Services / ${s.number}`} title={s.name}>
        <p>{s.description}</p>
        <Link href="/contact" className="studio-button">
          Discuss your project
          <ArrowUpRight size={18} />
        </Link>
      </PageIntro>
      <section className="studio-container studio-case-story">
        <div>
          <p className="studio-eyebrow">Made for your organization</p>
          <h2>{s.short}</h2>
        </div>
        <div>
          <h3>What we can help with</h3>
          <ul className="studio-check-list">
            {s.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            We start with your goals and existing tools. Your proposal sets out
            the deliverables, responsibilities, timeline, and any ongoing
            support before the build starts.
          </p>
        </div>
      </section>
      <section className="studio-container studio-faq">
        <p className="studio-eyebrow">A few useful answers</p>
        <h2>Before we begin.</h2>
        <details>
          <summary>Can you work on an existing website or system?</summary>
          <p>
            Yes. Send us the site and a description of what needs changing.
            We’ll review what’s there before recommending a repair, improvement,
            or rebuild.
          </p>
        </details>
        <details>
          <summary>How much does a project cost?</summary>
          <p>
            Pricing depends on the pages, features, integrations, content, and
            support you need. We provide a proposal for your specific scope
            before starting work.
          </p>
        </details>
        <details>
          <summary>Do we need to be in Louisville?</summary>
          <p>
            No. We’re based in Louisville, Kentucky, and can work remotely with
            your team.
          </p>
        </details>
        <details>
          <summary>What happens after launch?</summary>
          <p>
            We’ll plan the handover and discuss any maintenance or ongoing
            development you need. Those responsibilities are agreed as part of
            your scope.
          </p>
        </details>
      </section>
      <ContactBand />
    </>
  );
}
