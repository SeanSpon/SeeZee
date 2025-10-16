import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DebugSessionPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      <pre className="bg-slate-900 p-4 rounded overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
      <div className="mt-4">
        <a href="/api/auth/signout" className="px-4 py-2 bg-red-500 rounded">
          Sign Out & Sign In Again
        </a>
      </div>
    </div>
  );
}
