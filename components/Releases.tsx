"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Release } from "@/lib/types";

const SERVICE_ICONS: Record<string, { label: string; color: string }> = {
  spotify: { label: "Spotify", color: "bg-green-500 hover:bg-green-400" },
  "apple-music": { label: "Apple Music", color: "bg-pink-600 hover:bg-pink-500" },
  itunes: { label: "iTunes", color: "bg-pink-800 hover:bg-pink-700" },
  deezer: { label: "Deezer", color: "bg-purple-600 hover:bg-purple-500" },
  "yandex-music": { label: "Яндекс Музыка", color: "bg-yellow-500 hover:bg-yellow-400" },
  "vk-music": { label: "VK Музыка", color: "bg-blue-600 hover:bg-blue-500" },
  "youtube-music": { label: "YouTube Music", color: "bg-red-600 hover:bg-red-500" },
  "kion-music": { label: "КИОН", color: "bg-orange-600 hover:bg-orange-500" },
};

export default function Releases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/releases").then((r) => r.json()).then(setReleases).catch(() => {});
  }, []);

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-16">
      <h2 className="section-title">Релизы</h2>

      {releases.length === 0 ? (
        <p className="text-white/30 text-center py-10 mt-8">Релизы появятся здесь</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {releases.map((release) => (
            <div
              key={release.id}
              className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col"
            >
              {/* Cover */}
              <div className="relative aspect-square w-full bg-black/50 shrink-0">
                {release.coverUrl ? (
                  <Image
                    src={release.coverUrl}
                    alt={release.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-6xl">🎵</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              </div>

              {/* Info */}
              <div className="p-4 space-y-3 flex flex-col flex-1">
                <h3 className="text-white font-semibold text-sm leading-tight">{release.title}</h3>

                {/* Description */}
                {release.description && (
                  <div>
                    <p className={`text-white/50 text-xs leading-relaxed ${expanded === release.id ? "" : "line-clamp-3"}`}>
                      {release.description}
                    </p>
                    {release.description.length > 150 && (
                      <button
                        onClick={() => setExpanded(expanded === release.id ? null : release.id)}
                        className="text-cyan-400/70 hover:text-cyan-400 text-xs mt-1 transition"
                      >
                        {expanded === release.id ? "Свернуть ↑" : "Читать далее →"}
                      </button>
                    )}
                  </div>
                )}

                {/* Platform buttons */}
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                  {Object.entries(release.links).map(([key, url]) => {
                    const service = SERVICE_ICONS[key];
                    if (!service || !url) return null;
                    return (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                        className={`text-xs px-2 py-1 rounded-md text-white font-medium transition-colors ${service.color}`}>
                        {service.label}
                      </a>
                    );
                  })}
                  <a href={release.bandlink} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
                    Все сервисы →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
