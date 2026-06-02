import type { BlogPost } from "./types";

/** HTML/Markdown 由来の文字列からプレーンな抜粋を作る。タグ除去・空白圧縮・最大長で切る。 */
export function toPlainExcerpt(input: string, max = 120): string {
  const text = input
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

/** 任意の日付文字列を ISO 8601 に正規化。パース不能なら epoch を返す（並べ替えで最後尾に来る）。 */
export function toIso(date: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? new Date(0).toISOString()
    : d.toISOString();
}

/** RSS の enclosure 文字列 / media:thumbnail（string か {@_url}/{#text} オブジェクト）から URL を取り出す。 */
export function extractThumbnail(node: unknown): string | undefined {
  if (!node) return undefined;
  if (typeof node === "string") return node || undefined;
  if (typeof node === "object") {
    const o = node as Record<string, unknown>;
    const v = o["@_url"] ?? o["#text"];
    return typeof v === "string" && v ? v : undefined;
  }
  return undefined;
}

/** publishedAt（ISO）の新しい順に並べた新しい配列を返す。 */
export function sortByPublishedDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}
