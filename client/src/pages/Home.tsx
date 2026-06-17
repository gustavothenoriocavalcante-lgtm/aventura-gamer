// Home — Main page for AVENTURA GAMER portal
// Design: "Caderno de Aventuras" — white + green, handcrafted school portal
// Layout: Header | [Main content + Ad sidebar] | NPC chatbot (fixed bottom-left)

import { useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { ProfileSetupModal, PlayerMiniPanel } from "@/components/PlayerProfile";
import { GameGrid } from "@/components/GameCards";
import { Forum } from "@/components/Forum";
import { NPCChatbot } from "@/components/NPCChatbot";
import { AdColumn } from "@/components/AdColumn";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  const { isProfileSetup } = usePlayer();
  const [activeSection, setActiveSection] = useState<"portal" | "forum">("portal");

  return (
    <div className="min-h-screen bg-white">
      {/* Profile setup modal (shown on first visit) */}
      {!isProfileSetup && <ProfileSetupModal />}

      {/* Player mini panel (upper-left, fixed) */}
      <PlayerMiniPanel />

      {/* Header */}
      <Header activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main layout */}
      <div className="container py-6">
        <div className="flex gap-6 items-start">
          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeSection === "portal" && (
              <>
                <HeroSection />
                <GameGrid />
              </>
            )}
            {activeSection === "forum" && (
              <Forum />
            )}
          </main>

          {/* Ad sidebar (desktop only) */}
          <AdColumn />
        </div>
      </div>

      {/* NPC Chatbot (fixed bottom-left) */}
      <NPCChatbot />

      {/* Footer */}
      <footer
        className="mt-12 py-6 border-t-2 border-dashed border-green-100"
        style={{ background: "#f9fafb" }}
      >
        <div className="container text-center">
          <p
            className="text-sm text-gray-400"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            AVENTURA GAMER — Portal de Jogos Escolares
          </p>
          <p
            className="text-xs text-gray-300 mt-1"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            Feito com 💚 pelos alunos da turma
          </p>
        </div>
      </footer>
    </div>
  );
}
