import { ParsedRelease } from "./types";

const SERVICE_LABELS: Record<string, string> = {
  spotify: "Spotify",
  "apple-music": "Apple Music",
  itunes: "iTunes",
  deezer: "Deezer",
  "yandex-music": "Яндекс Музыка",
  "vk-music": "VK Музыка",
  "youtube-music": "YouTube Music",
  "kion-music": "КИОН Музыка",
  youtube: "YouTube",
  rutube: "Rutube",
};

export async function parseRelease(bandlinkUrl: string): Promise<ParsedRelease> {
  const res = await fetch(bandlinkUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch band.link page: ${res.status}`);
  }

  const html = await res.text();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const rawTitle = titleMatch ? titleMatch[1].replace(" | Band.Link", "").trim() : "Релиз";

  // Extract cover image (og:image)
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  const coverUrl = ogImageMatch ? ogImageMatch[1] : "";

  // Extract artist from og:title or title
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  const ogTitle = ogTitleMatch ? ogTitleMatch[1] : rawTitle;

  // Parse "Artist - Title" format
  const parts = ogTitle.split(" - ");
  const artist = parts.length > 1 ? parts[0].trim() : "Нейробег";
  const title = parts.length > 1 ? parts.slice(1).join(" - ").trim() : ogTitle;

  // Extract streaming links from page
  const links: Record<string, string> = {};

  // Match all links in the page that look like streaming service links
  const linkPattern = /href=["'](https?:\/\/(?:open\.spotify\.com|music\.apple\.com|itunes\.apple\.com|www\.deezer\.com|music\.youtube\.com|vk\.com\/music|music\.yandex\.ru|kion\.ru)[^"']+)["']/gi;
  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    const url = match[1];
    if (url.includes("spotify.com")) links["spotify"] = url;
    else if (url.includes("music.apple.com")) links["apple-music"] = url;
    else if (url.includes("itunes.apple.com")) links["itunes"] = url;
    else if (url.includes("deezer.com")) links["deezer"] = url;
    else if (url.includes("music.youtube.com")) links["youtube-music"] = url;
    else if (url.includes("vk.com/music")) links["vk-music"] = url;
    else if (url.includes("music.yandex.ru")) links["yandex-music"] = url;
    else if (url.includes("kion.ru")) links["kion-music"] = url;
  }

  // If no links found via direct parse, try JSON-LD or data attributes
  if (Object.keys(links).length === 0) {
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const block of jsonLdMatch) {
        try {
          const json = JSON.parse(block.replace(/<script[^>]*>|<\/script>/gi, ""));
          if (json.url) links["bandlink"] = json.url;
        } catch {}
      }
    }
  }

  return { title, artist, coverUrl, links };
}

export { SERVICE_LABELS };
