import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://neurorun.ru";
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
