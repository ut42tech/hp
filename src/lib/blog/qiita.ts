import { BLOG_REVALIDATE_SECONDS, blogHandles } from "./config";
import type { BlogPost } from "./types";
import { toIso, toPlainExcerpt } from "./utils";

interface QiitaTag {
  name: string;
}

interface QiitaItem {
  title: string;
  url: string;
  created_at: string;
  body?: string;
  likes_count?: number;
  tags?: QiitaTag[];
}

/** Qiita API v2 のレスポンス配列を BlogPost[] に正規化（純粋関数）。 */
export function parseQiitaItems(items: QiitaItem[]): BlogPost[] {
  return items.map((item) => ({
    platform: "qiita" as const,
    title: item.title,
    url: item.url,
    publishedAt: toIso(item.created_at),
    excerpt: item.body ? toPlainExcerpt(item.body) : undefined,
    tags: item.tags?.map((t) => t.name).filter(Boolean),
    likes: typeof item.likes_count === "number" ? item.likes_count : undefined,
  }));
}

/** Qiita のユーザー記事一覧を取得して正規化。失敗時は throw（呼び出し側で allSettled 処理）。 */
export async function fetchQiita(): Promise<BlogPost[]> {
  const username = blogHandles.qiita;
  const res = await fetch(
    `https://qiita.com/api/v2/users/${encodeURIComponent(username)}/items?per_page=100`,
    { next: { revalidate: BLOG_REVALIDATE_SECONDS } },
  );
  if (!res.ok) throw new Error(`Qiita fetch failed: ${res.status}`);
  const json = (await res.json()) as unknown;
  return parseQiitaItems(Array.isArray(json) ? (json as QiitaItem[]) : []);
}
