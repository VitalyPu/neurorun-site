"use client";

import { useState, useEffect } from "react";
import { Video } from "@/lib/types";

const PER_PAGE = 4;

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/api/videos").then((r) => r.json()).then(setVideos).catch(() => {});
  }, []);

  if (videos.length === 0) return null;

  const totalPages = Math.ceil(videos.length / PER_PAGE);
  const paged = videos.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const showPagination = videos.length > 3;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-16">
      <h2 className="section-title">Видео</h2>

      {/* Сетка — все ячейки одинаковой высоты */}
      <div className="mt-8 grid grid-cols-2 gap-6">
        {paged.map((video) => (
          <div key={video.id} className="flex flex-col items-center gap-3">
            {/* Контейнер с фиксированной высотой — одинаков для всех форматов */}
            <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              style={{ height: "280px" }}>
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
                width="100%"
                height="100%"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="block w-full h-full"
              />
            </div>
            {/* Текст по центру */}
            <div className="text-center px-2">
              {video.title && (
                <h3 className="text-white font-semibold text-sm">{video.title}</h3>
              )}
              {video.description && (
                <p className="text-white/50 text-xs mt-1 leading-relaxed">{video.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Пагинация */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-cyan-400/50 disabled:opacity-30 transition text-sm"
          >
            Вперёд →
          </button>
        </div>
      )}
    </section>
  );
}
