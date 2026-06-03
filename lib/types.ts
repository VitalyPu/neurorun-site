export interface Release {
  id: string;
  bandlink: string;
  title: string;
  coverUrl: string;
  links: Record<string, string>;
  description?: string;
}

export interface ParsedRelease {
  title: string;
  artist: string;
  coverUrl: string;
  links: Record<string, string>;
}

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  isShort?: boolean;
}

export interface SiteConfig {
  tagline: string[];
  bio: string;
  artDescriptions: Record<string, string>;
  arts: string[];
}
