"use client";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { GlowButton } from "../../components/ui/glow-button";

export default function LogoutPage() {
  useEffect(() => {
    // Auto-logout after component mounts
    const timer = setTimeout(() => {
      signOut({ callbackUrl: "/" });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 shadow-lg max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="text-4xl mb-4">👋</div>
          <h1 className="text-2xl font-bold text-white mb-4">Signing you out...</h1>
          <p className="text-white/70">You will be redirected to the homepage shortly.</p>
        </div>
        
        <GlowButton 
          onClick={() => signOut({ callbackUrl: "/" })} 
          className="w-full"
          size="lg"
        >
          Sign out now
        </GlowButton>
      </div>
    </main>
  );
}