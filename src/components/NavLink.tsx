"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      data-active={active}
      className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors
                 relative after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:rounded-full
                 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 after:opacity-0
                 after:transition-opacity after:duration-300
                 data-[active=true]:text-white data-[active=true]:after:opacity-100"
    >
      {children}
    </Link>
  );
}
