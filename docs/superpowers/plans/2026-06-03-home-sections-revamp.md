# ホーム再構成（Keywords / Projects / Press / Hero）Implementation Plan

> **ステータス**: 完了（2026-08-31 時点） — 全 72 項目中 完了 53 / 不要 19 / 未完了 0

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ホーム（`/`）の Hero を作り直し、About を Keywords（中心放射バッジ・衝突回避）に置換、Selected Works 枠を Press タイル＋`/press` 一覧に、Projects を Timeline 直上のフル幅セクションで全件表示する。

**Architecture:** 既存の Server Component 中心の Bento 構成を踏襲。Keywords タイルのみ `"use client"` で `d3-force`（`forceCollide`＋`forceRadial`）による衝突回避レイアウトを行い、座標算出は純関数 `computeKeywordLayout` に分離してユニットテストする。Press は外部 API を使わない手動キュレーション（`src/content/press.ts`）。検証は純ロジック＝Vitest、ビジュアル＝`pnpm lint` / `pnpm build` / ブラウザ。

**Tech Stack:** Next.js 16 (App Router) / React 19 / Tailwind v4 / shadcn(base-ui) / motion / lucide-react / @icons-pack/react-simple-icons / **d3-force（新規）** / **Vitest（新規・純ロジック用）** / Biome / pnpm

> **実装前に必読:** `AGENTS.md` の指示により、本リポジトリの Next.js は通常知識と異なる破壊的変更があり得る。コードを書く前に `node_modules/next/dist/docs/` の該当ガイド（App Router / client components / metadata / file conventions）を確認すること。

**設計書:** `docs/superpowers/specs/2026-06-03-home-sections-revamp-design.md`

---

## ファイル構成（このプランで作成/変更）

**新規**
- `vitest.config.ts` — Vitest 設定（node 環境・`@`エイリアス）
- `src/content/keywords.ts` — Keyword データ
- `src/content/press.ts` — PressItem データ＋セレクタ
- `src/components/bento/keywords-layout.ts` — 純関数：衝突回避レイアウト
- `src/components/bento/keywords-layout.test.ts` — レイアウトのプロパティテスト
- `src/components/bento/keywords-tile.tsx` — Keywords タイル（client）
- `src/components/bento/press-teaser-tile.tsx` — ホームの Press タイル
- `src/components/press/press-meta.tsx` — 種別ラベル＋日付整形（共有）
- `src/components/press/press-card.tsx` — 一覧ページのカード
- `src/components/projects/project-card.tsx` — Project カード
- `src/components/projects/projects-section.tsx` — Projects フルセクション
- `src/app/press/page.tsx` — `/press` 一覧ページ
- `src/lib/utils.test.ts` — `sortByDateDesc` テスト
- `src/content/works.test.ts` — `getProjects` テスト

**変更**
- `package.json`（deps / scripts）
- `src/lib/utils.ts`（`sortByDateDesc` 追加）
- `src/content/types.ts`（Keyword / PressType / PressItem / Profile 更新）
- `src/content/profile.ts`（role / affiliation / lab / motto）
- `src/content/works.ts`（`getProjects`）
- `src/components/bento/hero-tile.tsx`（全面改修）
- `src/app/page.tsx`（Bento 再構成）
- `src/lib/navigation.ts`（Blog 統一・Press 追加）
- `src/app/sitemap.ts`（/press 追加）
- `src/app/globals.css`（`kw-drift` keyframes）

**削除**
- `src/components/bento/about-tile.tsx`
- `src/components/bento/selected-works-tile.tsx`

---

## Task 1: 依存追加とテストツール設定

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [~] **Step 1: d3-force と Vitest を追加** <!-- 設計変更により不要 -->

Run:
```bash
pnpm add d3-force
pnpm add -D @types/d3-force vitest
```
Expected: `package.json` の dependencies に `d3-force`、devDependencies に `@types/d3-force` `vitest` が入る。

- [x] **Step 2: `package.json` に test スクリプトを追加**

`scripts` に1行追加（既存の lint/format はそのまま）:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "biome check",
  "format": "biome format --write",
  "test": "vitest run"
}
```

- [x] **Step 3: `vitest.config.ts` を作成**

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [x] **Step 4: コミット**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "chore: add d3-force と Vitest（純ロジック検証用）"
```

---

## Task 2: 共有ユーティリティ `sortByDateDesc`（TDD）

`getProjects` と Press セレクタで使う日付降順ソートを純関数化し、最初の Vitest 実行で配線確認する。

**Files:**
- Create: `src/lib/utils.test.ts`
- Modify: `src/lib/utils.ts`

- [~] **Step 1: 失敗するテストを書く** <!-- 設計変更により不要 -->

`src/lib/utils.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { sortByDateDesc } from "./utils";

describe("sortByDateDesc", () => {
  it("新しい日付が先頭・元配列を破壊しない", () => {
    const input = [
      { id: "a", date: "2024-01-01" },
      { id: "b", date: "2026-05-01" },
      { id: "c", date: "2025-03-15" },
    ];
    const out = sortByDateDesc(input);
    expect(out.map((x) => x.id)).toEqual(["b", "c", "a"]);
    // 非破壊
    expect(input.map((x) => x.id)).toEqual(["a", "b", "c"]);
  });

  it("YYYY-MM と YYYY-MM-DD が混在しても比較できる", () => {
    const out = sortByDateDesc([{ date: "2025-11" }, { date: "2025-11-20" }]);
    expect(out[0].date).toBe("2025-11-20");
  });
});
```

- [~] **Step 2: テストが失敗することを確認** <!-- 設計変更により不要 -->

Run: `pnpm test`
Expected: FAIL（`sortByDateDesc` is not exported / undefined）

- [~] **Step 3: 最小実装を追加** <!-- 設計変更により不要 -->

`src/lib/utils.ts` の末尾に追記（既存の `cn` 等はそのまま）:
```ts
/** date 文字列（YYYY-MM または YYYY-MM-DD）を降順にした新配列を返す（非破壊）。 */
export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
```

- [~] **Step 4: テストが通ることを確認** <!-- 設計変更により不要 -->

Run: `pnpm test`
Expected: PASS（2 tests）

- [~] **Step 5: コミット** <!-- 設計変更により不要 -->

```bash
git add src/lib/utils.ts src/lib/utils.test.ts
git commit -m "feat: sortByDateDesc を追加（日付降順の共有ソート）"
```

---

## Task 3: 型定義の更新（Keyword / PressType / PressItem / Profile）

**Files:**
- Modify: `src/content/types.ts`

- [x] **Step 1: 新しい型を追加し Profile を更新**

`src/content/types.ts` に以下を追記（既存の `Work` 系・`SocialLink`・`TimelineEntry`・`PhotoEntry` はそのまま）。`Profile` インターフェースは下記のとおり `lab` と `motto` を追加する。

ファイル末尾付近の `Profile` を次のように変更:
```ts
/** Keywords タイルに表示する人物像キーワード。 */
export interface Keyword {
  label: string;
  /** 重要度＝大きさ・中心への寄り。xl(主役) > lg > md > sm */
  size: "xl" | "lg" | "md" | "sm";
  /** true で accent（緑）バッジになる */
  accent?: boolean;
}

/** Press エントリの種別。バッジ表示に使う。 */
export type PressType = "interview" | "feature" | "award" | "event" | "media";

/** 自分が取り上げられた Web 記事（手動キュレーション）。 */
export interface PressItem {
  title: string;
  /** 媒体名（例: 長崎のWA!（長崎市）） */
  outlet: string;
  url: string;
  /** YYYY-MM または YYYY-MM-DD */
  date: string;
  type: PressType;
  thumbnail?: string;
  excerpt?: string;
}

export interface Profile {
  name: string;
  /** 肩書き（例: "学生エンジニア / フルスタック"） */
  role: string;
  /** 所属（例: "M1 Student · Nagasaki University"） */
  affiliation: string;
  /** 研究室。Hero でリンク表示する */
  lab: { name: string; url: string };
  /** Hero で語るモットー */
  motto: string;
  /** 旧 About 本文。ホームでは未使用（データは保持可） */
  bio?: string[];
  image?: string;
  social: SocialLink[];
  techStack: string[];
  timeline: TimelineEntry[];
  photos: PhotoEntry[];
}
```

> 注意：既存の `Profile` 定義（`bio: string[]` 必須など）を上記で置き換える。`bio` は任意（`?`）に変更。

- [x] **Step 2: 型チェック（この時点では profile.ts が未更新なのでエラーになる想定）**

Run: `pnpm build`
Expected: `src/content/profile.ts` で `lab`/`motto` 不足の型エラー（次タスクで解消）。エラー内容が `lab`・`motto` 起因であることだけ確認する。

- [x] **Step 3: コミット**

```bash
git add src/content/types.ts
git commit -m "feat: Keyword / PressItem 型と Profile(lab, motto) を追加"
```

---

## Task 4: profile.ts の更新（role / affiliation / lab / motto）

**Files:**
- Modify: `src/content/profile.ts`

- [x] **Step 1: フィールドを更新**

`src/content/profile.ts` の先頭オブジェクトを次のように変更（`bio`/`social`/`techStack`/`timeline`/`photos` はそのまま残す）:
```ts
export const profile: Profile = {
  name: "Takuya Uehara",
  role: "学生エンジニア / フルスタック",
  affiliation: "M1 Student · Nagasaki University",
  lab: { name: "Setozaki Lab.", url: "https://www.setozakilab.com" },
  motto: "デザインとテクノロジーで、最高のユーザ体験を。",
  bio: [
    // 既存の bio 段落はそのまま残す（ホームでは未使用）。
```
（`image:` 以降は既存のまま）

- [x] **Step 2: 型チェックが通ることを確認**

Run: `pnpm build`
Expected: profile 起因の型エラーが解消（about-tile はまだ存在するが `affiliation`/`bio` 参照は有効なのでビルド可）。ビルドが成功すること。

- [x] **Step 3: コミット**

```bash
git add src/content/profile.ts
git commit -m "feat: profile を新 Hero 用に更新（role/affiliation/lab/motto）"
```

---

## Task 5: works.ts に `getProjects()`（TDD）

**Files:**
- Create: `src/content/works.test.ts`
- Modify: `src/content/works.ts`

- [~] **Step 1: 失敗するテストを書く** <!-- 設計変更により不要 -->

`src/content/works.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { getProjects } from "./works";

describe("getProjects", () => {
  it("project/oss/research のみ返し experience を除外する", () => {
    const list = getProjects();
    expect(list.length).toBeGreaterThan(0);
    for (const w of list) {
      expect(["project", "oss", "research"]).toContain(w.category);
    }
    expect(list.some((w) => w.category === "experience")).toBe(false);
  });

  it("日付降順に並ぶ", () => {
    const dates = getProjects().map((w) => w.date);
    const sorted = [...dates].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    expect(dates).toEqual(sorted);
  });
});
```

- [~] **Step 2: テストが失敗することを確認** <!-- 設計変更により不要 -->

Run: `pnpm test`
Expected: FAIL（`getProjects` is not exported）

- [~] **Step 3: 実装を追加** <!-- 設計変更により不要 -->

`src/content/works.ts` の `import` に `sortByDateDesc` を追加し、末尾に `getProjects` を追記。`getFeaturedWorks` は Projects 全件表示で不要になるため削除する。

冒頭の import を:
```ts
import { sortByDateDesc } from "@/lib/utils";
import type { Work, WorkCategory } from "./types";
```
末尾の `getFeaturedWorks`（既存）を次に置き換え:
```ts
const PROJECT_CATEGORIES: WorkCategory[] = ["project", "oss", "research"];

/** Projects セクション用：作品（project/oss/research）を日付降順で全件返す。 */
export function getProjects(): Work[] {
  return sortByDateDesc(works.filter((w) => PROJECT_CATEGORIES.includes(w.category)));
}
```

- [~] **Step 4: テストが通ることを確認** <!-- 設計変更により不要 -->

Run: `pnpm test`
Expected: PASS（works 2 tests ＋ 既存 utils tests）

- [~] **Step 5: コミット** <!-- 設計変更により不要 -->

```bash
git add src/content/works.ts src/content/works.test.ts
git commit -m "feat: getProjects を追加し getFeaturedWorks を削除"
```

---

## Task 6: press.ts（データ＋セレクタ）

外部 API を使わない手動キュレーション。初期は空配列＋テンプレコメント（空状態は UI 側で対応）。

**Files:**
- Create: `src/content/press.ts`

- [~] **Step 1: ファイルを作成** <!-- 設計変更により不要 -->

`src/content/press.ts`:
```ts
import { sortByDateDesc } from "@/lib/utils";
import type { PressItem } from "./types";

/**
 * 自分が取り上げられた Web 記事（手動キュレーション）。
 * 新しい掲載が出たらここに追加する。例:
 *
 * {
 *   title: "長崎市シティプロモーションのインタビューに掲載",
 *   outlet: "長崎のWA!（長崎市）",
 *   url: "https://example.com/article",   // 実URLを設定
 *   date: "2025-11",
 *   type: "interview",
 *   excerpt: "学生エンジニアとしての活動を取材いただきました。",
 *   // thumbnail: "/press/nagasaki-wa.jpg",  // 任意（OG画像 or 媒体ロゴ）
 * },
 */
export const press: PressItem[] = [];

/** 日付降順で全件返す。 */
export function getAllPress(): PressItem[] {
  return sortByDateDesc(press);
}

/** 最新 n 件（ホームのタイル用）。 */
export function getLatestPress(n: number): PressItem[] {
  return getAllPress().slice(0, n);
}
```

> 設計書 未確定事項 #5：実エントリ（長崎のWA! 等）の URL を収集して `press` に追加する。空のままでも UI は破綻しない（空状態対応済み）。

- [~] **Step 2: 型チェック** <!-- 設計変更により不要 -->

Run: `pnpm build`
Expected: PASS（press.ts は未参照だが型エラーが無いこと）

- [~] **Step 3: コミット** <!-- 設計変更により不要 -->

```bash
git add src/content/press.ts
git commit -m "feat: press コンテンツ層（データ＋セレクタ）を追加"
```

---

## Task 7: keywords データ

**Files:**
- Create: `src/content/keywords.ts`

- [x] **Step 1: データを作成（README＋note 由来・persona 寄り）**

`src/content/keywords.ts`:
```ts
import type { Keyword } from "./types";

/**
 * Keywords タイルに表示する人物像キーワード。
 * size: xl(主役・中心) > lg > md > sm。accent で緑バッジ。
 * 設計書 未確定事項 #2：中心(xl)ワードは要確定（候補: Creative Engineer / ものづくり / Design & Dev）。
 */
export const keywords: Keyword[] = [
  { label: "Creative Engineer", size: "xl", accent: true },

  { label: "ものづくり", size: "lg", accent: true },
  { label: "Generative AI", size: "lg" },
  { label: "弓道", size: "lg", accent: true },
  { label: "3DCG", size: "lg" },
  { label: "Hackathons", size: "lg" },
  { label: "Curiosity", size: "lg" },
  { label: "Visual Thinker", size: "lg" },
  { label: "HCI", size: "lg" },

  { label: "Community", size: "md" },
  { label: "Metaverse", size: "md" },
  { label: "WebXR", size: "md" },
  { label: "Research", size: "md" },
  { label: "UI/UX", size: "md" },
  { label: "Spatial Computing", size: "md" },
  { label: "茶道", size: "md", accent: true },
  { label: "Photography", size: "md" },
  { label: "Full-stack", size: "md" },

  { label: "Motion Graphics", size: "sm" },
  { label: "映画・アニメ", size: "sm" },
  { label: "一人旅", size: "sm" },
  { label: "Sauna", size: "sm" },
  { label: "Mentor", size: "sm" },
  { label: "OSS", size: "sm" },
  { label: "Homelab", size: "sm" },
  { label: "Apple", size: "sm" },
  { label: "恩送り", size: "sm" },
  { label: "長崎 Nagasaki", size: "sm" },
];
```

- [x] **Step 2: 型チェック**

Run: `pnpm build`
Expected: PASS

- [x] **Step 3: コミット**

```bash
git add src/content/keywords.ts
git commit -m "feat: keywords データを追加（README/note 由来）"
```

---

## Task 8: Keywords レイアウト純関数（TDD・衝突回避）

**Files:**
- Create: `src/components/bento/keywords-layout.test.ts`
- Create: `src/components/bento/keywords-layout.ts`

- [x] **Step 1: 失敗するテストを書く**

`src/components/bento/keywords-layout.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import type { Keyword } from "@/content/types";

import { computeKeywordLayout } from "./keywords-layout";

const sample: Keyword[] = [
  { label: "Creative Engineer", size: "xl", accent: true },
  { label: "ものづくり", size: "lg" },
  { label: "Generative AI", size: "lg" },
  { label: "弓道", size: "lg" },
  { label: "3DCG", size: "md" },
  { label: "Community", size: "md" },
  { label: "WebXR", size: "sm" },
  { label: "Sauna", size: "sm" },
  { label: "OSS", size: "sm" },
  { label: "Homelab", size: "sm" },
];

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return !(
    a.x + a.w / 2 <= b.x - b.w / 2 ||
    b.x + b.w / 2 <= a.x - a.w / 2 ||
    a.y + a.h / 2 <= b.y - b.h / 2 ||
    b.y + b.h / 2 <= a.y - a.h / 2
  );
}

describe("computeKeywordLayout", () => {
  it("どのピル同士も重ならない", () => {
    const nodes = computeKeywordLayout(sample, { width: 640, height: 440 });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        expect(rectsOverlap(nodes[i], nodes[j])).toBe(false);
      }
    }
  });

  it("xl の主役ワードは中心に固定される", () => {
    const nodes = computeKeywordLayout(sample, { width: 640, height: 440 });
    const center = nodes.find((n) => n.size === "xl");
    expect(center).toBeDefined();
    expect(center?.x).toBe(320);
    expect(center?.y).toBe(220);
  });

  it("全ノードの座標が有限数", () => {
    const nodes = computeKeywordLayout(sample, { width: 500, height: 380 });
    for (const n of nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
    }
  });
});
```

- [x] **Step 2: テストが失敗することを確認**

Run: `pnpm test`
Expected: FAIL（`computeKeywordLayout` not found）

- [~] **Step 3: 純関数を実装** <!-- 設計変更により不要 -->

`src/components/bento/keywords-layout.ts`:
```ts
import {
  forceCollide,
  forceManyBody,
  forceRadial,
  forceSimulation,
  type SimulationNodeDatum,
} from "d3-force";

import type { Keyword } from "@/content/types";

export interface KeywordNode {
  label: string;
  accent: boolean;
  size: Keyword["size"];
  fontPx: number;
  /** ピルの推定幅・高さ（px） */
  w: number;
  h: number;
  x: number;
  y: number;
}

type SimNode = KeywordNode & SimulationNodeDatum;

/** size → フォント px */
const SIZE_FONT: Record<Keyword["size"], number> = { xl: 30, lg: 22, md: 16, sm: 13 };
/** size → 目標半径（コンテナ短辺の半分に対する比率）。xl は中心。 */
const SIZE_RADIUS_RATIO: Record<Keyword["size"], number> = { xl: 0, lg: 0.34, md: 0.6, sm: 0.85 };

const PAD_X = 14;
const PAD_Y = 7;
const GAP = 8;

/** ラテン文字は約0.58em、それ以外（CJK等）は約1emで概算。 */
function estimateWidth(label: string, fontPx: number): number {
  let units = 0;
  for (const ch of label) units += /[ -~]/.test(ch) ? 0.58 : 1;
  return units * fontPx + PAD_X * 2;
}

export function computeKeywordLayout(
  keywords: Keyword[],
  opts: { width: number; height: number; ticks?: number },
): KeywordNode[] {
  const { width, height, ticks = 400 } = opts;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) / 2;

  const nodes: SimNode[] = keywords.map((k) => {
    const fontPx = SIZE_FONT[k.size];
    return {
      label: k.label,
      accent: Boolean(k.accent),
      size: k.size,
      fontPx,
      w: estimateWidth(k.label, fontPx),
      h: fontPx + PAD_Y * 2,
      x: cx,
      y: cy,
    };
  });

  // 主役(xl)を中心にピン留め
  const center = nodes.find((n) => n.size === "xl");
  if (center) {
    center.fx = cx;
    center.fy = cy;
  }

  const sim = forceSimulation(nodes)
    // 外接円半径で衝突 → 矩形は確実に重ならない
    .force(
      "collide",
      forceCollide<SimNode>((d) => Math.hypot(d.w, d.h) / 2 + GAP).iterations(6),
    )
    .force(
      "radial",
      forceRadial<SimNode>((d) => SIZE_RADIUS_RATIO[d.size] * maxR, cx, cy).strength(0.85),
    )
    .force("charge", forceManyBody().strength(-6))
    .stop();

  for (let i = 0; i < ticks; i++) sim.tick();

  return nodes.map(({ label, accent, size, fontPx, w, h, x, y }) => ({
    label,
    accent,
    size,
    fontPx,
    w,
    h,
    x: x ?? cx,
    y: y ?? cy,
  }));
}
```

- [x] **Step 4: テストが通ることを確認**

Run: `pnpm test`
Expected: PASS（keywords-layout 3 tests ＋ 既存）

- [x] **Step 5: コミット**

```bash
git add src/components/bento/keywords-layout.ts src/components/bento/keywords-layout.test.ts
git commit -m "feat: Keywords の衝突回避レイアウト純関数を追加（d3-force）"
```

---

## Task 9: Keywords ドリフト用 CSS

**Files:**
- Modify: `src/app/globals.css`

- [~] **Step 1: keyframes を追加** <!-- 設計変更により不要 -->

`src/app/globals.css` の末尾に追記:
```css
/* Keywords タイルのバッジの微ドリフト（translate のみ・回転なし） */
@keyframes kw-drift {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.kw-drift {
  animation-name: kw-drift;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
@media (prefers-reduced-motion: reduce) {
  .kw-drift { animation: none !important; }
}
```

- [~] **Step 2: ビルド確認** <!-- 設計変更により不要 -->

Run: `pnpm build`
Expected: PASS

- [~] **Step 3: コミット** <!-- 設計変更により不要 -->

```bash
git add src/app/globals.css
git commit -m "style: Keywords バッジの微ドリフト keyframes を追加"
```

---

## Task 10: Keywords タイル（client コンポーネント）

**Files:**
- Create: `src/components/bento/keywords-tile.tsx`

- [x] **Step 1: コンポーネントを作成**

`src/components/bento/keywords-tile.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { keywords } from "@/content/keywords";
import { cn } from "@/lib/utils";

import { computeKeywordLayout, type KeywordNode } from "./keywords-layout";

const PAD = "7px 14px"; // keywords-layout の PAD_Y/PAD_X と一致させる

export function KeywordsTile({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // SSR / 初回描画用に既定サイズでレイアウトしておく（テキストがクロール可能）
  const [nodes, setNodes] = useState<KeywordNode[]>(() =>
    computeKeywordLayout(keywords, { width: 600, height: 380 }),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width < 10 || height < 10) return;
      setNodes(computeKeywordLayout(keywords, { width, height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-lg font-bold">Keywords</h2>
      <div ref={ref} className="relative min-h-[360px] flex-1">
        {nodes.map((n, i) => (
          <span
            key={n.label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: n.x, top: n.y }}
          >
            <span
              className="kw-drift inline-block"
              style={{
                animationDelay: `${(i % 7) * 0.4}s`,
                animationDuration: `${6 + (i % 5)}s`,
              }}
            >
              <span
                className={cn(
                  "inline-flex cursor-default whitespace-nowrap rounded-full border transition-transform duration-150",
                  "hover:scale-110 hover:border-accent hover:bg-accent hover:text-accent-foreground",
                  n.accent
                    ? "border-accent/40 bg-accent/10 text-foreground"
                    : "border-border bg-muted text-foreground",
                )}
                style={{
                  fontSize: n.fontPx,
                  padding: PAD,
                  fontWeight: n.size === "xl" || n.size === "lg" ? 700 : 500,
                }}
              >
                {n.label}
              </span>
            </span>
          </span>
        ))}
      </div>
    </Card>
  );
}
```

> 配色（accent ピルの色味）は実機で `--accent` トークンに合わせて微調整可。

- [x] **Step 2: lint / build 確認**

Run: `pnpm lint && pnpm build`
Expected: PASS（KeywordsTile は未配置でもビルド可。lint も通ること）

- [x] **Step 3: コミット**

```bash
git add src/components/bento/keywords-tile.tsx
git commit -m "feat: Keywords タイル（中心放射バッジ・client）を追加"
```

---

## Task 11: Hero タイルの全面改修

**Files:**
- Modify: `src/components/bento/hero-tile.tsx`

- [x] **Step 1: 実装を置き換える**

`src/components/bento/hero-tile.tsx` を全置換:
```tsx
import { Link as LinkIcon } from "lucide-react";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

interface HeroTileProps {
  className?: string;
}

export function HeroTile({ className }: HeroTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-6 rounded-3xl border-border bg-card p-8 md:flex-row md:items-center md:justify-between md:gap-12 md:p-12",
        className,
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          {profile.image ? (
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border md:size-20">
              <Image
                src={profile.image}
                alt={profile.name}
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Hello 👋</p>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              I&apos;m {profile.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
            {profile.role}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{profile.affiliation}</p>
            <a
              href={profile.lab.url}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
            >
              @ {profile.lab.name}
              <LinkIcon className="size-3" />
            </a>
          </div>
        </div>
      </div>

      <p className="border-l-2 border-accent pl-4 text-base font-semibold leading-relaxed text-foreground md:max-w-xs md:text-lg">
        {profile.motto}
      </p>
    </Card>
  );
}
```

- [x] **Step 2: lint / build 確認**

Run: `pnpm lint && pnpm build`
Expected: PASS

- [x] **Step 3: コミット**

```bash
git add src/components/bento/hero-tile.tsx
git commit -m "feat: Hero を会話調プロフィールに刷新（モバイル自然化）"
```

---

## Task 12: Projects カードとセクション

**Files:**
- Create: `src/components/projects/project-card.tsx`
- Create: `src/components/projects/projects-section.tsx`

- [x] **Step 1: ProjectCard を作成**

`src/components/projects/project-card.tsx`:
```tsx
import { SiGithub } from "@icons-pack/react-simple-icons";
import { FlaskConical, Link as LinkIcon, Package, Rocket } from "lucide-react";
import Image from "next/image";
import type { ComponentType } from "react";

import type { Work, WorkCategory } from "@/content/types";

const categoryIcon: Partial<Record<WorkCategory, ComponentType<{ className?: string }>>> = {
  project: Rocket,
  oss: Package,
  research: FlaskConical,
};

export function ProjectCard({ work }: { work: Work }) {
  const github = work.links.find((l) => l.kind === "github")?.href;
  const demo = work.links.find((l) => l.kind === "demo")?.href;
  const Icon = categoryIcon[work.category] ?? Rocket;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {work.thumbnail ? (
          <Image
            src={work.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent/10 via-muted to-secondary">
            <Icon className="size-9 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute right-2 top-2 flex gap-2">
          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              aria-label={`${work.title} の GitHub リポジトリ`}
              className="inline-flex size-8 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <SiGithub className="size-4" />
            </a>
          ) : null}
          {demo ? (
            <a
              href={demo}
              target="_blank"
              rel="noreferrer"
              aria-label={`${work.title} のデプロイ先`}
              className="inline-flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground backdrop-blur transition-opacity hover:opacity-90"
            >
              <LinkIcon className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-bold leading-snug">{work.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{work.summary}</p>
      </div>
    </div>
  );
}
```

- [x] **Step 2: ProjectsSection を作成**

`src/components/projects/projects-section.tsx`:
```tsx
import { Card } from "@/components/ui/card";
import { getProjects } from "@/content/works";
import { cn } from "@/lib/utils";

import { ProjectCard } from "./project-card";

export function ProjectsSection({ className }: { className?: string }) {
  const projects = getProjects();

  return (
    <Card
      className={cn(
        "flex flex-col gap-6 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-2xl font-extrabold tracking-tight">Projects</h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((work) => (
          <li key={work.slug}>
            <ProjectCard work={work} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
```

- [x] **Step 3: lint / build 確認**

Run: `pnpm lint && pnpm build`
Expected: PASS

- [x] **Step 4: コミット**

```bash
git add src/components/projects/project-card.tsx src/components/projects/projects-section.tsx
git commit -m "feat: Projects 全件フルセクション（GitHub/デプロイ アイコン）を追加"
```

---

## Task 13: Press 共有メタ・カード・ホームタイル

**Files:**
- Create: `src/components/press/press-meta.tsx`
- Create: `src/components/press/press-card.tsx`
- Create: `src/components/bento/press-teaser-tile.tsx`

- [x] **Step 1: 共有メタを作成**

`src/components/press/press-meta.tsx`:
```tsx
import type { PressType } from "@/content/types";

export const pressTypeLabel: Record<PressType, string> = {
  interview: "Interview",
  feature: "Feature",
  award: "Award",
  event: "Event",
  media: "Media",
};

/** "2025-11-20" / "2025-11" → "2025.11" */
export function formatPressDate(date: string): string {
  const [y, m] = date.split("-");
  return m ? `${y}.${m}` : y;
}
```

- [x] **Step 2: PressCard を作成（一覧ページ用・サムネ画像つき）**

`src/components/press/press-card.tsx`:
```tsx
import { Newspaper } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { PressItem } from "@/content/types";

import { formatPressDate, pressTypeLabel } from "./press-meta";

export function PressCard({ item }: { item: PressItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card transition-colors group-hover:border-accent">
        <div className="relative aspect-[1.91/1] w-full overflow-hidden bg-muted">
          {item.thumbnail ? (
            // biome-ignore lint/performance/noImgElement: 外部媒体の可変ホストのため next/image を使わない
            <img
              src={item.thumbnail}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/10 via-muted to-secondary text-muted-foreground">
              <Newspaper className="size-8 opacity-50" />
              <span className="px-3 text-center text-xs font-semibold">{item.outlet}</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <span className="inline-flex w-fit items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
            {pressTypeLabel[item.type]}
          </span>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {item.outlet} ・ <time dateTime={item.date}>{formatPressDate(item.date)}</time>
          </p>
          {item.excerpt ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">{item.excerpt}</p>
          ) : null}
        </div>
      </Card>
    </a>
  );
}
```

- [x] **Step 3: ホームの PressTeaserTile を作成**

`src/components/bento/press-teaser-tile.tsx`:
```tsx
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { formatPressDate, pressTypeLabel } from "@/components/press/press-meta";
import { Card } from "@/components/ui/card";
import type { PressItem } from "@/content/types";
import { cn } from "@/lib/utils";

interface PressTeaserTileProps {
  items: PressItem[];
  className?: string;
}

export function PressTeaserTile({ items, className }: PressTeaserTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Press</h2>
        <Link
          href="/press"
          className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View all
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">掲載情報は準備中です。</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.url || item.title}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col gap-1 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-accent">
                  {item.outlet}
                </span>
                <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                  {item.title}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatPressDate(item.date)} ・ {pressTypeLabel[item.type]}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
```

- [x] **Step 4: lint / build 確認**

Run: `pnpm lint && pnpm build`
Expected: PASS

- [x] **Step 5: コミット**

```bash
git add src/components/press/press-meta.tsx src/components/press/press-card.tsx src/components/bento/press-teaser-tile.tsx
git commit -m "feat: Press カード・ホームタイル・共有メタを追加"
```

---

## Task 14: `/press` 一覧ページ

**Files:**
- Create: `src/app/press/page.tsx`

- [x] **Step 1: ページを作成（/blogs に倣う）**

`src/app/press/page.tsx`:
```tsx
import type { Metadata } from "next";

import { FadeIn } from "@/components/motion/fade-in";
import { PressCard } from "@/components/press/press-card";
import { getAllPress } from "@/content/press";

export const metadata: Metadata = {
  title: "Press",
  description:
    "メディアで取り上げていただいた記事をまとめています。インタビュー・受賞・イベントの掲載記録。",
  alternates: { canonical: "/press" },
};

export default function PressPage() {
  const items = getAllPress();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <FadeIn>
        <header className="mb-10 flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Press
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">掲載一覧</h1>
          <p className="text-sm text-muted-foreground">
            メディアで取り上げていただいた記事をまとめています。
          </p>
        </header>
      </FadeIn>

      <FadeIn delay={0.05}>
        {items.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            記事はまだありません。
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.url || item.title}>
                <PressCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </FadeIn>
    </section>
  );
}
```

- [x] **Step 2: lint / build 確認**

Run: `pnpm lint && pnpm build`
Expected: PASS（`/press` ルートが生成される）

- [x] **Step 3: コミット**

```bash
git add src/app/press/page.tsx
git commit -m "feat: /press 一覧ページを追加"
```

---

## Task 15: ナビゲーションと sitemap

**Files:**
- Modify: `src/lib/navigation.ts`
- Modify: `src/app/sitemap.ts`

- [x] **Step 1: navigation を更新（Blog 統一・Press 追加）**

`src/lib/navigation.ts` を全置換:
```ts
export const navItems = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blog" },
  { href: "/press", label: "Press" },
] as const;
```

- [x] **Step 2: sitemap に /press を追加**

`src/app/sitemap.ts` の `return [...]` に Press エントリを追加（`/` と `/blogs` の後ろ）:
```ts
    {
      url: `${site.url}/press`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
```

- [x] **Step 3: lint / build 確認**

Run: `pnpm lint && pnpm build`
Expected: PASS

- [x] **Step 4: コミット**

```bash
git add src/lib/navigation.ts src/app/sitemap.ts
git commit -m "feat: ナビを Blog/Press に統一し sitemap に /press を追加"
```

---

## Task 16: ホーム `page.tsx` の再構成

About→Keywords、Selected Works→Press タイル、Projects フルセクションを Timeline 直上に。

**Files:**
- Modify: `src/app/page.tsx`

- [x] **Step 1: import を差し替える**

`src/app/page.tsx` の import を更新：`AboutTile`・`SelectedWorksTile` を削除し、`KeywordsTile`・`PressTeaserTile`・`ProjectsSection`・`getLatestPress` を追加。
```tsx
import { BlogTeaserTile } from "@/components/bento/blog-teaser-tile";
import { ContactTile } from "@/components/bento/contact-tile";
import { HeroTile } from "@/components/bento/hero-tile";
import { KeywordsTile } from "@/components/bento/keywords-tile";
import { PhotoTile } from "@/components/bento/photo-tile";
import { PressTeaserTile } from "@/components/bento/press-teaser-tile";
import { TechStackTile } from "@/components/bento/tech-stack-tile";
import {
  BentoMotionContainer,
  BentoTileMotion,
} from "@/components/motion/bento-tile-motion";
import { Timeline } from "@/components/home/timeline";
import { ProjectsSection } from "@/components/projects/projects-section";
import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { getLatestPress } from "@/content/press";
import { getLatestBlogPosts } from "@/lib/blog";
```

- [x] **Step 2: データ取得とメタデータを更新**

`metadata.description` を Keywords/Projects/Press を反映した文言に変更し、本文先頭で press を取得：
```tsx
export const metadata: Metadata = {
  description:
    "Takuya Uehara（上原拓也）の自己紹介。学生エンジニア / フルスタックとして、デザインとテクノロジーで最高のユーザ体験を届けることをモットーに、生成AI・空間コンピューティングの研究やプロダクト開発に取り組んでいます。キーワード・代表作・掲載記事・経歴をまとめています。",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const latestPosts = await getLatestBlogPosts(3);
  const latestPress = getLatestPress(3);

  // photos: [0]=タージ・マハル, [1]=長崎ハッカソン, [2]=アユタヤ
  const hackathon = profile.photos.at(1);
  const taj = profile.photos.at(0);
  const ayutthaya = profile.photos.at(2);
```

- [x] **Step 3: About タイルを Keywords タイルに差し替える**

`<AboutTile>` を含む `BentoTileMotion` を次に置換（span は据え置き）:
```tsx
        <BentoTileMotion className="col-span-2 md:col-span-4 md:row-span-2">
          <KeywordsTile className="h-full" />
        </BentoTileMotion>
```

- [x] **Step 4: Selected Works を Press タイルに差し替える**

`<SelectedWorksTile>` を含む `BentoTileMotion`（`md:col-span-4`）を次に置換:
```tsx
        <BentoTileMotion className="col-span-2 md:col-span-4">
          <PressTeaserTile items={latestPress} className="h-full" />
        </BentoTileMotion>
```
（隣の `BlogTeaserTile`（`md:col-span-2`）はそのまま。）

- [x] **Step 5: Timeline の直前に Projects フルセクションを挿入**

Timeline の `BentoTileMotion`（`md:col-span-6`）の**直前**に追加:
```tsx
        <BentoTileMotion className="col-span-2 md:col-span-6">
          <ProjectsSection className="h-full" />
        </BentoTileMotion>
```

- [x] **Step 6: lint / build 確認**

Run: `pnpm lint && pnpm build`
Expected: PASS（`AboutTile`/`SelectedWorksTile` への参照が残っていないこと）

- [x] **Step 7: コミット**

```bash
git add src/app/page.tsx
git commit -m "feat: ホームを再構成（Keywords/Press タイル・Projects セクション）"
```

---

## Task 17: 旧コンポーネント削除とクリーンアップ

**Files:**
- Delete: `src/components/bento/about-tile.tsx`
- Delete: `src/components/bento/selected-works-tile.tsx`

- [x] **Step 1: 参照が無いことを確認**

Run:
```bash
grep -rn "about-tile\|AboutTile\|selected-works-tile\|SelectedWorksTile" src/
```
Expected: 出力なし（参照ゼロ）。もし残っていれば該当箇所を修正してから次へ。

- [x] **Step 2: 削除**

Run:
```bash
git rm src/components/bento/about-tile.tsx src/components/bento/selected-works-tile.tsx
```

- [x] **Step 3: lint / build / test 確認**

Run: `pnpm lint && pnpm build && pnpm test`
Expected: すべて PASS

- [x] **Step 4: コミット**

```bash
git commit -m "chore: 旧 About/SelectedWorks タイルを削除"
```

---

## Task 18: 最終検証（ブラウザ通し確認）

**Files:** なし（手動確認）

- [x] **Step 1: 開発サーバ起動**

Run: `pnpm dev`
（別ターミナルで http://localhost:3000 を開く）

- [x] **Step 2: ホーム（デスクトップ）確認**

- Hero：Hello / I'm Takuya Uehara・「学生エンジニア / フルスタック」・M1 Student · Nagasaki University・@ Setozaki Lab（クリックで setozakilab.com が新規タブ）・モットー表示。
- Keywords：白カードにバッジが**重ならず**中心放射で配置、上下に微ドリフト、ホバーで緑反転。
- Tech Stack の真下に Contact、写真3枚が1行。
- Press タイル（Blog の隣）に View all → `/press`。
- Projects が Timeline 直上にフル幅・全件、サムネ右上に GitHub/チェーンアイコン（リンク先が新規タブ）。

- [x] **Step 3: モバイル幅で確認**

DevTools で 375px 前後にして、Hero が自然な縦プロフィール、Keywords が重ならない、Projects が縦並びで崩れないことを確認。

- [~] **Step 4: `/press` と `prefers-reduced-motion` 確認** <!-- 設計変更により不要 -->

- `/press`：空状態（「記事はまだありません。」）が表示されること。ナビが Home / Blog / Press になっていること。
- DevTools の Rendering で「prefers-reduced-motion: reduce」を有効化 → Keywords のドリフトが停止すること。

- [x] **Step 5: 仕上げ**

Run: `pnpm lint && pnpm build && pnpm test`
Expected: すべて PASS。問題があれば該当タスクに戻って修正・コミット。

---

## 完了の定義（Definition of Done）

- `pnpm lint` / `pnpm build` / `pnpm test` がすべて成功。
- ホームの4変更（Hero / Keywords / Projects / Press）と配置（Press＝Blog 隣、Projects＝Timeline 直上）が設計書どおり。
- ナビ＝Home / Blog / Press、sitemap に `/press`。
- Keywords が**重ならず**レスポンシブ、`prefers-reduced-motion` で停止。

## 残作業（実装後にユーザーと確定：設計書 未確定事項）

1. **Keywords 中心(xl)ワードの確定**（候補: Creative Engineer / ものづくり / Design & Dev）と語リストの最終調整。
2. **Projects のサムネ画像**を各作品に用意（`work.thumbnail`）。tecnova-platform 等の作品追加の要否。
3. **Press 実エントリ**（長崎のWA! 等）の URL 収集と追加。
4. `profile.bio` データを将来的に削除するか保持するか。
