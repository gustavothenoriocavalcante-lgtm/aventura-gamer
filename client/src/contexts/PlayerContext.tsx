// PlayerContext — Player profile management with localStorage persistence
// Design: "Caderno de Aventuras" — no XP/levels/badges, just name + avatar + favorite game

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface PlayerProfile {
  name: string;
  avatar: string;
  avatarIndex: number;
  favoriteGame: string | null;
}

interface PlayerContextType {
  profile: PlayerProfile | null;
  isProfileSetup: boolean;
  setProfile: (profile: PlayerProfile) => void;
  clearProfile: () => void;
  recordGameClick: (gameTitle: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const STORAGE_KEY = "aventura-gamer-profile";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<PlayerProfile | null>(null);
  const [isProfileSetup, setIsProfileSetup] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PlayerProfile;
        setProfileState(parsed);
        setIsProfileSetup(true);
      }
    } catch {
      // Invalid stored data — start fresh
    }
  }, []);

  const setProfile = (newProfile: PlayerProfile) => {
    setProfileState(newProfile);
    setIsProfileSetup(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch {
      // Storage unavailable
    }
  };

  const clearProfile = () => {
    setProfileState(null);
    setIsProfileSetup(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable
    }
  };

  const recordGameClick = (gameTitle: string) => {
    if (!profile) return;
    const updated = { ...profile, favoriteGame: gameTitle };
    setProfile(updated);
  };

  return (
    <PlayerContext.Provider
      value={{
        profile,
        isProfileSetup,
        setProfile,
        clearProfile,
        recordGameClick,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
