import { auth } from "@/auth";
import { UserMenu } from "@/components/ui/UserMenu";

export default async function AdminLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="font-semibold text-white text-xl">SeeZee Admin</div>
        <UserMenu user={session?.user} />
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
