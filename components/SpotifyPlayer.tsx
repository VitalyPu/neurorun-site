export default function SpotifyPlayer() {
  const SPOTIFY_ALBUM_ID = "4WGk1PfOTfXlilCLzQNo6t";

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-16">
      <h2 className="section-title">Музыка</h2>
      <div className="mt-8 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.15)] border border-white/10">
        <iframe
          src={`https://open.spotify.com/embed/album/${SPOTIFY_ALBUM_ID}?utm_source=generator&theme=0`}
          width="100%"
          height="380"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="block"
        />
      </div>
    </section>
  );
}
