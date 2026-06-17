// AdColumn — Rotating advertisement column
// Design: "Caderno de Aventuras" — right sidebar, auto-rotating ads
// Ads managed through Firebase Firestore

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ExternalLink } from "lucide-react";

interface Ad {
  id: string;
  image: string;
  url: string;
  title?: string;
  active: boolean;
}

// Default ads (shown when Firebase not configured)
const DEFAULT_ADS: Ad[] = [
  {
    id: "ad1",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop",
    url: "https://www.alura.com.br",
    title: "Alura — Aprenda programação",
    active: true,
  },
  {
    id: "ad2",
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=300&h=200&fit=crop",
    url: "https://www.codecademy.com",
    title: "Codecademy — Cursos de código",
    active: true,
  },
  {
    id: "ad3",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&h=200&fit=crop",
    url: "https://www.coursera.org",
    title: "Coursera — Educação online",
    active: true,
  },
];

export function AdColumn() {
  const [ads, setAds] = useState<Ad[]>(DEFAULT_ADS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load ads from Firestore
  useEffect(() => {
    const q = query(collection(db, "ads"), where("active", "==", true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ad));
          setAds(data);
        }
      },
      () => {
        // Firebase not configured — use defaults
      }
    );
    return () => unsub();
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  const currentAd = ads[currentIndex];
  if (!currentAd) return null;

  return (
    <aside className="w-64 flex-shrink-0 hidden xl:flex flex-col gap-4">
      {/* Ad header */}
      <div className="flex items-center gap-2">
        <span className="game-tag">Parceiros</span>
        <hr className="flex-1 border-dashed border-green-200" />
      </div>

      {/* Main rotating ad */}
      <div
        className="rounded-2xl overflow-hidden border-2 border-green-100 shadow-sm transition-opacity duration-300"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        <a
          href={currentAd.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
            <img
              src={currentAd.image}
              alt={currentAd.title || "Anúncio"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-semibold">
                <ExternalLink className="w-3 h-3" />
                Visitar
              </span>
            </div>
          </div>
          {currentAd.title && (
            <div className="p-3 bg-white">
              <p
                className="text-sm font-bold text-gray-700 line-clamp-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {currentAd.title}
              </p>
            </div>
          )}
        </a>
      </div>

      {/* Dots indicator */}
      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-full transition-all duration-200 ${
                idx === currentIndex
                  ? "w-4 h-2 bg-green-500"
                  : "w-2 h-2 bg-green-200 hover:bg-green-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* All ads thumbnails */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 font-semibold" style={{ fontFamily: "Space Mono, monospace" }}>
          MAIS PARCEIROS
        </p>
        {ads.map((ad, idx) => (
          idx !== currentIndex && (
            <a
              key={ad.id}
              href={ad.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-xl border border-green-100 hover:border-green-300 hover:bg-green-50 transition-all duration-150 group"
              onClick={() => setCurrentIndex(idx)}
            >
              <img
                src={ad.image}
                alt={ad.title}
                className="w-12 h-9 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=60&h=45&fit=crop";
                }}
              />
              <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-green-700 transition-colors" style={{ fontFamily: "Nunito, sans-serif" }}>
                {ad.title}
              </p>
            </a>
          )
        ))}
      </div>

      {/* Separator */}
      <hr className="dashed-separator" />

      {/* QR Code section */}
      <div className="text-center">
        <p className="text-xs text-gray-400 font-semibold mb-2" style={{ fontFamily: "Space Mono, monospace" }}>
          COMPARTILHE
        </p>
        <div className="bg-white rounded-xl border-2 border-green-100 p-3 inline-block">
          <img
            src="/qrcode.png"
            alt="QR Code do portal"
            className="w-28 h-28 object-contain mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "block";
            }}
          />
          <div className="hidden text-4xl text-center">📱</div>
          <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "Nunito, sans-serif" }}>
            Escaneie para abrir
          </p>
        </div>
      </div>
    </aside>
  );
}
