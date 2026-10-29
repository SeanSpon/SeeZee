import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, ContactBand } from "@/components/marketing/Studio";
import { services } from "@/lib/studio";
export default function ServicesPage() {
  return (
    <>
      <PageIntro label="Our services" title="Built around what you need.">
        <p>
          Websites, custom systems, and ongoing support for businesses and
          nonprofits. Start with the problem. We’ll help you work out the right
          solution.
        </p>
      </PageIntro>
      <div className="studio-container">
        {services.map((service) => (
          <section className="studio-service-detail" key={service.slug}>
            <span className="studio-eyebrow">
              {service.number} / {service.name}
            </span>
            <div>
              <h2>{service.short}</h2>
              <p>{service.description}</p>
              <ul className="studio-check-list">
                {service.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link
                href={`/services/${service.slug}`}
                className="studio-text-link"
              >
                Explore {service.name.toLowerCase()}
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </section>
        ))}
      </div>
      <section className="studio-container studio-note">
        <h2>A clear scope before we start.</h2>
        <p>
          Every project has different needs. We’ll discuss your goals, agree on
          the deliverables, and provide a project-specific proposal. Ongoing
          support is scoped separately so you know what’s included.
        </p>
      </section>
      <ContactBand />
    </>
  );
}
