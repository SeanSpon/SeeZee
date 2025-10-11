import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,
  trustHost: true,
  session: { strategy: "jwt" },

  pages: { 
    signIn: "/login", 
    error: "/login",
    verifyRequest: "/verify",
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  
  events: {
    // Fires after PrismaAdapter creates user on first sign-in
    async createUser({ user }) {
      // CEO whitelist - auto-upgrade to CEO/STAFF with completed onboarding
      const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com"];
      if (CEO_EMAILS.includes(user.email!)) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "CEO",
            accountType: "STAFF",
            tosAcceptedAt: new Date(),
            profileDoneAt: new Date(),
          },
        });
        console.log(`✅ CEO account created for ${user.email}`);
        return;
      }

      // Default new sign-ins to CLIENT
      // Note: STAFF users are upgraded via 6-digit invitation codes in the onboarding flow
      await prisma.user.update({
        where: { id: user.id },
        data: {
          accountType: "CLIENT",
          role: "CLIENT",
        },
      });
      console.log(`✅ CLIENT account created for ${user.email}`);
    },
  },
  
  callbacks: {
    async signIn({ user }) {
      // Allow all sign-ins - PrismaAdapter handles user creation
      // events.createUser will set the appropriate role/accountType
      return true;
    },

    async session({ session, token }) {
      // Populate session from JWT token (Edge-safe, no DB query)
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).accountType = token.accountType;
        (session.user as any).tosAcceptedAt = token.tosAcceptedAt;
        (session.user as any).profileDoneAt = token.profileDoneAt;
      }
      return session;
    },

    async jwt({ token, user, trigger, session: updateSession }) {
      // Initial sign in - fetch user data and add to token
      // This runs in Node.js context (not Edge), so Prisma is available
      if (user) {
        try {
          // Fetch complete user data from database to populate JWT
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              role: true,
              accountType: true,
              tosAcceptedAt: true,
              profileDoneAt: true,
            },
          });
          
          if (dbUser) {
            token.role = dbUser.role;
            token.accountType = dbUser.accountType;
            token.tosAcceptedAt = dbUser.tosAcceptedAt?.toISOString();
            token.profileDoneAt = dbUser.profileDoneAt?.toISOString();
          } else {
            // Fallback for new users
            token.role = "CLIENT";
            token.accountType = "CLIENT";
          }
        } catch (error) {
          console.error("Failed to fetch user in JWT callback:", error);
          // Fallback values
          token.role = "CLIENT";
          token.accountType = "CLIENT";
        }
      }

      // Handle session updates from onboarding pages
      if (trigger === "update" && updateSession) {
        token.role = updateSession.role || token.role;
        token.accountType = updateSession.accountType || token.accountType;
        token.tosAcceptedAt = updateSession.tosAcceptedAt || token.tosAcceptedAt;
        token.profileDoneAt = updateSession.profileDoneAt || token.profileDoneAt;
        token.name = updateSession.name || token.name;
      }

      return token;
    },

    async redirect({ url, baseUrl }) {
      // Handle relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Handle absolute URLs
      try {
        const parsedUrl = new URL(url);
        // Allow redirects within the same origin
        if (parsedUrl.origin === baseUrl) return url;
      } catch {}
      // Default to baseUrl for any other case
      return baseUrl;
    },
  },
  
  debug: true,
});