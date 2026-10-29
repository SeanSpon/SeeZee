import Image from "next/image";
import {
  PageIntro,
  ContactBand,
  TextLink,
} from "@/components/marketing/Studio";
export default function AboutPage() {
  return (
    <>
      <PageIntro label="The studio" title="People first. Thoughtfully built.">
        <p>
          We’re SeeZee Studios, an independent web and software studio based in
          Louisville, Kentucky. We work with businesses and nonprofits that need
          their technology to do more.
        </p>
      </PageIntro>
      <section className="studio-container studio-about-preview studio-about-main">
        <div className="studio-team-photo">
          <Image
            src="/sean-zach-photo.jpg"
            alt="The SeeZee Studios team"
            width={1000}
            height={750}
            priority
            sizes="(max-width: 760px) 92vw, 45vw"
          />
        </div>
        <div>
          <p className="studio-eyebrow">Meet Sean & Zach</p>
          <h2>The people behind the work.</h2>
          <p>
            Sean McCulloch leads development and technical problem-solving. Zach
            Robards focuses on client relationships and project direction.
          </p>
          <p>
            We bring those perspectives together to turn a business need into a
            website or system people can actually use.
          </p>
          <TextLink href="/contact">Work with us</TextLink>
        </div>
      </section>
      <section className="studio-container studio-process">
        <p className="studio-eyebrow">How we work</p>
        <div className="studio-three-col">
          {[
            [
              "Clear conversations",
              "You should understand what we’re building, why it matters, and what comes next.",
            ],
            [
              "Useful by design",
              "We build around your visitors and your team, with readable content, straightforward navigation, and accessible interactions.",
            ],
            [
              "Care after launch",
              "We plan for the handover, updates, and support that help your technology stay useful.",
            ],
          ].map(([title, body]) => (
            <div key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <ContactBand />
    </>
  );
}
