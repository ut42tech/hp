import { XMLParser } from "fast-xml-parser";

import { BLOG_REVALIDATE_SECONDS, blogHandles } from "./config";
import type { BlogPlatform, BlogPost } from "./types";
import {
  decodeHtmlEntities,
  extractThumbnail,
  toIso,
  toPlainExcerpt,
} from "./utils";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  enclosure?: { "@_url"?: string };
  "media:thumbnail"?: unknown;
}

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** RSS 2.0 文字列を BlogPost[] に正規化（純粋関数）。1件のみの場合の単一オブジェクト・空チャンネルも吸収。 */
export function parseRssItems(xml: string, platform: BlogPlatform): BlogPost[] {
  const feed = parser.parse(xml) as {
    rss?: { channel?: { item?: RssItem | RssItem[] } };
  };
  const items = toArray<RssItem>(feed?.rss?.channel?.item);
  return items
    .filter(
      (it): it is RssItem & { title: string; link: string } =>
        Boolean(it.title && it.link) && typeof it.link === "string",
    )
    .map((it) => ({
      platform,
      title: decodeHtmlEntities(String(it.title)),
      url: String(it.link),
      publishedAt: toIso(it.pubDate ?? ""),
      excerpt: it.description ? toPlainExcerpt(it.description) : undefined,
      thumbnail:
        extractThumbnail(it.enclosure?.["@_url"]) ??
        extractThumbnail(it["media:thumbnail"]),
    }));
}

async function fetchRss(
  platform: BlogPlatform,
  url: string,
): Promise<BlogPost[]> {
  const res = await fetch(url, {
    next: { revalidate: BLOG_REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`${platform} fetch failed: ${res.status}`);
  const xml = await res.text();
  return parseRssItems(xml, platform);
}

export function fetchZenn(): Promise<BlogPost[]> {
  return fetchRss(
    "zenn",
    `https://zenn.dev/${encodeURIComponent(blogHandles.zenn)}/feed`,
  );
}

export function fetchNote(): Promise<BlogPost[]> {
  return fetchRss(
    "note",
    `https://note.com/${encodeURIComponent(blogHandles.note)}/rss`,
  );
}
