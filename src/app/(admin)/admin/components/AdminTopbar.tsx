"use client";
import Link from "next/link";
import { Search } from "lucide-react";
import { ADMIN_ROUTES } from "../routes";

export default function AdminTopbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 backdrop-blur-2xl px-4 py-3">
          <Link href="/admin/overview" className="font-semibold tracking-wide">SEEZEE</Link>
          <nav className="hidden gap-6 md:flex text-sm text-white/80">
            {ADMIN_ROUTES.map((route) => (
              <Link key={route.href} href={route.href} className="hover:text-white">
                {route.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-white/70">
            <Search size={18} />
            <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10" />
          </div>
        </div>
      </div>
    </header>
  );
}