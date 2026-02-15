"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Home, Briefcase, FolderKanban, Rocket, Users, Heart, BookOpen, FileText } from "lucide-react";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/partners", label: "Partners", icon: Heart },
  { href: "/blog", label: "Blog", icon: FileText },
  { href: "/about", label: "About", icon: Users },
  { href: "/start", label: "Start a Project", icon: Rocket },
];

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 left-0 z-[60] w-[85vw] max-w-sm bg-slate-900/95 backdrop-blur-xl border-r border-white/10 md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="font-extrabold text-xl">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SEEZEE
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Primary navigation">
            <div className="space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href + "/"));
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    data-active={isActive}
                    aria-current={isActive ? "page" : undefined}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors
                               data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-500/20 data-[active=true]:to-purple-500/20
                               data-[active=true]:border data-[active=true]:border-blue-500/30 data-[active=true]:text-white"
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer CTA */}
          <div className="border-t border-white/10 p-4">
            <Link
              href="/start"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              <Rocket className="h-4 w-4" />
              Start a Project
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
