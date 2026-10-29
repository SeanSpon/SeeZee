import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  ProjectCard,
  ContactBand,
  TextLink,
} from "@/components/marketing/Studio";
import { projects, services } from "@/lib/studio";
import { generatePageMetadata } from "@/lib/metadata";
export const metadata = generatePageMetadata({
  title: "Web Design & Custom Development in Louisville",
  description:
    "SeeZee Studios builds thoughtful websites, custom web apps, and practical automation for businesses and nonprofits in Louisville, Kentucky and beyond.",
  path: "/",
});
export default function HomePage() {
  return (
    <>
      <section className="studio-hero">
        <div className="studio-container">
          <div className="studio-hero-kicker">
            <p className="studio-eyebrow">
              <span className="studio-dot" />
              Louisville web design & development
            </p>
            <span>Louisville, KY · Working everywhere</span>
          </div>
          <h1>
            Websites that
            <br />
            <span>mean business.</span>
            <ArrowDownRight aria-hidden="true" />
          </h1>
          <div className="studio-hero-bottom">
            <p>
              We design websites and build systems that make your business
              easier to find, easier to trust, and easier to run.
            </p>
            <div>
              <Link href="/projects" className="studio-button">
                Explore our work
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <TextLink href="/contact">Tell us what you’re thinking</TextLink>
            </div>
          </div>
          <div className="studio-hero-proof">
            <span>Custom websites & web apps</span>
            <span>Business systems & automation</span>
            <span>Direct support from Sean & Zach</span>
          </div>
        </div>
      </section>
      <section
        className="studio-container studio-work-section"
        aria-labelledby="selected-work"
      >
        <div className="studio-section-heading">
          <h2 id="selected-work">
            Selected work<span>01—03</span>
          </h2>
          <TextLink href="/projects">All projects</TextLink>
        </div>
        <div className="studio-project-grid">
          {projects.slice(0, 2).map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
        <Link href="/projects/taxfeeder" className="studio-work-row">
          <span>03</span>
          <h3>TaxFeeder Software</h3>
          <span>Business website</span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </section>
      <section className="studio-services-section">
        <div className="studio-container studio-split">
          <div>
            <p className="studio-eyebrow">What we bring to the table</p>
            <h2>
              A better website.
              <br />
              And what comes next.
            </h2>
            <p>
              From your first impression to the tools behind the scenes, we
              connect the pieces that help your organization move forward.
            </p>
            <TextLink href="/services">Explore our services</TextLink>
          </div>
          <div>
            {services.map((service) => (
              <Link
                className="studio-service-row"
                href={`/services/${service.slug}`}
                key={service.slug}
              >
                <span>{service.number}</span>
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.short}</p>
                </div>
                <ArrowUpRight size={22} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="studio-container studio-process">
        <div className="studio-section-heading">
          <div>
            <p className="studio-eyebrow">A straightforward process</p>
            <h2>Good work starts with a conversation.</h2>
          </div>
        </div>
        <div className="studio-three-col">
          {[
            [
              "01",
              "Understand",
              "We listen, ask questions, and figure out what needs to change.",
            ],
            [
              "02",
              "Design & build",
              "We agree on the scope, shape the experience, and build it with you in the loop.",
            ],
            [
              "03",
              "Launch & support",
              "We check the details, get it live, and plan the support you need next.",
            ],
          ].map(([n, title, body]) => (
            <div key={n}>
              <span className="studio-process-number">{n}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="studio-container studio-about-preview">
        <div className="studio-team-photo">
          <Image
            src="/sean-zach-photo.jpg"
            alt="The SeeZee Studios team"
            width={1000}
            height={750}
            sizes="(max-width: 760px) 92vw, 45vw"
          />
        </div>
        <div>
          <p className="studio-eyebrow">Small team. Direct connection.</p>
          <h2>You’ll know the people building it.</h2>
          <p>
            We’re Sean and Zach. We started SeeZee to build useful technology
            for businesses, nonprofits, and the communities around us.
          </p>
          <p>
            You work directly with us, from the first conversation through the
            details after launch.
          </p>
          <TextLink href="/about">Meet the studio</TextLink>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
