"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ClientMessagesPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: string; body: string; senderId: string; createdAt: string }>
  >([]);

  const handleSend = async () => {
    if (!message.trim()) return;

    // TODO: Implement real message sending via API
    const newMessage = {
      id: Date.now().toString(),
      body: message,
      senderId: "current-user",
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Messages</h2>
        <p className="text-slate-400 mt-1">
          Communicate with the SeeZee team about your projects
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        {/* Messages Area */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderId === "current-user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    msg.senderId === "current-user"
                      ? "bg-cyan-500/20 border border-cyan-500/30"
                      : "bg-slate-700/50 border border-white/10"
                  }`}
                >
                  <p className="text-white">{msg.body}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
