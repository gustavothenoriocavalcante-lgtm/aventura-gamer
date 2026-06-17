// HeroSection — Hero banner for AVENTURA GAMER
// Design: "Caderno de Aventuras" — white background, green accents, handcrafted feel

import { usePlayer } from "@/contexts/PlayerContext";
import { Gamepad2, Users, Star } from "lucide-react";
import { GAMES } from "@/lib/games";

export function HeroSection() {
  const { profile } = usePlayer();

  return (
    <section
      className="relative overflow-hidden rounded-2xl mb-8"
      style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)",
        border: "2px dashed rgba(34,197,94,0.3)",
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/hero-banner-8zkRxxtpGeV2xvq72PLgoG.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative px-6 py-8 md:py-10">
        <div className="max-w-2xl">
          {/* Welcome message */}
          {profile ? (
            <div className="flex items-center gap-2 mb-3">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-8 h-8 rounded-xl object-cover border-2 border-green-400"
              />
              <span
                className="text-green-700 font-bold text-sm"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Olá, {profile.name}! Pronto para jogar?
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3">
              <span className="game-tag">🎮 Portal Escolar</span>
            </div>
          )}

          {/* Title */}
          <h2
            className="text-4xl md:text-5xl text-gray-800 leading-tight mb-3"
            style={{ fontFamily: "Fredoka One, cursive" }}
          >
            Jogue os games dos seus{" "}
            <span className="text-green-600">colegas!</span>
          </h2>

          {/* Subtitle */}
          <p
            className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            Aqui você encontra jogos incríveis criados pelos alunos da turma.
            Explore, curta e participe da comunidade!
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-200">
              <Gamepad2 className="w-4 h-4 text-green-600" />
              <span
                className="text-sm font-bold text-gray-700"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {GAMES.length} jogos disponíveis
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-200">
              <Users className="w-4 h-4 text-green-600" />
              <span
                className="text-sm font-bold text-gray-700"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {GAMES.length} criadores
              </span>
            </div>
            {profile?.favoriteGame && (
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-200">
                <Star className="w-4 h-4 text-green-600 fill-green-400" />
                <span
                  className="text-sm font-bold text-gray-700"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  Favorito: {profile.favoriteGame}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative corner doodles */}
      <div className="absolute top-4 right-4 opacity-30 text-4xl select-none pointer-events-none hidden md:block">
        🎮
      </div>
      <div className="absolute bottom-4 right-8 opacity-20 text-3xl select-none pointer-events-none hidden md:block">
        ⭐
      </div>
      <div className="absolute top-8 right-16 opacity-20 text-2xl select-none pointer-events-none hidden md:block">
        🕹️
      </div>
    </section>
  );
}
