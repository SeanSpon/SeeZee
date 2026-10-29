import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/studio";
import { PageIntro, ContactBand } from "@/components/marketing/Studio";
import { generatePageMetadata } from "@/lib/metadata";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return generatePageMetadata({
    title: project.name,
    description: project.summary,
    path: `/projects/${slug}`,
  });
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <>
      <PageIntro label={`${p.kind} / ${p.category}`} title={p.name}>
        <p>{p.summary}</p>
        <a
          className="studio-button"
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {p.kind === "Prototype" ? "Open UI demo" : "Visit website"}
          <ArrowUpRight size={18} />
        </a>
      </PageIntro>
      {p.image && (
        <div className={`studio-container studio-case-image studio-${p.color}`}>
          <Image
            src={p.image}
            alt={p.alt}
            width={1600}
            height={1000}
            priority
            sizes="92vw"
          />
        </div>
      )}
      <section className="studio-container studio-case-story">
        <div>
          <p className="studio-eyebrow">The brief</p>
          <h2>{p.problem}</h2>
        </div>
        <div>
          <p className="studio-eyebrow">What we built</p>
          <p>{p.solution}</p>
          <ul className="studio-check-list">
            {p.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {p.kind === "Prototype" && (
            <p className="studio-note-small">
              This is a UI prototype. Demo screens and controls do not imply a
              live production service.
            </p>
          )}
          <Link className="studio-text-link" href="/projects">
            Back to all work
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
