import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: { 
        params: { 
          redirect_uri: "http://localhost:3000/api/auth/callback/google" 
        } 
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Set role based on email for now
        if (user.email === "seanspm1007@gmail.com" || user.email === "seezee.enterprises@gmail.com") {
          token.role = "ADMIN";
        } else {
          token.role = "CLIENT";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role ?? "CLIENT";
      }
      return session;
    },
  },
  debug: true,
});