import { PageIntro } from "@/components/marketing/Studio";
import ContactForm from "@/components/marketing/ContactForm";
import { studio } from "@/lib/studio";
export default function ContactPage() {
  return (
    <>
      <PageIntro label="Start a conversation" title="What are you working on?">
        <p>
          Tell us what you want to build or what needs fixing. We’ll review the
          details and talk through the next step with you.
        </p>
      </PageIntro>
      <section className="studio-container studio-contact-layout">
        <aside>
          <p className="studio-eyebrow">Direct to the studio</p>
          <a className="studio-contact-address" href={`mailto:${studio.email}`}>
            {studio.email}
          </a>
          <a
            className="studio-contact-address"
            href={`tel:${studio.phoneHref}`}
          >
            {studio.phone}
          </a>
          <p>
            Louisville, Kentucky
            <br />
            Working with businesses and nonprofits locally and remotely.
          </p>
          <div className="studio-contact-next">
            <h2>What happens next</h2>
            <ol>
              <li>We read your message and review what you need.</li>
              <li>We get in touch with questions or a time to talk.</li>
              <li>We agree on a scope and proposal before work begins.</li>
            </ol>
          </div>
        </aside>
        <ContactForm />
      </section>
    </>
  );
}
