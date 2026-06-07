export default function SpotifyPlayer() {
  // YouTube Music channel uploads playlist (UC → UU prefix)
  const YT_PLAYLIST_ID = "UUQATCCos4h1rneFYoP0kVlA";
  const YT_MUSIC_URL = "https://music.youtube.com/channel/UCQATCCos4h1rneFYoP0kVlA";

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-16">
      <h2 className="section-title">Музыка</h2>
      <div className="mt-8 space-y-4">
        {/* Embedded YouTube playlist */}
        <div className="rounded-xl overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.15)] border border-white/10">
          <iframe
            src={`https://www.youtube.com/embed/videoseries?list=${YT_PLAYLIST_ID}&modestbranding=1&rel=0`}
            width="100%"
            height="380"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="block"
          />
        </div>
        {/* Link to YouTube Music */}
        <div className="flex justify-center">
          <a
            href={YT_MUSIC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-red-400/50 text-white/60 hover:text-white text-sm transition-all duration-300 group"
          >
            <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/>
            </svg>
            <span>Слушать на YouTube Music</span>
          </a>
        </div>
      </div>
    </section>
  );
}
