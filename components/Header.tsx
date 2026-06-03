"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
  const [tagline, setTagline] = useState(["Нейромузыка", "Цифровое искусство", "Киберпанк", "", ""]);
  const [bio, setBio] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.tagline) setTagline(d.tagline);
        if (d.bio) setBio(d.bio);
      })
      .catch(() => {});
  }, []);

  const activeWords = tagline.filter((w) => w.trim());

  return (
    <header className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg2.jpg"
          alt="Нейробег фон"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
      </div>

      {/* Scanlines */}
      <div className="absolute inset-0 z-10 pointer-events-none scanlines" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center gap-5 px-6 text-center max-w-2xl mx-auto py-24">
        {/* Avatar */}
        <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] glitch-border">
          <Image src="/images/avatar.png" alt="Нейробег" fill className="object-cover" priority />
        </div>

        {/* Name */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-widest uppercase text-white neon-text">
          Нейробег
        </h1>

        {/* Tagline — pills */}
        {activeWords.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {activeWords.map((word, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs md:text-sm font-semibold tracking-widest uppercase border border-cyan-400/60 text-cyan-300 bg-cyan-400/10 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              >
                {word}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {bio && (
          <p className="text-white/85 text-sm md:text-base leading-relaxed max-w-xl mt-1">
            {bio}
          </p>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-40 pointer-events-none">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
          <path d="M6 10l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </header>
  );
}
