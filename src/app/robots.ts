import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * robots.txt。クロールを全許可し、sitemap の場所を示す。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
