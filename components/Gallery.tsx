"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const STATIC_ARTS = [
  "0. Пролог.png",
  "1. Ex Machine.png",
  "2. Бессмертие.png",
  "3. Вавилон.png",
  "4. Все, как один.png",
  "5. Любовь.png",
  "6. Последняя притча.png",
  "7. Хранитель глубины.png",
];

const PER_PAGE = 12;

export default function Gallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [allArts, setAllArts] = useState<string[]>(STATIC_ARTS);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.artDescriptions) setDescriptions(d.artDescriptions);
        if (d.arts && d.arts.length > 0) {
          setAllArts([...STATIC_ARTS, ...d.arts]);
        }
      })
      .catch(() => {});
  }, []);

  const totalPages = Math.ceil(allArts.length / PER_PAGE);
  const paged = allArts.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const showPagination = allArts.length > PER_PAGE;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-16">
      <h2 className="section-title">Арты</h2>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paged.map((filename) => {
          const desc = descriptions[filename] || "";
          const label = filename.replace(/^\d+\.\s*/, "").replace(/\.[^.]+$/, "");
          return (
            <div key={filename} className="flex flex-col items-center gap-2">
              <div
                className="relative aspect-square w-full rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] group"
                onClick={() => setLightbox(`/images/${filename}`)}
              >
                <Image
                  src={`/images/${filename}`}
                  alt={label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
              {desc && (
                <p className="text-white/40 text-xs leading-relaxed text-center px-1">{desc}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Пагинация */}
      {showPagination && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => { setPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-cyan-400/50 disabled:opacity-30 transition text-sm"
          >
            ← Назад
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                page === i
                  ? "bg-cyan-500 text-black"
                  : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-cyan-400/50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => { setPage((p) => Math.min(totalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={page === totalPages - 1}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-cyan-400/50 disabled:opacity-30 transition text-sm"
          >
            Вперёд →
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-full w-full h-full">
            <Image src={lightbox} alt="Арт" fill className="object-contain" />
          </div>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl z-10">✕</button>
        </div>
      )}
    </section>
  );
}
