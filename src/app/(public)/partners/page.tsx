import {
  PageIntro,
  ContactBand,
  TextLink,
} from "@/components/marketing/Studio";
export default function Partners() {
  return (
    <>
      <PageIntro
        label="Community & collaboration"
        title="Better work, together."
      >
        <p>
          We work with local businesses, nonprofits, and community organizations
          to make useful technology easier to access.
        </p>
      </PageIntro>
      <section className="studio-container studio-case-story">
        <div>
          <p className="studio-eyebrow">Community connection</p>
          <h2>
            Michael Robards
            <br />& The Human Equation
          </h2>
        </div>
        <div>
          <p>
            Michael Robards is a Licensed Clinical Social Worker connected with
            The Human Equation, a mental health and wellness practice.
          </p>
          <p>
            Our role in community projects is technology: websites, systems, and
            practical tools for the people providing services.
          </p>
          <a
            className="studio-text-link"
            href="https://humanequation.live"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit The Human Equation ↗
          </a>
        </div>
      </section>
      <section className="studio-container studio-note">
        <h2>Have a project in common?</h2>
        <p>
          We’re interested in collaborations with organizations that need a
          thoughtful website or a better way to manage their work.
        </p>
        <TextLink href="/projects">Explore the work</TextLink>
      </section>
      <ContactBand />
    </>
  );
}
