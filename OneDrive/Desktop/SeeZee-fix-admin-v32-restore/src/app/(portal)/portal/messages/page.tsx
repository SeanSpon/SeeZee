import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getMessages() {
  try {
    return await prisma.message.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export default async function PortalMessagesPage() {
  const messages = await getMessages();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Messages</h1>
          <p className="text-gray-400">Customer messages and communication</p>
        </div>
        <div className="text-sm text-gray-400">
          {messages.length} total messages
        </div>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
            <p className="text-gray-400">No messages yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Messages will appear here when customers contact you
            </p>
          </div>
        ) : (
          messages.map((message: any) => (
            <div
              key={message.id}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{message.name}</h3>
                  <p className="text-gray-400">{message.email}</p>
                  {message.subject && (
                    <p className="text-sm text-blue-400 font-medium">{message.subject}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    message.status === 'UNREAD' ? 'bg-blue-500/20 text-blue-300' :
                    message.status === 'READ' ? 'bg-gray-500/20 text-gray-300' :
                    message.status === 'REPLIED' ? 'bg-green-500/20 text-green-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {message.status?.toUpperCase() || 'UNREAD'}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Message:</p>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-gray-200">{message.content}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                  Mark Read
                </button>
                <button className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                  Reply
                </button>
                <button className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors">
                  Archive
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}