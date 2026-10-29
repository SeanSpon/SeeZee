"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
const links = [
  { href: "/projects", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "Studio" },
  { href: "/contact", label: "Contact" },
];
export default function StudioHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const { data: session } = useSession();
  useEffect(() => setOpen(false), [pathname]);
  const role = session?.user?.role;
  const portal =
    role &&
    [
      "CEO",
      "CFO",
      "FRONTEND",
      "BACKEND",
      "OUTREACH",
      "ADMIN",
      "STAFF",
    ].includes(role)
      ? "/admin"
      : session
        ? "/client"
        : "/login";
  return (
    <header
      className="studio-header"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <div className="studio-container studio-header-inner">
        <Link
          href="/"
          className="studio-wordmark"
          aria-label="SeeZee Studios home"
        >
          seezee<span>↗</span>
          <small>STUDIOS</small>
        </Link>
        <nav aria-label="Main navigation" className="studio-desktop-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                pathname?.startsWith(link.href) ? "page" : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="studio-header-actions">
          <Link href={portal} className="studio-portal">
            {session ? "Dashboard" : "Client login"}
          </Link>
          <Link href="/contact" className="studio-button studio-header-cta">
            Let’s talk
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <button
            ref={button}
            type="button"
            className="studio-menu-button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="studio-mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <nav
        id="studio-mobile-nav"
        aria-label="Mobile navigation"
        className="studio-mobile-nav"
        hidden={!open}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname?.startsWith(link.href) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
            <ArrowUpRight size={20} />
          </Link>
        ))}
        <Link href={portal} onClick={() => setOpen(false)}>
          {session ? "Dashboard" : "Client login"}
        </Link>
      </nav>
    </header>
  );
}
