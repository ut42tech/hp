import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * サイトマップ。統合ホームと Blogs を列挙する。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/blogs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
