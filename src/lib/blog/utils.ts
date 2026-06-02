import type { BlogPost } from "./types";

/** HTML エンティティ（名前付き・数値・16進数値）を対応文字にデコードする。 */
export function decodeHtmlEntities(text: string): string {
  // 数値エンティティ（10進: &#NNN; / 16進: &#xHH;）を先にデコード
  const withNumeric = text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#([0-9]+);/g, (_, dec) =>
      String.fromCodePoint(Number.parseInt(dec, 10)),
    );
  // 名前付きエンティティをデコード（&amp; は二重デコードを防ぐため最後）
  return withNumeric
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** HTML/Markdown 由来の文字列からプレーンな抜粋を作る。タグ除去・エンティティデコード・空白圧縮・最大長で切る。 */
export function toPlainExcerpt(input: string, max = 120): string {
  const text = decodeHtmlEntities(input.replace(/<[^>]*>/g, " "))
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
