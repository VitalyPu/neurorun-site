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

        {/* Contact */}
        <div className="flex flex-col items-center gap-3 mt-3">
          <span className="text-xs tracking-[0.3em] uppercase text-cyan-300/70">
            Связаться со мной
          </span>
          <div className="flex items-center gap-4">
            {/* Telegram */}
            <a
              href="https://t.me/vitalyrann"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="group relative flex items-center justify-center w-12 h-12 rounded-full border border-cyan-400/60 bg-cyan-400/10 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)] transition-all duration-300 hover:bg-cyan-400/20 hover:text-white hover:shadow-[0_0_22px_rgba(34,211,238,0.55)] hover:scale-110"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21.94 4.6 18.6 20.36c-.25 1.11-.92 1.38-1.86.86l-5.14-3.79-2.48 2.39c-.27.27-.5.5-1.03.5l.37-5.23 9.52-8.6c.41-.37-.09-.57-.64-.2L5.07 13.05.99 11.77c-1.07-.34-1.09-1.07.23-1.59l16.7-6.44c.89-.34 1.67.21 1.38 1.59-.12-.34-.24.91-1.36 0z"/>
              </svg>
              <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] tracking-wider uppercase text-cyan-300/0 group-hover:text-cyan-300/80 transition whitespace-nowrap">Telegram</span>
            </a>

            {/* Phone */}
            <a
              href="tel:+79252299249"
              aria-label="Телефон"
              className="group relative flex items-center justify-center w-12 h-12 rounded-full border border-cyan-400/60 bg-cyan-400/10 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)] transition-all duration-300 hover:bg-cyan-400/20 hover:text-white hover:shadow-[0_0_22px_rgba(34,211,238,0.55)] hover:scale-110"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] tracking-wider uppercase text-cyan-300/0 group-hover:text-cyan-300/80 transition whitespace-nowrap">Телефон</span>
            </a>

            {/* Email */}
            <a
              href="mailto:vitaly@pudovkin.com"
              aria-label="Email"
              className="group relative flex items-center justify-center w-12 h-12 rounded-full border border-cyan-400/60 bg-cyan-400/10 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)] transition-all duration-300 hover:bg-cyan-400/20 hover:text-white hover:shadow-[0_0_22px_rgba(34,211,238,0.55)] hover:scale-110"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 6 10-6" />
              </svg>
              <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] tracking-wider uppercase text-cyan-300/0 group-hover:text-cyan-300/80 transition whitespace-nowrap">Email</span>
            </a>
          </div>
        </div>
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
