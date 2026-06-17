// PlayerProfile — Profile creation screen and mini panel
// Design: "Caderno de Aventuras" — white + green, no XP/levels/badges

import { useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { AVATARS } from "@/lib/games";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2, Star, X } from "lucide-react";

// ─── Profile Creation Modal ───────────────────────────────────────────────────
export function ProfileSetupModal() {
  const { setProfile } = usePlayer();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0); // index into AVATARS
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      setError("Digite seu nome de jogador!");
      return;
    }
    if (name.trim().length < 2) {
      setError("Nome muito curto. Use pelo menos 2 caracteres.");
      return;
    }
    setProfile({
      name: name.trim(),
      avatar: AVATARS[selectedAvatar].url,
      avatarIndex: AVATARS[selectedAvatar].index,
      favoriteGame: null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in"
        style={{ border: "2px solid #22c55e" }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 text-center"
          style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}
        >
          <div className="flex justify-center mb-2">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/logo-aventura-gamer-kmjSvG2ZU5LQDVuvvKUV5r.webp"
              alt="AVENTURA GAMER"
              className="w-14 h-14"
            />
          </div>
          <h2 className="text-2xl text-green-700" style={{ fontFamily: "Fredoka One, cursive" }}>
            Crie seu Perfil!
          </h2>
          <p className="text-green-600 text-sm mt-1" style={{ fontFamily: "Nunito, sans-serif" }}>
            Escolha seu nome e avatar para começar a aventura
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Name input */}
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5" style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}>
              Nome de Jogador
            </label>
            <Input
              placeholder="Ex: MegaGamer123"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
              maxLength={24}
              style={{ fontFamily: "Nunito, sans-serif" }}
            />
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>

          {/* Avatar selection */}
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-2" style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}>
              Escolha seu Avatar
            </label>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map((avatar, idx) => (
                <button
                  key={avatar.index}
                  onClick={() => setSelectedAvatar(idx)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                    selectedAvatar === idx
                      ? "border-green-500 shadow-md scale-105"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  title={avatar.label}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.label}
                    className="w-full aspect-square object-cover"
                  />
                  {selectedAvatar === idx && (
                    <div className="absolute inset-0 bg-green-500/10 flex items-end justify-center pb-1">
                      <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center" style={{ fontFamily: "Space Mono, monospace" }}>
              {AVATARS[selectedAvatar].label}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <Button
            onClick={handleSave}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-base"
            style={{ fontFamily: "Fredoka One, cursive", letterSpacing: "0.03em" }}
          >
            <Gamepad2 className="w-5 h-5 mr-2" />
            Começar Aventura!
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Player Mini Panel (upper-left corner) ───────────────────────────────────
export function PlayerMiniPanel() {
  const { profile, clearProfile } = usePlayer();
  const [showMenu, setShowMenu] = useState(false);

  if (!profile) return null;

  return (
    <div
      className="fixed top-4 left-4 z-40 animate-slide-in-left"
      style={{ maxWidth: 220 }}
    >
      <div
        className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden"
        style={{ boxShadow: "0 4px 16px rgba(34,197,94,0.12)" }}
      >
        {/* Avatar + name row */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="relative flex-shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-10 h-10 rounded-xl object-cover border-2 border-green-300"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm truncate" style={{ fontFamily: "Fredoka One, cursive" }}>
              {profile.name}
            </p>
            {profile.favoriteGame && (
              <p className="text-xs text-green-600 truncate flex items-center gap-1" style={{ fontFamily: "Nunito, sans-serif" }}>
                <Star className="w-3 h-3 fill-green-400 text-green-400 flex-shrink-0" />
                {profile.favoriteGame}
              </p>
            )}
            {!profile.favoriteGame && (
              <p className="text-xs text-gray-400" style={{ fontFamily: "Nunito, sans-serif" }}>
                Nenhum favorito ainda
              </p>
            )}
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
        </div>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="border-t border-green-100 px-3 py-2 bg-green-50 animate-scale-in">
            <button
              onClick={() => { clearProfile(); setShowMenu(false); }}
              className="w-full text-left text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1.5 py-1"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              <X className="w-3 h-3" />
              Trocar perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
