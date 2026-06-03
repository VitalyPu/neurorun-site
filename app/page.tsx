import Header from "@/components/Header";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import Releases from "@/components/Releases";
import Videos from "@/components/Videos";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Header />

      <div className="section-divider" />

      <SpotifyPlayer />

      <div className="section-divider" />

      <Releases />

      <div className="section-divider" />

      <Videos />

      <div className="section-divider" />

      <Gallery />

      <Footer />
    </main>
  );
}
