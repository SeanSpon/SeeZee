import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    })
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always send users to your dashboard on login
      if (url.startsWith("/")) return baseUrl + url;
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) return url;
      } catch {}
      return `${baseUrl}/dashboard/overview`;
    },
  },
  // Keep debug on while fixing login
  debug: true,
} satisfies NextAuthConfig;