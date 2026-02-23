import { FormEvent, useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

import { chatApi } from "../../api/services";
import { useAuthStore } from "../../store/authStore";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I am Smart Faculty Assistant. I can guide you through courses, enrollment, materials, meetings, sessions, news, and admin tools."
};

const ChatWidget = () => {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);

  const visible = useMemo(() => !!user && !!accessToken, [user, accessToken]);
  if (!visible) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await chatApi.chat(nextMessages.filter((m) => m.role === "user" || m.role === "assistant"));
      const reply = String(response.data?.reply || "").trim();
      setMessages((prev) => [...prev, { role: "assistant", content: reply || "Please contact the faculty via: support@smart-faculty.edu" }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Please contact the faculty via: support@smart-faculty.edu"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="flex h-[480px] w-[340px] flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-3 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <MessageCircle size={16} />
              Smart Faculty Assistant
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3">
            {messages.map((m, index) => (
              <div
                key={`${m.role}-${index}`}
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "user" ? "ml-auto bg-indigo-600 text-white" : "bg-white text-slate-800"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && <div className="max-w-[90%] rounded-xl bg-white px-3 py-2 text-sm text-slate-500">Typing...</div>}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2 border-t bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the platform..."
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-3 text-white disabled:opacity-60"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-indigo-700"
        >
          <MessageCircle size={16} />
          Ask Assistant
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
