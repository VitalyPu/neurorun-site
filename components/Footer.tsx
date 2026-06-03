const LINKS = [
  { label: "Spotify", href: "https://open.spotify.com/album/4WGk1PfOTfXlilCLzQNo6t" },
  { label: "Apple Music", href: "https://music.apple.com/us/album/%D0%B0%D0%BD%D1%82%D0%B8%D1%83%D1%82%D0%BE%D0%BF%D0%B8%D1%8F-%D0%B2%D0%B0%D0%B2%D0%B8%D0%BB%D0%BE%D0%BD/1895914544" },
  { label: "Deezer", href: "https://www.deezer.com/ru/album/972831661" },
  { label: "МТС Музыка", href: "https://music.mts.ru/album/41829955" },
  { label: "VK", href: "https://vk.ru/neurorun?from=groups&trackcode=4d010c56dL1JuaukVazA9eXquANMYaCc7OSF_HqrUb7Pvowa77Kw1pcMKqcx38z5zvmxD05QuZH81azhaKAHuMTR_PUBK2u4-A" },
  { label: "YouTube Music", href: "https://music.youtube.com/playlist?list=OLAK5uy_nHuTk3dyUMPm2DiA4XlmLFtCPQ2AUoye0" },
  { label: "YouTube", href: "https://www.youtube.com/@neuroruns" },
  { label: "Rutube", href: "https://rutube.ru/channel/56834441/" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 mt-8 py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
        <p className="text-3xl font-bold tracking-widest text-white/80 uppercase neon-text-sm">
          Нейробег
        </p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/50 hover:text-cyan-400 transition-colors tracking-wider uppercase"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="text-xs text-white/20 tracking-wider">
          © {new Date().getFullYear()} Нейробег. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
