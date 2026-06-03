import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://neurorun.ru";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Нейробег — Нейромузыкант | Виталий Ранн",
    template: "%s | Нейробег",
  },
  description:
    "Официальный сайт нейромузыканта Нейробег (Виталий Ранн). Слушайте альбомы «Антиутопия: Вавилон», «Дом Сердечных Заблуждений», «Прекрасное далеко» на Spotify, Apple Music, Яндекс Музыке, VK Музыке и других платформах. Нейромузыка, киберпанк, арт-рок, психоделика.",
  keywords: [
    "Нейробег",
    "Виталий Ранн",
    "нейромузыка",
    "нейромузыкант",
    "Антиутопия Вавилон",
    "Дом Сердечных Заблуждений",
    "Прекрасное далеко",
    "киберпанк музыка",
    "арт-рок",
    "психоделика",
    "электронная музыка",
    "dark ambient",
    "industrial музыка",
    "русская электронная музыка",
    "нейроперсонажи",
    "цифровое искусство",
    "Neurorun",
    "neurorun music",
    "Spotify нейробег",
    "Яндекс Музыка нейробег",
  ],
  authors: [{ name: "Нейробег", url: BASE_URL }],
  creator: "Нейробег (Виталий Ранн)",
  publisher: "Нейробег",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: BASE_URL,
    siteName: "Нейробег",
    title: "Нейробег — Нейромузыкант | Виталий Ранн",
    description:
      "Официальный сайт нейромузыканта Нейробег. Альбомы, треки, арты, видео.",
    images: [
      {
        url: "/images/avatar.png",
        width: 1200,
        height: 630,
        alt: "Нейробег — Нейромузыкант",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Нейробег — Нейромузыкант",
    description: "Нейромузыка, киберпанк, арт-рок. Официальный сайт.",
    images: ["/images/avatar.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Structured Data — Person + MusicGroup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": `${BASE_URL}/#person`,
                  name: "Виталий Ранн",
                  alternateName: "Нейробег",
                  url: BASE_URL,
                  image: `${BASE_URL}/images/avatar.png`,
                  sameAs: [
                    "https://open.spotify.com/artist/3SDCFHGnQEYb4pO9xlPuTy",
                    "https://www.youtube.com/@neuroruns",
                    "https://rutube.ru/channel/56834441/",
                  ],
                },
                {
                  "@type": "MusicGroup",
                  "@id": `${BASE_URL}/#musicgroup`,
                  name: "Нейробег",
                  url: BASE_URL,
                  image: `${BASE_URL}/images/avatar.png`,
                  genre: ["Нейромузыка", "Киберпанк", "Арт-рок", "Dark Ambient", "Industrial"],
                  member: { "@id": `${BASE_URL}/#person` },
                  sameAs: [
                    "https://open.spotify.com/artist/3SDCFHGnQEYb4pO9xlPuTy",
                    "https://www.youtube.com/@neuroruns",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": `${BASE_URL}/#website`,
                  url: BASE_URL,
                  name: "Нейробег",
                  description: "Официальный сайт нейромузыканта Нейробег",
                  inLanguage: "ru",
                },
              ],
            }),
          }}
        />
        {/* Яндекс Метрика */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=109623437','ym');ym(109623437,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`,
          }}
        />
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/109623437" style={{ position: "absolute", left: "-9999px" }} alt="" />
          </div>
        </noscript>
      </head>
      <body className="bg-[#050507] text-white min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
