import type { MetadataRoute } from "next";

import { works } from "@/content/works";
import { site } from "@/lib/site";

/**
 * サイトマップ。トップ・Works 一覧・各 Works 詳細ページを列挙する。
 * `date` フィールドは YYYY-MM-DD なので Date でパース可能。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const workRoutes: MetadataRoute.Sitemap = works.map((work) => ({
    url: `${site.url}/works/${work.slug}`,
    lastModified: new Date(work.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...workRoutes];
}
