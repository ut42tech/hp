# サイト再構成（統合ホーム Bento + Blogs）Implementation Plan

> **ステータス**: 完了（2026-08-31 時点） — 全 74 項目中 完了 72 / 不要 2 / 未完了 0

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Home と About を1ページの Bento 自己紹介ページに統合し、Works/Gallery ページを廃止し、Qiita/Zenn/note の記事を自動集約する `/blogs` を新設する。

**Architecture:** App Router の Server Component で外部API/RSS をビルド時取得（ISR・`Promise.allSettled` で耐障害）。コンテンツは引き続き `src/content/*.ts` のプレーンデータ。ナビは `src/lib/navigation.ts` 単一ソース。

**Tech Stack:** Next.js 16.2.3 (App Router) / React 19 / TypeScript / Tailwind v4 / shadcn(base-ui) / motion / Biome 2.2 / 新規 `fast-xml-parser`。

---

## Pre-flight（重要な前提）

- **設計書:** `docs/superpowers/specs/2026-06-02-site-restructure-bento-blogs-design.md` が一次ソース。
- **Next.js 16 のキャッシュモデル:** `next.config.ts` で `cacheComponents` は**無効**。よって従来モデルが有効で、ルートの `export const revalidate = N` と `fetch(url, { next: { revalidate: N } })` がそのまま使える（`revalidate` 等は Cache Components 有効時のみ削除される）。本計画は従来モデルを使う。
- **検証方法:** リポジトリにテストランナーは無く（Biome のみ）、設計書の検証方針も「lint + build + 実データ描画確認」。本計画もそれに従い、**テストフレームワークは追加しない**。各タスクのゲートは次の通り:
  - 型チェック: `pnpm exec tsc --noEmit`
  - Lint: `pnpm lint`（Biome）
  - 結合点でのビルド: `pnpm build`
  - 実描画確認: `pnpm dev`（必要に応じ handle を既知のアクティブユーザに一時差し替え）
- **画像方針:** ブログのサムネは外部ホスト（Cloudinary / note assets 等）で可変のため、`next/image` の `remotePatterns` 設定は使わず、ブログカードでは素の `<img loading="lazy">` を使う。ローカル写真（profile）の `next/image` は現状維持。
- **コミット:** 各タスク末尾でコミット。現在のブランチは `develop`。
- **検証済みの取得元（2026-06-02）:**
  - Qiita: `GET https://qiita.com/api/v2/users/{username}/items?per_page=100`（認証不要・CORS可）。item に `title,url,created_at,body,tags[].name,likes_count`。サムネ無し。
  - Zenn: `https://zenn.dev/{username}/feed`（RSS2.0・最新20件）。item に `title,link,pubDate,description,enclosure[@_url]`（OG画像URL）。タグ無し。
  - note: `https://note.com/{username}/rss`（RSS2.0）。item に `title,link,pubDate,description,media:thumbnail`。タグ無し。

---

## File Structure

**新規（ブログ・データ層 `src/lib/blog/`）**
- `types.ts` — `BlogPost` / `BlogPlatform`
- `config.ts` — handle・revalidate秒・プロフィールURL
- `utils.ts` — 純粋関数: 抜粋整形・サムネ抽出・日付正規化・並べ替え
- `qiita.ts` — `parseQiitaItems`（純粋）＋ `fetchQiita`
- `rss.ts` — `parseRssItems`（純粋）＋ `fetchZenn` / `fetchNote`
- `index.ts` — `getAllBlogPosts` / `getLatestBlogPosts`

**新規（ブログUI `src/components/blog/`）**
- `platform-meta.tsx` — プラットフォーム別ラベル・色・アイコン
- `blog-card.tsx` — 記事カード（Server）
- `blog-filter.tsx` — フィルタ＋グリッド（Client, Timeline と同じ pill パターン）

**新規（ルート）**
- `src/app/blogs/page.tsx` — Blogs（Server, ISR）
- `src/app/blogs/loading.tsx` — ローディングUI

**新規（ホーム用タイル）**
- `src/components/bento/blog-teaser-tile.tsx` — 最新記事タイル（Server）
- `src/components/bento/selected-works-tile.tsx` — `featured-tile.tsx` を改名・外部リンク化
- `src/components/home/timeline.tsx` — `about/timeline.tsx` を移設

**修正**
- `src/lib/navigation.ts`、`src/app/page.tsx`、`src/app/sitemap.ts`、`src/content/works.ts`、`next.config.ts`（remotePatterns 不要だが確認）

**削除**
- `src/app/about/`、`src/app/works/`、`src/app/gallery/`
- `src/components/works/`、`src/components/gallery/`、`src/components/shared/under-construction.tsx`、`src/components/bento/featured-tile.tsx`（改名のため）
- `src/content/gallery.ts`、`public/photos/placeholder-*.svg`

---

## Phase 1 — 依存追加とブログ・データ層

### Task 1: 依存追加（fast-xml-parser）

**Files:**
- Modify: `package.json`（依存）

- [x] **Step 1: fast-xml-parser を追加**

Run:
```bash
pnpm add fast-xml-parser
```
Expected: `package.json` の `dependencies` に `fast-xml-parser` が追加される。

- [x] **Step 2: インストール確認**

Run:
```bash
pnpm exec node -e "console.log(require('fast-xml-parser/package.json').version)"
```
Expected: バージョン番号（例 `5.x.x`）が表示される。

- [x] **Step 3: コミット**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: ブログRSSパース用に fast-xml-parser を追加"
```

---

### Task 2: ブログの型と設定

**Files:**
- Create: `src/lib/blog/types.ts`
- Create: `src/lib/blog/config.ts`

- [x] **Step 1: 型定義を作成**

`src/lib/blog/types.ts`:
```ts
export type BlogPlatform = "qiita" | "zenn" | "note";

export interface BlogPost {
  platform: BlogPlatform;
  title: string;
  url: string;
  /** ISO 8601 文字列 */
  publishedAt: string;
  excerpt?: string;
  thumbnail?: string;
  /** 取得できるプラットフォームのみ（現状 Qiita のみ） */
  tags?: string[];
  /** 取得できるプラットフォームのみ（現状 Qiita のみ） */
  likes?: number;
}
```

- [x] **Step 2: 設定を作成**

`src/lib/blog/config.ts`:
```ts
import type { BlogPlatform } from "./types";

/** 各プラットフォームのユーザー名。記事取得とプロフィールリンクに使用。 */
export const blogHandles: Record<BlogPlatform, string> = {
  qiita: "ut42tech",
  zenn: "ut42tech",
  note: "ut42tech",
};

/** ISR の再生成間隔（秒）。1時間。 */
export const BLOG_REVALIDATE_SECONDS = 3600;

/** 空状態で案内する各プラットフォームのプロフィールURL。 */
export const blogProfileUrls: Record<BlogPlatform, string> = {
  qiita: `https://qiita.com/${blogHandles.qiita}`,
  zenn: `https://zenn.dev/${blogHandles.zenn}`,
  note: `https://note.com/${blogHandles.note}`,
};
```

- [x] **Step 3: 型チェック**

Run: `pnpm exec tsc --noEmit`
Expected: エラー無し（exit 0）。

- [x] **Step 4: コミット**

```bash
git add src/lib/blog/types.ts src/lib/blog/config.ts
git commit -m "feat(blog): ブログ集約の型と handle 設定を追加"
```

---

### Task 3: 純粋ユーティリティ（抜粋・サムネ・日付・並べ替え）

**Files:**
- Create: `src/lib/blog/utils.ts`

- [x] **Step 1: ユーティリティを実装**

`src/lib/blog/utils.ts`:
```ts
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
  return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
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
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}
```

- [x] **Step 2: 型チェック**

Run: `pnpm exec tsc --noEmit`
Expected: エラー無し。

- [x] **Step 3: 動作を一時確認（ランタイム）**

Run:
```bash
pnpm exec node -e "
const { toPlainExcerpt, toIso, extractThumbnail } = require('esbuild-register/dist/node') ? {} : {};
" 2>/dev/null; echo "skip-if-unavailable"
```
（注: tsx/ts-node が無いため厳密な単体実行は不要。型チェックとビルドで担保し、実データは Task 9 の `pnpm dev` で確認する。本ステップはスキップ可。）

- [x] **Step 4: Lint**

Run: `pnpm lint`
Expected: `src/lib/blog/utils.ts` に関するエラー無し（必要なら `pnpm format`）。

- [x] **Step 5: コミット**

```bash
git add src/lib/blog/utils.ts
git commit -m "feat(blog): 抜粋・サムネ抽出・日付正規化・並べ替えのユーティリティを追加"
```

---

### Task 4: Qiita 取得（純粋パース + fetch）

**Files:**
- Create: `src/lib/blog/qiita.ts`

- [x] **Step 1: 実装**

`src/lib/blog/qiita.ts`:
```ts
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
```

- [x] **Step 2: 型チェック**

Run: `pnpm exec tsc --noEmit`
Expected: エラー無し。

- [x] **Step 3: Lint**

Run: `pnpm lint`
Expected: 当該ファイルにエラー無し。

- [x] **Step 4: コミット**

```bash
git add src/lib/blog/qiita.ts
git commit -m "feat(blog): Qiita API v2 のフェッチャと正規化を追加"
```

---

### Task 5: Zenn / note 取得（RSS 共通パース + fetch）

**Files:**
- Create: `src/lib/blog/rss.ts`

- [x] **Step 1: 実装**

`src/lib/blog/rss.ts`:
```ts
import { XMLParser } from "fast-xml-parser";

import { BLOG_REVALIDATE_SECONDS, blogHandles } from "./config";
import type { BlogPlatform, BlogPost } from "./types";
import { extractThumbnail, toIso, toPlainExcerpt } from "./utils";

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
    .filter((it): it is RssItem & { title: string; link: string } =>
      Boolean(it.title && it.link),
    )
    .map((it) => ({
      platform,
      title: String(it.title),
      url: String(it.link),
      publishedAt: toIso(it.pubDate ?? ""),
      excerpt: it.description ? toPlainExcerpt(it.description) : undefined,
      thumbnail:
        extractThumbnail(it.enclosure?.["@_url"]) ??
        extractThumbnail(it["media:thumbnail"]),
    }));
}

async function fetchRss(platform: BlogPlatform, url: string): Promise<BlogPost[]> {
  const res = await fetch(url, { next: { revalidate: BLOG_REVALIDATE_SECONDS } });
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
```

- [x] **Step 2: 型チェック**

Run: `pnpm exec tsc --noEmit`
Expected: エラー無し。

- [x] **Step 3: Lint**

Run: `pnpm lint`
Expected: 当該ファイルにエラー無し。

- [x] **Step 4: コミット**

```bash
git add src/lib/blog/rss.ts
git commit -m "feat(blog): Zenn/note の RSS フェッチャと共通正規化を追加"
```

---

### Task 6: 集約関数

**Files:**
- Create: `src/lib/blog/index.ts`

- [x] **Step 1: 実装**

`src/lib/blog/index.ts`:
```ts
import { fetchQiita } from "./qiita";
import { fetchNote, fetchZenn } from "./rss";
import type { BlogPost } from "./types";
import { sortByPublishedDesc } from "./utils";

/** 3プラットフォームを並行取得し、失敗は無視して成功分のみを新着順で返す。 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const results = await Promise.allSettled([fetchQiita(), fetchZenn(), fetchNote()]);
  const posts: BlogPost[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      posts.push(...result.value);
    } else {
      console.error("[blog] fetch failed:", result.reason);
    }
  }
  return sortByPublishedDesc(posts);
}

/** 最新 limit 件（ホームのティーザー用）。 */
export async function getLatestBlogPosts(limit: number): Promise<BlogPost[]> {
  const all = await getAllBlogPosts();
  return all.slice(0, limit);
}
```

- [x] **Step 2: 型チェック**

Run: `pnpm exec tsc --noEmit`
Expected: エラー無し。

- [x] **Step 3: Lint**

Run: `pnpm lint`
Expected: 当該ファイルにエラー無し。

- [x] **Step 4: コミット**

```bash
git add src/lib/blog/index.ts
git commit -m "feat(blog): allSettled で耐障害な集約関数を追加"
```

---

## Phase 2 — Blogs ページと UI

### Task 7: プラットフォームメタとブログカード

**Files:**
- Create: `src/components/blog/platform-meta.tsx`
- Create: `src/components/blog/blog-card.tsx`

- [x] **Step 1: プラットフォームメタを作成**

`src/components/blog/platform-meta.tsx`:
```tsx
import { SiNote, SiQiita, SiZenn } from "@icons-pack/react-simple-icons";
import type { ComponentType } from "react";

import type { BlogPlatform } from "@/lib/blog/types";

interface PlatformMeta {
  label: string;
  /** バッジ・プレースホルダの色（ブランド準拠） */
  color: string;
  Icon: ComponentType<{ className?: string }>;
}

export const platformMeta: Record<BlogPlatform, PlatformMeta> = {
  qiita: { label: "Qiita", color: "#55C500", Icon: SiQiita },
  zenn: { label: "Zenn", color: "#3EA8FF", Icon: SiZenn },
  note: { label: "note", color: "#41C9B4", Icon: SiNote },
};
```

- [x] **Step 2: ブログカードを作成**

`src/components/blog/blog-card.tsx`:
```tsx
import { Card } from "@/components/ui/card";
import type { BlogPost } from "@/lib/blog/types";

import { platformMeta } from "./platform-meta";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function BlogCard({ post }: { post: BlogPost }) {
  const meta = platformMeta[post.platform];
  const { Icon } = meta;

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noreferrer"
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card transition-colors group-hover:border-accent">
        <div className="relative aspect-[1.91/1] w-full overflow-hidden">
          {post.thumbnail ? (
            // 外部の可変ホストのため next/image ではなく素の img を使う
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.thumbnail}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              style={{ backgroundColor: meta.color }}
            >
              <Icon className="size-10 text-white" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
            style={{ color: meta.color }}
          >
            <Icon className="size-3.5" />
            {meta.label}
          </span>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {formatDate(post.publishedAt)}
            {typeof post.likes === "number" ? ` ・ ♥ ${post.likes}` : ""}
          </p>
          {post.excerpt ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          {post.tags?.length ? (
            <div className="mt-auto flex flex-wrap gap-1 pt-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </a>
  );
}
```

- [x] **Step 3: 型チェック + Lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: エラー無し（`<img>` の lint 警告が Biome で出る場合は許容、または上記コメントで抑制）。

- [x] **Step 4: コミット**

```bash
git add src/components/blog/platform-meta.tsx src/components/blog/blog-card.tsx
git commit -m "feat(blog): プラットフォームメタと記事カードを追加"
```

---

### Task 8: ブログフィルタ（Client・pill パターン）

**Files:**
- Create: `src/components/blog/blog-filter.tsx`

- [x] **Step 1: 実装（Timeline と同じ button+Badge の pill フィルタを踏襲）**

`src/components/blog/blog-filter.tsx`:
```tsx
"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import type { BlogPlatform, BlogPost } from "@/lib/blog/types";

import { BlogCard } from "./blog-card";

type Filter = "all" | BlogPlatform;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "qiita", label: "Qiita" },
  { value: "zenn", label: "Zenn" },
  { value: "note", label: "note" },
];

export function BlogFilter({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState<Filter>("all");

  const filtered =
    active === "all" ? posts : posts.filter((p) => p.platform === active);

  return (
    <div className="flex flex-col gap-6">
      <fieldset
        aria-label="記事のプラットフォームフィルター"
        className="flex flex-wrap gap-2 border-none p-0"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={active === f.value}
            onClick={() => setActive(f.value)}
          >
            <Badge
              variant={active === f.value ? "default" : "secondary"}
              className="cursor-pointer transition-colors"
            >
              {f.label}
            </Badge>
          </button>
        ))}
      </fieldset>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          このプラットフォームの記事はまだありません。
        </p>
      ) : (
        <ul
          aria-live="polite"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((post) => (
            <li key={post.url}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [x] **Step 2: 型チェック + Lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: エラー無し。

- [x] **Step 3: コミット**

```bash
git add src/components/blog/blog-filter.tsx
git commit -m "feat(blog): プラットフォーム別フィルタ（pill）を追加"
```

---

### Task 9: Blogs ページ + ローディング

**Files:**
- Create: `src/app/blogs/page.tsx`
- Create: `src/app/blogs/loading.tsx`

- [x] **Step 1: ページを作成**

`src/app/blogs/page.tsx`:
```tsx
import type { Metadata } from "next";

import { BlogFilter } from "@/components/blog/blog-filter";
import { FadeIn } from "@/components/motion/fade-in";
import { getAllBlogPosts } from "@/lib/blog";
import { blogProfileUrls, BLOG_REVALIDATE_SECONDS } from "@/lib/blog/config";

export const revalidate = 3600; // BLOG_REVALIDATE_SECONDS と同値（route segment config は静的リテラルを要求）

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Qiita・Zenn・note に投稿した記事をまとめています。Web 開発・HCI・クリエイティブな取り組みの記録。",
  alternates: { canonical: "/blogs" },
};

export default async function BlogsPage() {
  const posts = await getAllBlogPosts();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <FadeIn>
        <header className="mb-10 flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Blog
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            記事一覧
          </h1>
          <p className="text-sm text-muted-foreground">
            Qiita・Zenn・note の記事をまとめています。
          </p>
        </header>
      </FadeIn>

      <FadeIn delay={0.05}>
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              記事はまだありません。各プラットフォームをご覧ください。
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href={blogProfileUrls.qiita}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Qiita
              </a>
              <a
                href={blogProfileUrls.zenn}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Zenn
              </a>
              <a
                href={blogProfileUrls.note}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                note
              </a>
            </div>
          </div>
        ) : (
          <BlogFilter posts={posts} />
        )}
      </FadeIn>
    </section>
  );
}
```

> 注: `BLOG_REVALIDATE_SECONDS` は import するが route の `revalidate` には静的リテラル `3600` が必要なため別個に書く。lint で未使用 import を指摘されたら import を削除すること。

- [x] **Step 2: ローディングUIを作成**

`src/app/blogs/loading.tsx`:
```tsx
export default function Loading() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex flex-col gap-2">
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        <div className="h-9 w-40 animate-pulse rounded bg-muted" />
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li
            key={i}
            className="h-64 animate-pulse rounded-2xl border border-border bg-muted/40"
          />
        ))}
      </ul>
    </section>
  );
}
```

- [x] **Step 3: 未使用 import の整理**

`src/app/blogs/page.tsx` で `BLOG_REVALIDATE_SECONDS` を実際に使っていなければ import から削除する。
Run: `pnpm lint`
Expected: 未使用 import エラーが無いこと。必要なら修正。

- [x] **Step 4: ビルド確認**

Run: `pnpm build`
Expected: ビルド成功。`/blogs` がルートとして出力される。

- [x] **Step 5: 実データ描画確認**

Run: `pnpm dev`（別ターミナル）→ ブラウザで `http://localhost:3000/blogs`
- `ut42tech` が現在0件のため「記事はまだありません」が表示されることを確認。
- 取得経路の確認として、一時的に `src/lib/blog/config.ts` の各 handle を既知のアクティブユーザ（例: zenn=`catnose99`、qiita=`Qiita`）に差し替えて再読込し、カードが新着順で描画され、フィルタが効くことを確認。**確認後 handle は `ut42tech` に戻す。**

- [x] **Step 6: コミット**

```bash
git add src/app/blogs/page.tsx src/app/blogs/loading.tsx
git commit -m "feat(blog): Blogs ページ（ISR・空状態・ローディング）を追加"
```

---

### Task 10: ナビに Blogs を追加

**Files:**
- Modify: `src/lib/navigation.ts`

- [x] **Step 1: navItems を更新**

`src/lib/navigation.ts` を次の内容に置換:
```ts
export const navItems = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blogs" },
] as const;
```

> 注: この時点で `/about` `/works` `/gallery` への nav リンクは消えるが、各ページはまだ存在する（Phase 4 で削除）。リンクが消えるだけで壊れない。

- [x] **Step 2: 型チェック + Lint + ビルド**

Run: `pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: エラー無し。ヘッダー・フッター・モバイルナビが `Home ・ Blogs` の2項目になる。

- [x] **Step 3: コミット**

```bash
git add src/lib/navigation.ts
git commit -m "feat: ナビゲーションを Home・Blogs の2項目に変更"
```

---

## Phase 3 — 統合ホーム

### Task 11: Selected Works タイル（featured-tile を改名・外部リンク化）

**Files:**
- Create: `src/components/bento/selected-works-tile.tsx`
- Delete: `src/components/bento/featured-tile.tsx`

- [~] **Step 1: 新タイルを作成（詳細ページ廃止 → 外部 Demo/GitHub へ）** <!-- 設計変更により不要 -->

`src/components/bento/selected-works-tile.tsx`:
```tsx
import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getFeaturedWorks } from "@/content/works";
import type { Work } from "@/content/types";
import { cn } from "@/lib/utils";

interface SelectedWorksTileProps {
  className?: string;
}

/** 作品の主要外部リンク（demo > github > 先頭）を返す。無ければ undefined。 */
function primaryLink(work: Work): string | undefined {
  return (
    work.links.find((l) => l.kind === "demo")?.href ??
    work.links.find((l) => l.kind === "github")?.href ??
    work.links[0]?.href
  );
}

export function SelectedWorksTile({ className }: SelectedWorksTileProps) {
  const works = getFeaturedWorks();

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-lg font-bold">Selected Works</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => {
          const href = primaryLink(work);
          const inner = (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {work.category}
              </p>
              <h3 className="text-base font-bold leading-snug">{work.title}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {work.summary}
              </p>
            </>
          );

          return (
            <li key={work.slug}>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="flex items-center justify-between gap-2 text-muted-foreground">
                    <span className="sr-only">{work.title}</span>
                    <ArrowUpRight className="ml-auto size-4" />
                  </span>
                  {inner}
                </a>
              ) : (
                <div className="flex h-full flex-col gap-2 rounded-2xl border border-border bg-background p-4">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
```

- [x] **Step 2: 旧 featured-tile を削除**

Run:
```bash
git rm src/components/bento/featured-tile.tsx
```
（page.tsx の import は Task 13 で差し替えるため、この時点でビルドは一時的に壊れる。次タスクまで連続実行する。）

- [x] **Step 3: 型チェック**

Run: `pnpm exec tsc --noEmit`
Expected: `app/page.tsx` が削除済みの FeaturedTile を import しているエラーのみ（Task 13 で解消）。新タイル自体の型エラーは無いこと。

- [x] **Step 4: コミット**

```bash
git add src/components/bento/selected-works-tile.tsx
git commit -m "feat(home): Selected Works タイルを追加し旧 FeaturedTile を置換（外部リンク化）"
```

---

### Task 12: Latest Blog ティーザータイル

**Files:**
- Create: `src/components/bento/blog-teaser-tile.tsx`

- [x] **Step 1: 実装（最新記事を受け取り表示。空/未取得時は誘導リンクのみ）**

`src/components/bento/blog-teaser-tile.tsx`:
```tsx
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { platformMeta } from "@/components/blog/platform-meta";
import { Card } from "@/components/ui/card";
import type { BlogPost } from "@/lib/blog/types";
import { cn } from "@/lib/utils";

interface BlogTeaserTileProps {
  posts: BlogPost[];
  className?: string;
}

export function BlogTeaserTile({ posts, className }: BlogTeaserTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Latest Blog</h2>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View all
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          記事は準備中です。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => {
            const meta = platformMeta[post.platform];
            return (
              <li key={post.url}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-1 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                    {post.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
```

- [x] **Step 2: 型チェック + Lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: 当該ファイルにエラー無し（page.tsx 関連の既存エラーは Task 13 で解消）。

- [x] **Step 3: コミット**

```bash
git add src/components/bento/blog-teaser-tile.tsx
git commit -m "feat(home): 最新記事ティーザータイルを追加"
```

---

### Task 13: /about 削除 + Timeline 移設 + ホーム再構成

**Files:**
- Delete: `src/app/about/`
- Create: `src/components/home/timeline.tsx`（`about/timeline.tsx` から移設）
- Delete: `src/components/about/timeline.tsx`
- Modify: `src/app/page.tsx`

> 注: `/about` の唯一の固有要素は Timeline 表示。これをホームへ移すため、`/about` ルート削除と Timeline 移設・ホーム再構成は同一タスクで連続実行し、各ステップ末に壊れた状態を残さない。

- [x] **Step 1: /about ルートを削除**

`/about` の内容（bio はホームの AboutTile に既存、Timeline は次ステップでホームへ移設）はホームに統合されるため、ルートを先に削除して Timeline の唯一の他参照を断つ。

Run:
```bash
git rm -r src/app/about
```

- [x] **Step 2: Timeline を移設**

Run:
```bash
mkdir -p src/components/home
git mv src/components/about/timeline.tsx src/components/home/timeline.tsx
```
（中身の変更は不要。import 元が変わるだけ。）

- [x] **Step 3: ホームを再構成**

`src/app/page.tsx` を次の内容に全置換:
```tsx
import type { Metadata } from "next";

import { AboutTile } from "@/components/bento/about-tile";
import { BlogTeaserTile } from "@/components/bento/blog-teaser-tile";
import { ContactTile } from "@/components/bento/contact-tile";
import { HeroTile } from "@/components/bento/hero-tile";
import { PhotoTile } from "@/components/bento/photo-tile";
import { SelectedWorksTile } from "@/components/bento/selected-works-tile";
import { TechStackTile } from "@/components/bento/tech-stack-tile";
import { Timeline } from "@/components/home/timeline";
import {
  BentoMotionContainer,
  BentoTileMotion,
} from "@/components/motion/bento-tile-motion";
import { Card } from "@/components/ui/card";
import { getLatestBlogPosts } from "@/lib/blog";
import { profile } from "@/content/profile";

export const revalidate = 3600;

export const metadata: Metadata = {
  description:
    "Takuya Uehara の自己紹介。Creative Engineer として、デザインとテクノロジーで最高のユーザ体験を届けることをモットーに、ソフトウェア開発・HCI 研究・コミュニティ活動に取り組んでいます。経歴・技術スタック・代表作・写真をまとめています。",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const latestPosts = await getLatestBlogPosts(3);

  // photos: [0]=タージ・マハル, [1]=富士山, [2]=アユタヤ
  const fuji = profile.photos.at(1);
  const taj = profile.photos.at(0);
  const ayutthaya = profile.photos.at(2);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <BentoMotionContainer className="grid grid-flow-row-dense grid-cols-2 gap-4 md:grid-cols-6">
        <BentoTileMotion className="col-span-2 md:col-span-6 md:row-span-2">
          <HeroTile className="h-full" />
        </BentoTileMotion>

        <BentoTileMotion className="col-span-2 md:col-span-4 md:row-span-2">
          <AboutTile className="h-full" />
        </BentoTileMotion>

        <BentoTileMotion className="col-span-1 md:col-span-2">
          <TechStackTile className="h-full" />
        </BentoTileMotion>
        <BentoTileMotion className="col-span-1 md:col-span-2">
          <ContactTile className="h-full" />
        </BentoTileMotion>

        {/* Journey 写真: モバイルは富士山を縦長(row-span-2)にして非対称 Bento を作る */}
        {fuji ? (
          <BentoTileMotion className="col-span-1 row-span-2 md:col-span-2 md:row-span-1">
            <PhotoTile photo={fuji} className="h-full" />
          </BentoTileMotion>
        ) : null}
        {taj ? (
          <BentoTileMotion className="col-span-1 md:col-span-2">
            <PhotoTile photo={taj} className="h-full" />
          </BentoTileMotion>
        ) : null}
        {ayutthaya ? (
          <BentoTileMotion className="col-span-1 md:col-span-2">
            <PhotoTile photo={ayutthaya} className="h-full" />
          </BentoTileMotion>
        ) : null}

        <BentoTileMotion className="col-span-2 md:col-span-4">
          <SelectedWorksTile className="h-full" />
        </BentoTileMotion>
        <BentoTileMotion className="col-span-2 md:col-span-2">
          <BlogTeaserTile posts={latestPosts} className="h-full" />
        </BentoTileMotion>

        <BentoTileMotion className="col-span-2 md:col-span-6">
          <Card className="flex flex-col gap-6 rounded-3xl border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight">Timeline</h2>
            <Timeline entries={profile.timeline} />
          </Card>
        </BentoTileMotion>
      </BentoMotionContainer>
    </section>
  );
}
```

- [x] **Step 4: 参照確認（/about と旧 timeline パスが消えたか）**

Run: `grep -rn "\"/about\"\|'/about'\|app/about\|about/timeline" src/`
Expected: 出力無し（`app/page.tsx` は `@/components/home/timeline` を使用）。

- [x] **Step 5: 型チェック + Lint + ビルド**

Run: `pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: エラー無し。`/` がビルドされ、`/about` がビルド対象から消える。

- [x] **Step 6: 実描画確認（PC/モバイル両方）**

Run: `pnpm dev` → `http://localhost:3000/`
- PC幅で Bento が `md:grid-cols-6` のモザイクになる（Hero全幅 / About大 / Tech・Contact / 写真3枚 / Selected Works / Latest Blog / Timeline全幅）。
- ブラウザを ~375px に縮小し、`grid-cols-2` で富士山写真が縦長になり、1列スタックに崩れず非対称 Bento になっていることを確認。
- Selected Works のカードが外部リンク（新規タブ）で開くこと。
- `/about` が 404 になること。

- [x] **Step 7: コミット**

```bash
git add -A
git commit -m "feat(home): Home と About を Bento 1ページに統合（/about 削除・写真Journey・Selected Works・Latest Blog・Timeline）"
```

---

## Phase 4 — Works / Gallery の削除とクリーンアップ

### Task 14: /works ルート・コンポーネント削除と works.ts の整理

**Files:**
- Delete: `src/app/works/`、`src/components/works/`
- Modify: `src/content/works.ts`

- [x] **Step 1: ルートとコンポーネントを削除**

Run:
```bash
git rm -r src/app/works src/components/works
```

- [~] **Step 2: works.ts の未使用 export を削除** <!-- 設計変更により不要 -->

`src/content/works.ts` から、詳細ページ廃止で未使用になる `getWorkBySlug` / `getWorksByCategory` / `workCategories` を削除する。`works`（配列）と `getFeaturedWorks` は残す。

Run（残存確認の手がかり）:
```bash
grep -n "export" src/content/works.ts
```
編集後、`works` と `getFeaturedWorks` のみが export されている状態にする。

> 具体的には末尾の以下3つを削除:
> - `export function getWorkBySlug(slug: string): Work | undefined { ... }`
> - `export function getWorksByCategory(category: WorkCategory): Work[] { ... }`
> - `export const workCategories: { value: WorkCategory; label: string }[] = [ ... ]`
>
> それに伴い未使用になる型 import（`WorkCategory`）も `import type { Work } from "./types";` に整理する。

- [x] **Step 3: 参照確認**

Run:
```bash
grep -rn "getWorkBySlug\|getWorksByCategory\|workCategories\|components/works\|app/works\|\"/works\"\|'/works'" src/
```
Expected: 出力無し。

- [x] **Step 4: 型チェック + Lint + ビルド**

Run: `pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: エラー無し。`/works` と `/works/[slug]` が消える。

- [x] **Step 5: コミット**

```bash
git add -A
git commit -m "refactor: /works ページ・コンポーネントを削除し works.ts を整理（代表作はホームへ）"
```

---

### Task 15: /gallery・写真プレースホルダ・under-construction の削除

**Files:**
- Delete: `src/app/gallery/`、`src/components/gallery/`、`src/content/gallery.ts`、`src/components/shared/under-construction.tsx`、`public/photos/placeholder-*.svg`

- [x] **Step 1: 削除**

Run:
```bash
git rm -r src/app/gallery src/components/gallery
git rm src/content/gallery.ts src/components/shared/under-construction.tsx
git rm public/photos/placeholder-*.svg
```

- [x] **Step 2: 参照確認**

Run:
```bash
grep -rn "content/gallery\|gallery-card\|galleryPhotos\|UnderConstruction\|under-construction\|app/gallery\|\"/gallery\"\|'/gallery'\|placeholder-" src/
```
Expected: 出力無し。

- [x] **Step 3: home 写真が残っていることを確認**

Run: `ls public/photos/home`
Expected: `1.jpg 2.jpg 3.jpg` が残っている。

- [x] **Step 4: 型チェック + Lint + ビルド**

Run: `pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: エラー無し。`/gallery` が消える。

- [x] **Step 5: コミット**

```bash
git add -A
git commit -m "refactor: /gallery・仮画像・under-construction を削除（人物像写真3枚はホームで活用）"
```

---

### Task 16: sitemap を更新

**Files:**
- Modify: `src/app/sitemap.ts`

- [x] **Step 1: sitemap を `/` と `/blogs` のみに置換**

`src/app/sitemap.ts` を次の内容に全置換:
```ts
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
```

- [x] **Step 2: works 参照が消えたか確認**

Run: `grep -rn "content/works" src/app/sitemap.ts`
Expected: 出力無し。

- [x] **Step 3: 型チェック + ビルド**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: エラー無し。

- [x] **Step 4: sitemap 出力確認**

Run: `pnpm dev` → `http://localhost:3000/sitemap.xml`
Expected: `https://ut42tech.com/` と `https://ut42tech.com/blogs` の2 URL のみ。

- [x] **Step 5: コミット**

```bash
git add src/app/sitemap.ts
git commit -m "refactor: sitemap を / と /blogs のみに更新"
```

---

## Phase 5 — 最終検証

### Task 17: 全体検証

**Files:** （変更なし。検証のみ）

- [x] **Step 1: クリーンビルド + Lint**

Run:
```bash
pnpm lint && pnpm build
```
Expected: 両方成功。警告に新規の致命的問題が無いこと。

- [x] **Step 2: 削除ルートの 404 と新ルートの描画**

Run: `pnpm start`（`pnpm build` 後）→ 以下を確認:
- `/` … Bento 統合ホームが PC/モバイル両方で正しく描画。
- `/blogs` … 一覧（または空状態）が描画。フィルタが効く。
- `/about` `/works` `/gallery` … いずれも 404。
- ヘッダー・フッター・モバイルナビが `Home ・ Blogs` の2項目。

- [x] **Step 3: モバイル Bento の最終目視（〜375px）**

ブラウザを 375px 幅にして `/` を確認:
- 1列に崩れず `grid-cols-2` のモザイクになっている。
- 富士山写真が縦長タイルとして非対称感を作っている。
- 各タイルが読みやすく破綻していない（必要なら span を微調整して再コミット）。

- [x] **Step 4: handle が ut42tech に戻っているか最終確認**

Run: `grep -n "ut42tech" src/lib/blog/config.ts`
Expected: qiita/zenn/note すべて `ut42tech`。

- [x] **Step 5: 完了コミット（差分があれば）**

```bash
git add -A
git commit -m "chore: サイト再構成の最終調整と検証" || echo "no changes to commit"
```

---

## Self-Review（spec との突き合わせ）

- **IA / ルーティング（spec §2）:** Task 10（nav）/13（about削除）/14（works削除）/15（gallery削除）/9（blogs新設）でカバー。
- **統合ホーム（spec §3）:** Task 11（Selected Works）/12（Blog teaser）/13（about削除・Bento再構成・写真Journey・Timeline移設・モバイル非対称・メタデータ）でカバー。
- **Blogs（spec §4）:** Task 2–6（データ層: 型・config・utils・qiita・rss・集約）/7–9（UI・ページ・空状態・ISR）でカバー。検証済みエンドポイントを使用。
- **コンテンツ層（spec §5）:** profile.photos / PhotoEntry は保持（Task 13 で使用）。works.ts は Task 14 で整理。gallery.ts は Task 15 で削除。
- **ファイル変更（spec §6）:** 削除・修正・追加すべて対応タスクあり。`featured-tile.tsx` は Task 11 で改名、`under-construction.tsx` は Task 15 で削除。
- **依存（spec §7）:** Task 1 で fast-xml-parser。
- **SEO（spec §8）:** Task 16（sitemap）。robots は変更不要のため対象外。
- **ローンチ運用（spec §9）:** `site.underConstruction` の切り替えは構造変更と独立のため本計画では触れない（公開判断時に別途）。
- **型整合性:** `BlogPost` / `BlogPlatform` は Task 2 で定義し、utils/qiita/rss/index/UI 全体で同一シグネチャを使用。`getAllBlogPosts` / `getLatestBlogPosts` / `parseQiitaItems` / `parseRssItems` の名前は全タスクで一致。
- **プレースホルダ:** 各コード手順は完全な実装を記載。TBD/TODO 無し。
