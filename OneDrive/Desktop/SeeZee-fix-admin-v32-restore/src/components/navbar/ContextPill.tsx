"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Crown, User, Sparkles, Zap } from "lucide-react";

interface ContextPillProps {
  currentContext: "Client" | "Admin";
  hasAdminAccess?: boolean;
  hasClientAccess?: boolean;
}

export function ContextPill({ currentContext, hasAdminAccess = false, hasClientAccess = true }: ContextPillProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleSwitch = (context: "Client" | "Admin") => {
    setOpen(false);
    const url = context === "Admin" ? "/admin" : "/client";
    router.push(url);
  };

  // If user only has one context, show static pill
  const canSwitch = hasAdminAccess && hasClientAccess;
  
  const isAdmin = currentContext === "Admin";
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => canSwitch ? setOpen(!open) : router.push(isAdmin ? "/admin" : "/client")}
        className={`
          group relative overflow-hidden rounded-full px-4 py-2 text-sm font-semibold
          transition-all duration-300 hover:scale-105 active:scale-95
          ${canSwitch ? "cursor-pointer" : "cursor-pointer"}
        `}
      >
        {/* Animated gradient background */}
        <div 
          className={`
            absolute inset-0 transition-all duration-500
            ${isAdmin 
              ? "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" 
              : "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"
            }
            bg-[length:200%_100%] group-hover:bg-[position:100%_0]
          `}
        />
        
        {/* Glow effect */}
        <div 
          className={`
            absolute inset-0 blur-xl opacity-50 transition-opacity duration-300
            ${isAdmin 
              ? "bg-gradient-to-r from-purple-400 to-pink-400" 
              : "bg-gradient-to-r from-blue-400 to-cyan-400"
            }
            group-hover:opacity-75
          `}
        />
        
        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite"
          }}
        />

        {/* Content */}
        <div className="relative flex items-center gap-2 text-white">
          {isAdmin ? (
            <>
              <Crown className="h-4 w-4 animate-pulse" />
              <span className="font-bold tracking-wide">ADMIN</span>
              <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: "3s" }} />
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span className="font-semibold tracking-wide">CLIENT</span>
              <User className="h-3 w-3" />
            </>
          )}
          
          {canSwitch && (
            <ChevronDown 
              className={`h-3 w-3 ml-1 transition-transform duration-300 ${open ? "rotate-180" : ""}`} 
            />
          )}
        </div>
      </button>

      {/* Dropdown for role switching */}
      {canSwitch && open && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-[60]"
          style={{
            animation: "slideDown 0.2s ease-out"
          }}
        >
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Switch Context
            </div>
            
            {hasClientAccess && (
              <button
                onClick={() => handleSwitch("Client")}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all
                  ${currentContext === "Client" 
                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30" 
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Client Portal</div>
                  <div className="text-xs text-slate-400">Projects & Invoices</div>
                </div>
                {currentContext === "Client" && (
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                )}
              </button>
            )}
            
            {hasAdminAccess && (
              <button
                onClick={() => handleSwitch("Admin")}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all mt-2
                  ${currentContext === "Admin" 
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30" 
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Admin Dashboard</div>
                  <div className="text-xs text-slate-400">Full Control</div>
                </div>
                {currentContext === "Admin" && (
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
