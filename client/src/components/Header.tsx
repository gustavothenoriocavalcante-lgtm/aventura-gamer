// Header — Main navigation header for AVENTURA GAMER
// Design: "Caderno de Aventuras" — white header, green accents, notebook feel

import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { MessageSquare, Home, QrCode } from "lucide-react";

interface HeaderProps {
  activeSection: "portal" | "forum";
  onSectionChange: (section: "portal" | "forum") => void;
}

export function Header({ activeSection, onSectionChange }: HeaderProps) {
  const [showQR, setShowQR] = useState(false);

  return (
    <header
      className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm isolate" 
      style={{
        borderBottom: "2px solid rgba(34,197,94,0.15)",
        boxShadow: "0 2px 12px rgba(34,197,94,0.08)",
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo e Título com ajuste responsivo para não quebrar em telas pequenas */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/logo-aventura-gamer-kmjSvG2ZU5LQDVuvvKUV5r.webp"
              alt="AVENTURA GAMER"
              className="w-8 h-8 sm:w-9 sm:h-9"
            />
            <div>
              <h1
                className="text-base sm:text-xl text-green-700 leading-none"
                style={{ fontFamily: "Fredoka One, cursive" }}
              >
                AVENTURA GAMER
              </h1>
              <p
                className="text-[10px] sm:text-xs text-gray-400 leading-none mt-0.5"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                portal de jogos escolares
              </p>
            </div>
          </div>

          {/* Navegação Corrigida — Visível e clicável no celular */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => onSectionChange("portal")}
              className={`flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                activeSection === "portal"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}
              style={{ fontFamily: "Fredoka One, cursive", letterSpacing: "0.02em" }}
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Portal</span> 
            </button>
            
            <button
              onClick={() => onSectionChange("forum")}
              className={`flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                activeSection === "forum"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}
              style={{ fontFamily: "Fredoka One, cursive", letterSpacing: "0.02em" }}
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Fórum</span>
            </button>
          </nav>

          {/* Lado Direito */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* QR Code button (mobile) */}
            <button
              onClick={() => setShowQR(!showQR)}
              className="xl:hidden p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
              title="QR Code"
            >
              <QrCode className="w-5 h-5" />
            </button>

            <AdminPanel />
          </div>
        </div>
      </div>

      {/* Mobile QR Code dropdown */}
      {showQR && (
        <div
          className="xl:hidden absolute right-4 top-full mt-2 bg-white rounded-2xl border-2 border-green-200 p-4 shadow-xl z-50 animate-scale-in"
          style={{ transformOrigin: "top right" }}
        >
          <p className="text-xs text-gray-500 text-center mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>
            Escaneie para abrir o qr code
          </p>
          <img
            src={`${import.meta.env.BASE_URL}qr-firebase.png`}
            alt="QR Code"
            className="w-32 h-32 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "";
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </header>
  );
}