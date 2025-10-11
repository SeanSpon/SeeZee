import { UserRole, AccountType } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      accountType: AccountType;
      tosAcceptedAt: Date | null;
      profileDoneAt: Date | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    accountType: AccountType;
    tosAcceptedAt: Date | null;
    profileDoneAt: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    accountType: AccountType;
    tosAcceptedAt: Date | null;
    profileDoneAt: Date | null;
  }
}