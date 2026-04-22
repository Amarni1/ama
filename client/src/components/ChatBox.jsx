import { useState } from "react";
import { api } from "../services/api";

export default function ChatBox({ onIntent }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Ask about balance, address, Minima, or sending funds."
    }
  ]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }

    const nextUserMessage = { role: "user", text: input };
    setMessages((current) => [...current, nextUserMessage]);
    setLoading(true);
    try {
      const result = await api.sendMessage(input);
      setMessages((current) => [
        ...current,
        { role: "ai", text: result.reply ?? result.message }
      ]);
      onIntent(result);
      setInput("");
    } catch (error) {
      setMessages((current) => [...current, { role: "ai", text: error.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[30px] border border-black/5 bg-white/70 p-6 shadow-card backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-ma-gold">AI Command</p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div className="h-80 overflow-y-auto rounded-[24px] border border-white/60 bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[85%] rounded-[20px] bg-black px-4 py-3 text-sm leading-6 text-white"
                    : "max-w-[85%] rounded-[20px] bg-[#fff7dd] px-4 py-3 text-sm leading-6 text-ma-black"
                }
              >
                {message.text}
              </div>
            ))}
          </div>
        </div>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Example: Send 2 Minima to Mx123..."
          className="min-h-28 rounded-[24px] border border-black/10 bg-white px-4 py-4 text-ma-black outline-none transition focus:border-ma-gold"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full border border-black bg-black px-5 py-3 font-medium text-ma-gold shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Send Command"}
        </button>
      </form>
    </section>
  );
}
