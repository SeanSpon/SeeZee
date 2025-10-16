"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Rocket } from "lucide-react";
import { NavLink } from "@/components/navbar/NavLink";
import { Notifications } from "@/components/navbar/Notifications";
import { ContextPill } from "@/components/navbar/ContextPill";
import { ProfileMenu } from "@/components/navbar/ProfileMenu";
import { MobileMenu } from "@/components/navbar/MobileMenu";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Determine user context and role
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "CEO" || session?.user?.role === "STAFF";
  const isClient = session?.user?.role === "CLIENT" || !session?.user?.role;
  
  // Determine current context based on pathname
  const currentContext = pathname?.startsWith("/admin") ? "Admin" : "Client";

  return (
    <>
      <header role="banner" className="fixed inset-x-0 top-0 z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto h-[var(--nav-h)] flex items-center gap-3 px-4 lg:px-6">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Brand */}
          <Link href="/" className="font-extrabold tracking-tight text-xl lg:text-2xl">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SEEZEE
            </span>
          </Link>

          {/* Primary Nav - Desktop */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-1 ml-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/services">Services</NavLink>
            <NavLink href="/projects">Projects</NavLink>
          </nav>

          <div className="flex-1" />

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Context Pill - Show only if authenticated */}
            {session && (
              <ContextPill
                currentContext={currentContext}
                hasAdminAccess={isAdmin}
                hasClientAccess={true}
              />
            )}

            {/* Notifications */}
            {session && <Notifications />}

            {/* Start a Project CTA - Desktop */}
            <Link
              href="/start"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-3 lg:px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              <Rocket className="h-4 w-4" />
              <span className="hidden lg:inline">Start a Project</span>
            </Link>

            {/* Profile Menu */}
            <ProfileMenu user={session?.user} />
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}