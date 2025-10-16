import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Portal Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">SeeZee Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                {session.user?.name || session.user?.email}
              </span>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                {session.user?.role}
              </span>
              <a 
                href="/logout"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Portal Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}