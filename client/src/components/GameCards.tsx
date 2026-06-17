// GameCards — 6 game cards with like/dislike and play button
// Design: "Caderno de Aventuras" — rounded cards, soft shadows, green accents

import { useState, useEffect } from "react";
import { GAMES, Game } from "@/lib/games";
import { usePlayer } from "@/contexts/PlayerContext";
import { ThumbsUp, ThumbsDown, Play, User } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";

interface GameReactions {
  likes: number;
  dislikes: number;
  userReaction: "like" | "dislike" | null;
}

function useGameReactions(gameId: string) {
  const { profile } = usePlayer();
  const [reactions, setReactions] = useState<GameReactions>({ likes: 0, dislikes: 0, userReaction: null });

  // Load user's previous reaction from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`reaction-${gameId}`);
    if (stored) {
      setReactions(prev => ({ ...prev, userReaction: stored as "like" | "dislike" }));
    }
  }, [gameId]);

  // Listen to Firestore for live counts
  useEffect(() => {
    const ref = doc(db, "reactions", gameId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setReactions(prev => ({
          ...prev,
          likes: data.likes || 0,
          dislikes: data.dislikes || 0,
        }));
      }
    }, () => {
      // Firebase not configured — use local state only
    });
    return () => unsub();
  }, [gameId]);

  const react = async (type: "like" | "dislike") => {
    const userKey = profile?.name || "anonymous";
    const stored = localStorage.getItem(`reaction-${gameId}`);

    if (stored === type) {
      toast.info("Você já reagiu a este jogo!");
      return;
    }

    // Update localStorage
    localStorage.setItem(`reaction-${gameId}`, type);
    setReactions(prev => ({
      ...prev,
      userReaction: type,
      likes: type === "like" ? prev.likes + 1 : (stored === "like" ? prev.likes - 1 : prev.likes),
      dislikes: type === "dislike" ? prev.dislikes + 1 : (stored === "dislike" ? prev.dislikes - 1 : prev.dislikes),
    }));

    // Try to update Firestore
    try {
      const ref = doc(db, "reactions", gameId);
      const updates: Record<string, unknown> = {
        [`reactions.${userKey}`]: type,
        updatedAt: serverTimestamp(),
      };
      if (type === "like") updates.likes = increment(1);
      if (type === "dislike") updates.dislikes = increment(1);
      if (stored === "like" && type === "dislike") updates.likes = increment(-1);
      if (stored === "dislike" && type === "like") updates.dislikes = increment(-1);
      await setDoc(ref, updates, { merge: true });
    } catch {
      // Firebase not configured — reactions stored locally only
    }
  };

  return { reactions, react };
}

// ─── Single Game Card ─────────────────────────────────────────────────────────
function GameCard({ game, index }: { game: Game; index: number }) {
  const { recordGameClick } = usePlayer();
  const { reactions, react } = useGameReactions(game.id);

  const handlePlay = () => {
    recordGameClick(game.title);
    window.open(game.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="game-card animate-fade-slide-up flex flex-col"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Game image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/logo-aventura-gamer-kmjSvG2ZU5LQDVuvvKUV5r.webp";
          }}
        />
        {/* Color overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `linear-gradient(135deg, ${game.color}40, transparent)` }}
        />
        {/* Creator badge */}
        <div className="absolute top-2 right-2">
          <span className="game-tag">
            <User className="w-3 h-3" />
            {game.creator}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3
            className="text-lg text-gray-800 leading-tight"
            style={{ fontFamily: "Fredoka One, cursive" }}
          >
            {game.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2" style={{ fontFamily: "Nunito, sans-serif" }}>
            {game.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-green-50">
          {/* Play button */}
          <button
            onClick={handlePlay}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold py-2 px-3 rounded-xl transition-all duration-150 text-sm"
            style={{ fontFamily: "Fredoka One, cursive", letterSpacing: "0.02em" }}
          >
            <Play className="w-4 h-4 fill-white" />
            Jogar
          </button>

          {/* Like */}
          <button
            onClick={() => react("like")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-150 text-sm font-bold ${
              reactions.userReaction === "like"
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-white border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600"
            }`}
            title="Curtir"
          >
            <ThumbsUp className={`w-4 h-4 ${reactions.userReaction === "like" ? "fill-green-500 text-green-500" : ""}`} />
            <span style={{ fontFamily: "Space Mono, monospace", fontSize: "0.7rem" }}>{reactions.likes}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => react("dislike")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-150 text-sm font-bold ${
              reactions.userReaction === "dislike"
                ? "bg-red-50 border-red-300 text-red-600"
                : "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500"
            }`}
            title="Não curtir"
          >
            <ThumbsDown className={`w-4 h-4 ${reactions.userReaction === "dislike" ? "fill-red-400 text-red-400" : ""}`} />
            <span style={{ fontFamily: "Space Mono, monospace", fontSize: "0.7rem" }}>{reactions.dislikes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Game Grid ────────────────────────────────────────────────────────────────
export function GameGrid() {
  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <h2
          className="text-3xl text-gray-800"
          style={{ fontFamily: "Fredoka One, cursive" }}
        >
          🎮 Jogos dos Colegas
        </h2>
        <span className="game-tag">
          {GAMES.length} jogos
        </span>
      </div>
      <hr className="dashed-separator" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {GAMES.map((game, idx) => (
          <GameCard key={game.id} game={game} index={idx} />
        ))}
      </div>
    </section>
  );
}
