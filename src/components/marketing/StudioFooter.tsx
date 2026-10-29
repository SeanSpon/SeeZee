import Link from "next/link";
import { studio } from "@/lib/studio";
export default function StudioFooter() {
  return (
    <footer className="studio-footer">
      <div className="studio-container">
        <div className="studio-footer-top">
          <div>
            <Link
              href="/"
              className="studio-wordmark"
              aria-label="SeeZee Studios home"
            >
              seezee<span>↗</span>
              <small>STUDIOS</small>
            </Link>
            <p>
              Thoughtful websites. Useful systems.
              <br />
              Built in Louisville, Kentucky.
            </p>
          </div>
          <div>
            <span className="studio-eyebrow">Say hello</span>
            <a href={`mailto:${studio.email}`}>{studio.email}</a>
            <a href={`tel:${studio.phoneHref}`}>{studio.phone}</a>
          </div>
          <nav aria-label="Footer navigation">
            <span className="studio-eyebrow">Explore</span>
            <Link href="/projects">Work</Link>
            <Link href="/services">Services</Link>
            <Link href="/about">Studio</Link>
            <Link href="/partners">Partners</Link>
            <Link href="/blog">Journal</Link>
          </nav>
        </div>
        <div className="studio-footer-bottom">
          <span>© {new Date().getFullYear()} SeeZee Studios</span>
          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/accessibility">Accessibility</Link>
            <Link href="/cookies">Cookies</Link>
            <a
              href="https://github.com/SeanSpon"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
