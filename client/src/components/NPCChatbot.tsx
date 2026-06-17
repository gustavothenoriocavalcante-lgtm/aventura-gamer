// NPCChatbot — Animated character with integrated chatbot
// Design: "Caderno de Aventuras" — speech bubble interface, NPC style

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { CHATBOT_CONTEXT } from "@/lib/games";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// NPC character using emoji/SVG since GIF files need to be uploaded by user
// The component is designed to accept idle.gif and talking.gif when provided
const NPC_IDLE = "/idle.gif"; // user uploads this
const NPC_TALKING = "/talking.gif"; // user uploads this

// Fallback NPC character (pixel art style using CSS)
function NPCSprite({ talking }: { talking: boolean }) {
  return (
    <div className="relative">
      {/* Try to load user-provided GIF, fallback to emoji */}
      <img
        src={talking ? NPC_TALKING : NPC_IDLE}
        alt="Aventureiro NPC"
        className="w-20 h-20 object-contain"
        onError={(e) => {
          // Fallback: hide broken image and show emoji
          (e.target as HTMLImageElement).style.display = "none";
          const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      {/* Fallback emoji character */}
      <div
        className="w-20 h-20 hidden items-center justify-center text-5xl"
        style={{
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
          animation: talking ? "bounce 0.5s infinite alternate" : "none",
        }}
      >
        {talking ? "🧙" : "🧙‍♂️"}
      </div>
      {/* Talking indicator */}
      {talking && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-green-500 rounded-full"
              style={{
                animation: `bounce 0.6s ${i * 0.15}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function NPCChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá, aventureiro! Sou o Aventureiro, seu guia neste portal! Clique em mim para conversar. Posso te ajudar a encontrar jogos, tirar dúvidas e muito mais! 🎮",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsTalking(true);
    setTimeout(() => setIsTalking(false), 2000);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setIsTalking(true);

    try {
      // Use OpenAI API via Manus proxy
      const apiKey = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
      const apiUrl = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://api.openai.com/v1";

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: CHATBOT_CONTEXT },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Hmm, não consegui responder agora. Tente novamente!";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ops! Parece que estou com dificuldades técnicas. Mas posso te dizer: temos 6 jogos incríveis criados pelos seus colegas! Explore os cards acima! 🎮",
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsTalking(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2">
      {/* Chat window */}
      {isOpen && (
        <div
          className="animate-scale-in mb-2"
          style={{
            width: 300,
            maxHeight: 420,
            display: "flex",
            flexDirection: "column",
            background: "white",
            borderRadius: "1rem",
            border: "2px solid #22c55e",
            boxShadow: "0 8px 32px rgba(34,197,94,0.15), 4px 4px 0px rgba(34,197,94,0.1)",
            transformOrigin: "bottom left",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-t-[calc(1rem-2px)]"
            style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderBottom: "1px solid #bbf7d0" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🧙‍♂️</span>
              <div>
                <p className="font-bold text-green-800 text-sm" style={{ fontFamily: "Fredoka One, cursive" }}>
                  Aventureiro
                </p>
                <p className="text-xs text-green-600" style={{ fontFamily: "Nunito, sans-serif" }}>
                  Guia do Portal
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0, maxHeight: 280 }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-green-500 text-white rounded-br-sm"
                      : "bg-gray-50 text-gray-700 border border-gray-100 rounded-bl-sm"
                  }`}
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-100 rounded-xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 p-3 rounded-b-[calc(1rem-2px)]"
            style={{ borderTop: "1px solid #bbf7d0" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Pergunte algo..."
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:border-green-400 bg-white"
              style={{ fontFamily: "Nunito, sans-serif" }}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* NPC Character */}
      <div className="relative" onClick={handleOpen}>
        <div className="npc-character">
          <NPCSprite talking={isTalking} />
        </div>
        {/* Hint bubble when closed */}
        {!isOpen && (
          <div
            className="absolute -top-12 left-0 bg-white border-2 border-green-400 rounded-xl px-3 py-1.5 text-xs font-bold text-green-700 whitespace-nowrap animate-fade-slide-up"
            style={{
              fontFamily: "Nunito, sans-serif",
              boxShadow: "2px 2px 0px rgba(34,197,94,0.2)",
            }}
          >
            Clique para conversar! 💬
            <div
              className="absolute -bottom-2 left-4 w-0 h-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "8px solid #22c55e",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
