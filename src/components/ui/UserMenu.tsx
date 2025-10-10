"use client";
import { signOut } from "next-auth/react";

export function UserMenu({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null } }) {
  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      {user.image && <img src={user.image} alt="" className="h-8 w-8 rounded-full"/>}
      <div className="text-sm">
        <div className="font-medium">{user.name ?? "User"}</div>
        <div className="text-zinc-500">{user.email}</div>
      </div>
      <button onClick={() => signOut()} className="rounded-md border px-3 py-1">Sign out</button>
    </div>
  );
}