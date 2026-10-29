import {
  PageIntro,
  ContactBand,
  TextLink,
  ProjectCard,
} from "@/components/marketing/Studio";
import { projects } from "@/lib/studio";
export default function ProjectsPage() {
  return (
    <>
      <PageIntro label="Selected work" title="Ideas, put to work.">
        <p>
          Websites for local businesses. Platforms for community organizations.
          A few experiments in what’s possible.
        </p>
      </PageIntro>
      <section
        className="studio-container studio-project-grid studio-portfolio"
        aria-label="Client projects"
      >
        {projects
          .filter((p) => p.kind === "Client work")
          .map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
      </section>
      <section className="studio-container studio-experiments">
        <div className="studio-section-heading">
          <div>
            <p className="studio-eyebrow">Studio experiments</p>
            <h2>Room to explore.</h2>
            <p>
              Interface prototypes and competition projects. These demos show
              the experience; they aren’t production services.
            </p>
          </div>
        </div>
        <div className="studio-project-grid">
          {projects
            .filter((p) => p.kind === "Prototype")
            .map((project) => (
              <ProjectCard key={project.slug} project={project} index={3} />
            ))}
        </div>
      </section>
      <section className="studio-container studio-note">
        <p className="studio-eyebrow">Built for our own work</p>
        <h2>The SeeZee platform.</h2>
        <p>
          We use our own client portal and operations system to manage projects,
          intake, communication, and billing.
        </p>
        <TextLink href="/projects/seezee-platform">
          Explore the platform
        </TextLink>
      </section>
      <ContactBand />
    </>
  );
}
