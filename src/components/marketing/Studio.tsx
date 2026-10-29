import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { projects } from "@/lib/studio";

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="studio-text-link" href={href}>
      {children}
      <ArrowUpRight size={19} aria-hidden="true" />
    </Link>
  );
}
export function PageIntro({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <header className="studio-container studio-page-intro">
      <p className="studio-eyebrow">{label}</p>
      <h1>{title}</h1>
      <div className="studio-intro-copy">{children}</div>
    </header>
  );
}
export function ProjectCard({
  project,
  index = 0,
}: {
  project: (typeof projects)[number];
  index?: number;
}) {
  return (
    <article className="studio-project">
      <Link
        href={`/projects/${project.slug}`}
        className={`studio-project-art studio-${project.color}`}
        aria-label={`Explore ${project.name}`}
      >
        <div className="studio-art-top">
          <span>{project.category}</span>
          <ArrowUpRight size={22} aria-hidden="true" />
        </div>
        {project.image ? (
          <div className="studio-browser">
            <div className="studio-browser-bar">
              <i />
              <i />
              <i />
              <span>{project.name}</span>
            </div>
            <Image
              src={project.image}
              alt={project.alt}
              width={1200}
              height={800}
              sizes="(max-width: 760px) 92vw, 48vw"
              className="studio-project-image"
              priority={index === 0}
            />
          </div>
        ) : (
          <div className="studio-project-type">
            <span>
              {project.slug === "frosty-snoballs"
                ? "A little flavor."
                : "Built for business."}
            </span>
            <strong>{project.name}</strong>
            <span>
              {project.slug === "frosty-snoballs"
                ? "A local business, online."
                : "Clarity from the first click."}
            </span>
          </div>
        )}
        <span className="studio-art-label">{project.kind}</span>
      </Link>
      <div className="studio-project-caption">
        <h3>
          <Link href={`/projects/${project.slug}`}>{project.name}</Link>
        </h3>
        <span>{project.category}</span>
      </div>
      <p>{project.summary}</p>
    </article>
  );
}
export function ContactBand() {
  return (
    <section className="studio-contact-band">
      <div className="studio-container">
        <p className="studio-eyebrow">Have something in mind?</p>
        <Link href="/contact" className="studio-big-link">
          Let’s make it work.
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <div className="studio-band-bottom">
          <p>A new website. A better system. A problem worth solving.</p>
          <Link href="/contact" className="studio-button studio-button-light">
            Start a conversation
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
