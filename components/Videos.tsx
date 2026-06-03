"use client";

import { useState, useEffect } from "react";
import { Video } from "@/lib/types";

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    fetch("/api/videos").then((r) => r.json()).then(setVideos).catch(() => {});
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-16">
      <h2 className="section-title">Видео</h2>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {videos.map((video) => (
          <div key={video.id} className="flex flex-col gap-3">
            <div className={`rounded-xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${video.isShort ? "aspect-[9/16] max-w-xs mx-auto w-full" : "aspect-video"}`}>
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
            {video.title && (
              <h3 className="text-white font-semibold text-sm">{video.title}</h3>
            )}
            {video.description && (
              <p className="text-white/50 text-xs leading-relaxed">{video.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
