"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  role: string;
  createdAt: string;
}

interface Thread {
  id: string;
  subject: string;
  messages: Message[];
  project?: {
    id: string;
    name: string;
  };
}

export default function ClientMessagesPage() {
  const [message, setMessage] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (activeThread) {
      loadMessages(activeThread);
    }
  }, [activeThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadThreads = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
        if (data.length > 0 && !activeThread) {
          setActiveThread(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading threads:", error);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/messages/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !activeThread) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: activeThread,
          content: message,
        }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages([...messages, newMessage]);
        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const currentThread = threads.find(t => t.id === activeThread);

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Messages</h2>
          <p className="admin-page-subtitle">
            Communicate with the SeeZee team about your projects
          </p>
        </div>
        {currentThread?.project && (
          <span className="text-sm text-slate-400">
            Project: <span className="text-white font-medium">{currentThread.project.name}</span>
          </span>
        )}
      </div>

      {/* Thread Selector */}
      {threads.length > 1 && (
        <div className="glass-container-static">
          <label className="block text-sm font-medium text-white mb-2">
            Conversation
          </label>
          <select
            value={activeThread || ""}
            onChange={(e) => setActiveThread(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
          >
            {threads.map((thread) => (
              <option key={thread.id} value={thread.id}>
                {thread.subject}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="glass-container-static overflow-hidden p-0">
        {/* Messages Area */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "client" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    msg.role === "client"
                      ? "bg-cyan-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                      : "bg-slate-700/50 border border-white/10"
                  }`}
                >
                  <p className="text-white">{msg.content}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
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
              disabled={!activeThread}
              className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || !activeThread}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
