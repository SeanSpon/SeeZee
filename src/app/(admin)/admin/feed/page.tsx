import { prisma } from "@/lib/prisma";
import { MessageSquare, Send, Hash, Users } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getUsers() {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function FeedPage() {
  const users = await getUsers();

  // Mock channels for now - you can add these to Prisma schema later
  const channels = [
    { id: "general", name: "general", description: "Team-wide announcements and updates" },
    { id: "projects", name: "projects", description: "Project discussions and updates" },
    { id: "support", name: "support", description: "Client support and questions" },
    { id: "dev", name: "dev", description: "Development and technical discussions" },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Channels Sidebar */}
      <div className="w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="mb-6">
          <h2 className="text-white font-bold text-lg mb-2">Channels</h2>
          <p className="text-slate-400 text-xs">Team communication</p>
        </div>

        <div className="space-y-2 mb-6">
          {channels.map((channel) => (
            <button
              key={channel.id}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-200 text-left"
            >
              <Hash size={16} />
              <div className="flex-1">
                <p className="text-sm font-medium">{channel.name}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4">
          <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-3">Team Members</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-slate-300 truncate">{user.name || user.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed Area */}
      <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col">
        {/* Channel Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Hash size={24} className="text-purple-400" />
            <div>
              <h2 className="text-white font-bold text-xl">general</h2>
              <p className="text-slate-400 text-sm">Team-wide announcements and updates</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Empty State */}
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No messages yet</p>
              <p className="text-slate-500 text-sm">Start the conversation by sending a message below</p>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center gap-2">
              <Send size={18} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
