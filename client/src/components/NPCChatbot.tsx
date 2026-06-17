// NPCChatbot — Animated character with integrated chatbot
// Design: "Caderno de Aventuras" — speech bubble interface, BOT Gustavo style

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { CHATBOT_CONTEXT } from "@/lib/games";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Configuração dos seus dois GIFs dinâmicos salvos na pasta public
const NPC_IDLE = "/oi.gif";      // Personagem acenando/parado
const NPC_TALKING = "/boca.gif";  // Personagem mexendo a boca ao falar

function NPCSprite({ talking }: { talking: boolean }) {
  return (
    <div className="relative flex items-center justify-start">
      <img
        src={talking ? NPC_TALKING : NPC_IDLE}
        alt="BOT Gustavo"
        className="w-64 h-64 object-contain cursor-pointer transition-transform hover:scale-102 object-left"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        className="w-64 h-64 hidden items-center justify-center text-7xl cursor-pointer"
        style={{
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
          animation: talking ? "bounce 0.5s infinite alternate" : "none",
        }}
      >
        🤖
      </div>

      {talking && (
        <div className="absolute top-4 left-4 flex gap-0.5 bg-white/90 px-1.5 py-0.5 rounded-full border border-green-200 shadow-sm z-10">
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
  
  // 💾 Carrega as mensagens salvas no LocalStorage ou inicia com a mensagem padrão
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("bot_gustavo_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar histórico do chat:", e);
      }
    }
    return [
      {
        role: "assistant",
        content: "E aí, beleza? Eu sou o **BOT Gustavo**, o sistema de IA do portal! Pode me perguntar qualquer coisa sobre os jogos desenvolvidos pela galera ou sobre o fórum! 🎮🤖💻",
      },
    ];
  });
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 💾 Salva as mensagens no LocalStorage toda vez que o histórico mudar
  useEffect(() => {
    localStorage.setItem("bot_gustavo_chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsTalking(true);
    setTimeout(() => setIsTalking(false), 3000);
  };

  // ✨ Função para converter os ** do ChatGPT em negrito real (HTML <strong>)
  const formatMessageContent = (text: string) => {
    // Regex que encontra tudo que está entre ** e substitui por <strong>...</strong>
    const formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Substitui quebras de linha normais por <br /> para manter os parágrafos corretos
    return formatted.replace(/\n/g, "<br />");
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const updatedMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);
    setIsTalking(true);

    try {
      const apiKey = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
      const apiUrl = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://api.openai.com/v1";

      if (!apiKey) {
        throw new Error("A variável VITE_FRONTEND_FORGE_API_KEY não foi encontrada no seu arquivo .env.");
      }

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: "Você é o BOT Gustavo, um assistente virtual inteligente, gente boa, tecnológico e prestativo. Você ajuda os alunos a navegarem pelo portal de jogos e pelo fórum. Responda de forma natural, direta e amigável, usando emojis de tecnologia. Quando quiser destacar termos importantes, use **negrito**." 
            },
            ...updatedMessages.map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Código HTTP ${response.status}. Detalhes do servidor: ${errorText.substring(0, 150)}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Eita, deu um apagão aqui nos meus circuitos... Tenta mandar de novo!";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setTimeout(() => setIsTalking(false), Math.min(reply.length * 50, 4000));

    } catch (error: any) {
      console.error("Erro na API do BOT Gustavo:", error);
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `🤖❌ Falha no sistema! Erro técnico detectado:\n\n"${error.message || error}"`,
        },
      ]);
      
      setTimeout(() => {
        setIsTalking(false);
      }, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  // 🧹 Função opcional para limpar o chat se você quiser recomeçar
  const clearChat = () => {
    if (confirm("Quer mesmo apagar o histórico dessa conversa?")) {
      setMessages([
        {
          role: "assistant",
          content: "Histórico limpo! Pode mandar uma nova pergunta. 🧠🤖",
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 flex flex-col items-start justify-end p-0 m-0 text-left">
      {/* Chat window */}
      {isOpen && (
        <div
          className="animate-scale-in mb-2 ml-4"
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
              <img 
                src={isTalking ? NPC_TALKING : NPC_IDLE} 
                alt="BOT Gustavo Avatar" 
                className="w-7 h-7 object-contain rounded-full border border-green-300 bg-white" 
              />
              <div>
                <p className="font-bold text-green-800 text-sm" style={{ fontFamily: "Fredoka One, cursive" }}>
                  BOT Gustavo
                </p>
                <p className="text-xs text-green-600" style={{ fontFamily: "Nunito, sans-serif" }}>
                  Suporte Integrado
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Botão discreto para limpar histórico */}
              <button 
                onClick={clearChat}
                title="Limpar Conversa"
                className="text-[10px] text-gray-400 hover:text-red-500 mr-1 px-1 rounded hover:bg-gray-100 transition-colors"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                [limpar]
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0, maxHeight: 280 }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed bot-message-text ${
                    msg.role === "user"
                      ? "bg-green-500 text-white rounded-br-sm"
                      : "bg-gray-50 text-gray-700 border border-gray-100 rounded-bl-sm"
                  }`}
                  style={{ fontFamily: "Nunito, sans-serif" }}
                  // 🌟 Renderiza o texto injetando as tags de negrito formatadas com segurança
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
                />
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
              placeholder="Mande uma mensagem..."
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

      {/* NPC Character Button */}
      <div className="relative cursor-pointer flex items-center justify-start p-0 m-0" onClick={handleOpen}>
        <NPCSprite talking={isTalking} />
        
        {!isOpen && (
          <div
            className="absolute -top-4 left-16 bg-white border-2 border-green-400 rounded-xl px-3 py-1.5 text-xs font-bold text-green-700 whitespace-nowrap animate-fade-slide-up select-none pointer-events-none z-20"
            style={{
              fontFamily: "Nunito, sans-serif",
              boxShadow: "2px 2px 0px rgba(34,197,94,0.2)",
            }}
          >
            Chama o Gustavo! 💬
            <div
              className="absolute -bottom-2 left-6 w-0 h-0"
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