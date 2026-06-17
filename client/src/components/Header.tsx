// Header — Main navigation header for AVENTURA GAMER
// Design: "Caderno de Aventuras" — white header, green accents, notebook feel

import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { Gamepad2, MessageSquare, Home, QrCode } from "lucide-react";

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
{/* Substitua a div interna do <header> por esta abaixo */}
<div className="w-full max-w-7xl mx-auto px-6 md:px-12">
  <div className="flex items-center justify-between h-16 gap-4">
    {/* Logo e Título com margem de segurança */}
    <div className="flex items-center gap-3 flex-shrink-0">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/logo-aventura-gamer-kmjSvG2ZU5LQDVuvvKUV5r.webp"
              alt="AVENTURA GAMER"
              className="w-9 h-9"
            />
            <div>
              <h1
                className="text-xl text-green-700 leading-none"
                style={{ fontFamily: "Fredoka One, cursive" }}
              >
                AVENTURA GAMER
              </h1>
              <p
                className="text-xs text-gray-400 leading-none mt-0.5"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                portal de jogos escolares
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => onSectionChange("portal")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 ${
                activeSection === "portal"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}
              style={{ fontFamily: "Fredoka One, cursive", letterSpacing: "0.02em" }}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Portal</span>
            </button>
            <button
              onClick={() => onSectionChange("forum")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 ${
                activeSection === "forum"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}
              style={{ fontFamily: "Fredoka One, cursive", letterSpacing: "0.02em" }}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Fórum</span>
            </button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
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
            src={`${import.meta.env.BASE_URL}codefacil.png`}
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