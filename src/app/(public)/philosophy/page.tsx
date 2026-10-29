import {
  PageIntro,
  ContactBand,
  TextLink,
} from "@/components/marketing/Studio";
export default function Philosophy() {
  return (
    <>
      <PageIntro label="Our approach" title="Useful is the point.">
        <p>
          A website should help someone understand, decide, or do something. A
          system should make work easier. That’s where we start.
        </p>
      </PageIntro>
      <section className="studio-container studio-case-story">
        <h2>
          Clear goals.
          <br />
          Considered decisions.
        </h2>
        <div>
          <h3>Understand the job</h3>
          <p>
            We ask who will use the site, what they need, and how the work
            happens today. The answer shapes the pages and features.
          </p>
          <h3>Make it understandable</h3>
          <p>
            Readable text, direct navigation, and clear feedback help people use
            your technology with confidence.
          </p>
          <h3>Build for what comes next</h3>
          <p>
            We consider maintenance, ownership, and the handover while we build,
            so you have a practical way forward after launch.
          </p>
          <TextLink href="/services">See how we can help</TextLink>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
