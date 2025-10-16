import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

// Validate environment variables
const GOOGLE_ID = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET missing");
if (!GOOGLE_ID || !GOOGLE_SECRET) throw new Error("Google OAuth envs missing");

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
      clientId: GOOGLE_ID!,
      clientSecret: GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: false,
      authorization: { 
        params: { 
          prompt: "consent", 
          access_type: "offline", 
          response_type: "code" 
        } 
      },
    }),
  ],
  
  events: {
    // Fires after PrismaAdapter creates user on first sign-in
    async createUser({ user }) {
      // CEO whitelist - auto-upgrade to CEO with completed onboarding
      const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com"];
      if (CEO_EMAILS.includes(user.email!)) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "CEO",
            tosAcceptedAt: new Date(),
            profileDoneAt: new Date(),
          },
        });
        console.log(`✅ CEO account created for ${user.email}`);
        return;
      }

      // Default new sign-ins to CLIENT
      // Note: STAFF/ADMIN users are upgraded via 6-digit invitation codes or admin panel
      await prisma.user.update({
        where: { id: user.id },
        data: {
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
      // IMPORTANT: Always fetch fresh role from database
      // This ensures manual role changes in DB are immediately reflected
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: {
            id: true,
            role: true,
            tosAcceptedAt: true,
            profileDoneAt: true,
          },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.tosAcceptedAt = dbUser.tosAcceptedAt;
          session.user.profileDoneAt = dbUser.profileDoneAt;
        } else {
          // Fallback to token values if DB query fails
          session.user.id = token.sub!;
          session.user.role = (token.role as any) || "CLIENT";
          session.user.tosAcceptedAt = token.tosAcceptedAt as any;
          session.user.profileDoneAt = token.profileDoneAt as any;
        }
      } catch (error) {
        console.error("Failed to fetch user in session callback:", error);
        // Fallback to token values
        session.user.id = token.sub!;
        session.user.role = (token.role as any) || "CLIENT";
        session.user.tosAcceptedAt = token.tosAcceptedAt as any;
        session.user.profileDoneAt = token.profileDoneAt as any;
      }

      return session;
    },

    async jwt({ token, user, trigger, session: updateSession }) {
      // Initial sign in OR trigger refresh - fetch fresh user data from database
      // This ensures role changes in DB are picked up on next sign-in
      if (user || trigger === "update") {
        try {
          // Always fetch latest user data from database to catch role changes
          const email = user?.email || token.email;
          const dbUser = await prisma.user.findUnique({
            where: { email: email as string },
            select: {
              id: true,
              role: true,
              tosAcceptedAt: true,
              profileDoneAt: true,
            },
          });
          
          if (dbUser) {
            token.role = dbUser.role;
            token.tosAcceptedAt = dbUser.tosAcceptedAt?.toISOString();
            token.profileDoneAt = dbUser.profileDoneAt?.toISOString();
            console.log(`🔄 JWT refreshed for ${email}: role=${dbUser.role}`);
          } else {
            // Fallback for new users
            token.role = "CLIENT";
          }
        } catch (error) {
          console.error("Failed to fetch user in JWT callback:", error);
          // Fallback values
          token.role = "CLIENT";
        }
      }

      // Handle explicit session updates from onboarding pages
      if (trigger === "update" && updateSession) {
        token.role = updateSession.role || token.role;
        token.tosAcceptedAt = updateSession.tosAcceptedAt || token.tosAcceptedAt;
        token.profileDoneAt = updateSession.profileDoneAt || token.profileDoneAt;
        token.name = updateSession.name || token.name;
      }

      return token;
    },

    async redirect({ url, baseUrl }) {
      // Handle relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Handle absolute URLs - allow same origin
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.origin === baseUrl) return url;
      } catch {}
      // Default to baseUrl
      return baseUrl;
    },
  },
  
  debug: true,
});