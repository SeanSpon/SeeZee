import { UserRole } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      tosAcceptedAt: Date | null;
      profileDoneAt: Date | null;
      questionnaireCompleted: Date | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    tosAcceptedAt: Date | null;
    profileDoneAt: Date | null;
    questionnaireCompleted: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    tosAcceptedAt: Date | null;
    profileDoneAt: Date | null;
    questionnaireCompleted: string | null;
  }
}