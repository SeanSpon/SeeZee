'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, ListChecks, Receipt, Wrench, Link2, GraduationCap, 
  Database, Users, FolderOpen, MessageSquare, UsersRound, Settings, 
  BarChart3, Wallet, Server 
} from "lucide-react";
import { ADMIN_ROUTES, CEO_ROUTES } from "../routes";

const iconMap: Record<string, any> = {
  LayoutDashboard, MessageSquare, Users, FolderOpen, Receipt, UsersRound,
  ListChecks, GraduationCap, Wrench, Link2, Database, Settings,
  BarChart3, Wallet, Server
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isCEO = session?.user?.role === "CEO";

  return (
    <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 p-6 z-40 overflow-y-auto pb-20">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <div>
            <h1 className="text-white font-black text-xl">SEEZEE</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {ADMIN_ROUTES.map((route) => {
          const Icon = iconMap[route.icon] || LayoutDashboard;
          const isActive = pathname === route.href;
          
          return (
            <Link 
              key={route.href} 
              href={route.href} 
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 text-white border border-purple-500/30' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {route.label}
            </Link>
          );
        })}
      </nav>

      {/* CEO-Only Section */}
      {isCEO && (
        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-amber-500 uppercase tracking-wider mb-3 px-4 flex items-center gap-2">
            <span>👑</span> CEO Only
          </p>
          <nav className="space-y-2">
            {CEO_ROUTES.map((route) => {
              const Icon = iconMap[route.icon] || LayoutDashboard;
              const isActive = pathname === route.href;
              
              return (
                <Link 
                  key={route.href} 
                  href={route.href} 
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 text-white border border-amber-500/30' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {route.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
  );
}