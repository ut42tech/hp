# サムネイルフルブリード化 + Press 種別削除 + projects API 統一 + 新 Works セクション 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** カードサムネイルをフルブリード + ホバーズーム化し、Press から種別を削除、works API を projects API に統一し、ホームに新 Works セクション（開発以外の取り組み）を追加する。

**Architecture:** UI は既存の shadcn Card + Tailwind パターンを踏襲（余白の原因は Card 基底の `py-4`/`gap-4`）。データ層は `src/lib/microcms/`（raw 型 → mapper → 公開 API）の既存 3 層構成を維持する。microCMS 側の移行は完了済み（旧 works を `projects` にリネーム・その際 category / body フィールドは削除・新 `works` API 作成済み・press の type 削除済み）で、コードがこれに追随する。残データ整理は一発スクリプト 2 本（クリーンアップ + シード）で行う。

**Tech Stack:** Next.js (App Router) / TypeScript / Tailwind / shadcn/ui / lucide-react / vitest / biome / pnpm / microCMS REST API

**Spec:** `docs/superpowers/specs/2026-07-07-thumbnail-fullbleed-press-type-projects-api-design.md`

## Global Constraints

- パッケージマネージャは pnpm。テストは `pnpm test`（vitest run）、lint は `pnpm lint`（biome check）、整形は `pnpm format`。
- 型検査スクリプトがないため、型を触るタスクは `pnpm exec tsc --noEmit` で検証する。
- この repo の Next.js は breaking changes 前提（AGENTS.md）。既存コードにあるパターン（`next/image` の `fill` + `sizes` 等）のみ踏襲し、新しい Next.js API を使う場合は `node_modules/next/dist/docs/` の該当ガイドを先に読む。
- ホバーズームは CSS のみ（motion ライブラリ禁止）。`motion-safe:` プレフィックスで reduced-motion に配慮。
- コミットメッセージは日本語（既存ログの流儀: `feat: ...` / `refactor: ...`）。末尾に `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`。
- microCMS 側の変更は**完了済み**: 旧 works は `projects` にリネーム済み（category / body フィールドは削除）、press の type フィールドは削除済み、新 `works` API（title / summary / date / url / thumbnail）は作成済み。projects に残る旧 experience 8 件と works のテストアイテムはクリーンアップスクリプト（Task 4）で削除する。
- microCMS のキーは `.env` にある（`MICROCMS_SERVICE_DOMAIN` / `MICROCMS_API_KEY` / `MICROCMS_WRITE_API_KEY`）。値をログ・出力に表示しない。

---

### Task 1: サムネイルのフルブリード化 + ホバーズーム

**Files:**
- Modify: `src/components/press/press-card.tsx`
- Modify: `src/components/blog/blog-card.tsx`
- Modify: `src/components/projects/project-card.tsx`

**Interfaces:**
- Consumes: shadcn `Card`（`src/components/ui/card.tsx`、基底はデフォルト `py-4 gap-4` を持つ — 基底は変更しない）
- Produces: ズーム用クラス列 `motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105`（Task 6 の WorkCard も同じ列を使う）

視覚変更のみでユニットテスト対象外。lint + 型検査で機械検証し、目視確認は最終セクションでまとめて行う。

- [ ] **Step 1: PressCard — Card の余白除去とズーム**

`src/components/press/press-card.tsx` の `Card` 開始タグと `Image` を以下に変更（ルート `<a>` に `group` は既にある）:

```tsx
      <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-border bg-card py-0 transition-colors group-hover:border-accent">
        <div className="relative aspect-[1.91/1] w-full overflow-hidden bg-muted">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt=""
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
              className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
            />
```

- [ ] **Step 2: BlogCard — Card の余白除去とズーム**

`src/components/blog/blog-card.tsx` の `Card` 開始タグと `<img>` を以下に変更（ルート `<a>` に `group` は既にある）:

```tsx
      <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-border bg-card py-0 transition-colors group-hover:border-accent">
        <div className="relative aspect-[1.91/1] w-full overflow-hidden">
          {post.thumbnail ? (
            // biome-ignore lint/performance/noImgElement: 外部の可変ホスト（Zenn Cloudinary / note）のため next/image を使わない
            <img
              src={post.thumbnail}
              alt=""
              loading="lazy"
              className="size-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
            />
```

- [ ] **Step 3: ProjectCard — group 付与とズーム**

`src/components/projects/project-card.tsx`（素の div 構成で余白はなし）。ルート div に `group` を追加し、`Image` にズームを付与:

```tsx
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {work.thumbnail ? (
          <Image
            src={work.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
          />
```

- [ ] **Step 4: 検証**

Run: `pnpm lint && pnpm exec tsc --noEmit`
Expected: どちらもエラーなし

- [ ] **Step 5: Commit**

```bash
git add src/components/press/press-card.tsx src/components/blog/blog-card.tsx src/components/projects/project-card.tsx
git commit -m "feat: カードサムネイルをフルブリード化しホバーズームを追加"
```

---

### Task 2: Press から種別（type）を削除

**Files:**
- Modify: `src/lib/microcms/mappers.test.ts`
- Modify: `src/content/types.ts`
- Modify: `src/lib/microcms/types.ts`
- Modify: `src/lib/microcms/mappers.ts`
- Modify: `src/components/press/press-meta.tsx`
- Modify: `src/components/press/press-card.tsx`
- Modify: `src/components/bento/press-teaser-tile.tsx`

**Interfaces:**
- Consumes: `PressItem` / `RawPress` / `mapPress`（既存）
- Produces: `PressItem` から `type` が消える。`press-meta.tsx` は `formatPressDate` のみ export（`pressTypeLabel` 削除）。

- [ ] **Step 1: テストを先に更新（type なしを期待）**

`src/lib/microcms/mappers.test.ts` — `rawPress` フィクスチャから `type: ["interview"],` を削除し、`mapPress` の describe を以下に置き換え（フォールバックのテストを削除）:

```ts
const rawPress: RawPress = {
  id: "abc",
  title: "掲載記事",
  outlet: "長崎のWA!",
  url: "https://example.com/article",
  date: "2025-10-31T15:00:00.000Z",
  thumbnail: { url: "https://images.microcms-assets.io/x/press.jpg" },
  excerpt: "取材いただきました。",
};

describe("mapPress", () => {
  it("PressItem に変換する", () => {
    expect(mapPress(rawPress)).toEqual({
      title: "掲載記事",
      outlet: "長崎のWA!",
      url: "https://example.com/article",
      date: "2025-11-01",
      thumbnail: "https://images.microcms-assets.io/x/press.jpg",
      excerpt: "取材いただきました。",
    });
  });

  it("空文字 excerpt は undefined になる", () => {
    expect(mapPress({ ...rawPress, excerpt: "" }).excerpt).toBeUndefined();
  });
});
```

- [ ] **Step 2: テストが落ちることを確認**

Run: `pnpm test`
Expected: FAIL — `mapPress` の戻り値に `type: "media"` が含まれ toEqual が不一致

- [ ] **Step 3: 型と実装から type を削除**

`src/content/types.ts` — `PressType` の型定義とコメント行（`/** Press エントリの種別。バッジ表示に使う。 */` と `export type PressType = ...`）を削除し、`PressItem` から `type: PressType;` を削除。

`src/lib/microcms/types.ts` — `RawPress` から `type: string[];` を削除。

`src/lib/microcms/mappers.ts` —
- import から `PressType` を削除
- `const PRESS_TYPES: PressType[] = [...]` を削除
- `mapPress` から `type: pickSelect(raw.type, PRESS_TYPES, "media"),` を削除

- [ ] **Step 4: テストが通ることを確認**

Run: `pnpm test`
Expected: PASS（全テスト）

- [ ] **Step 5: UI から種別表示を削除**

`src/components/press/press-meta.tsx` — 全体を以下に置き換え:

```tsx
/** "2025-11-20" / "2025-11" → "2025.11" */
export function formatPressDate(date: string): string {
  const [y, m] = date.split("-");
  return m ? `${y}.${m}` : y;
}
```

`src/components/press/press-card.tsx` —
- import を `import { formatPressDate } from "./press-meta";` に変更
- バッジの `<span className="inline-flex w-fit items-center rounded-full bg-accent/10 ...">{pressTypeLabel[item.type]}</span>` を丸ごと削除

`src/components/bento/press-teaser-tile.tsx` —
- import を `import { formatPressDate } from "@/components/press/press-meta";` に変更
- `{formatPressDate(item.date)} ・ {pressTypeLabel[item.type]}` → `{formatPressDate(item.date)}`

- [ ] **Step 6: 検証**

Run: `pnpm test && pnpm lint && pnpm exec tsc --noEmit`
Expected: 全て成功（`PressType` / `pressTypeLabel` への参照が残っていれば tsc が落ちる）

- [ ] **Step 7: Commit**

```bash
git add -A src
git commit -m "feat: Press から種別（type）を削除"
```

---

### Task 3: works → projects API 統一（型リネーム + category / body 削除）

microCMS 側は旧 works が `projects` にリネーム済み（contentId 維持・category / body フィールドは削除済み）。コードをこれに追随させる。

**Files:**
- Modify: `src/lib/microcms/mappers.test.ts`
- Modify: `src/content/types.ts`
- Modify: `src/lib/microcms/types.ts`
- Modify: `src/lib/microcms/mappers.ts`
- Modify: `src/lib/microcms/index.ts`
- Modify: `src/lib/utils.ts`
- Delete: `src/lib/utils.test.ts`
- Modify: `src/components/projects/project-card.tsx`
- Modify: `src/components/projects/projects-section.tsx`

**Interfaces:**
- Consumes: `fetchList<T>(endpoint)`（`src/lib/microcms/client.ts`、変更なし。`orders=-date` で日付降順が保証される）
- Produces:
  - `Project`（category / body なし: `slug / title / summary / date / tags / thumbnail? / links`）/ `ContentLink`（`{ label: string; href: string; kind: LinkKind }`）
  - `RawProject` / `RawLink`（microCMS raw 型）
  - `mapProject(raw: RawProject): Project` / `mapLink(raw: RawLink): ContentLink`（mappers 内部）
  - `getProjects(): Promise<Project[]>`（`projects` エンドポイントを直取得）
  - 削除: `WorkCategory` / `WorkLink` / 旧 `Work` / `filterProjects` / `parseBody` / `sortByDateDesc`（+ `src/lib/utils.test.ts`）

- [ ] **Step 1: テストを先にリネーム（Project 前提に）**

`src/lib/microcms/mappers.test.ts` —
- import を `filterProjects, mapWork, parseBody` → `mapProject` に、型 import を `RawWork` → `RawProject` に変更
- `describe("parseBody", ...)` ブロックを丸ごと削除（`parseBody` 自体を削除するため）
- `rawWork` フィクスチャと `mapWork` describe を以下に置き換え（category / body なし）
- `describe("filterProjects", ...)` ブロックを丸ごと削除

```ts
const rawProject: RawProject = {
  id: "coto2-ba",
  title: "コトコトバ",
  summary: "受賞作品。",
  date: "2026-03-14T15:00:00.000Z",
  tags: "Award, Hackathon",
  links: [
    {
      fieldId: "link",
      label: "GitHub",
      href: "https://github.com/nu-chotech/coto2-ba",
      kind: ["github"],
    },
  ],
};

describe("mapProject", () => {
  it("contentId を slug として Project に変換する", () => {
    expect(mapProject(rawProject)).toEqual({
      slug: "coto2-ba",
      title: "コトコトバ",
      summary: "受賞作品。",
      date: "2026-03-15",
      tags: ["Award", "Hackathon"],
      thumbnail: undefined,
      links: [
        {
          label: "GitHub",
          href: "https://github.com/nu-chotech/coto2-ba",
          kind: "github",
        },
      ],
    });
  });

  it("未知の link kind は other にフォールバックする", () => {
    const mapped = mapProject({
      ...rawProject,
      links: [{ fieldId: "link", label: "L", href: "https://a", kind: ["x"] }],
    });
    expect(mapped.links[0]?.kind).toBe("other");
  });
});
```

- [ ] **Step 2: テストが落ちることを確認**

Run: `pnpm test`
Expected: FAIL — `mapProject` / `RawProject` が存在しない

- [ ] **Step 3: 型のリネーム**

`src/content/types.ts` — `WorkCategory` / `WorkLink` / `Work` を以下に置き換え（`LinkKind` は変更なし）:

```ts
/** Projects / Works 共通の外部リンク。 */
export interface ContentLink {
  label: string;
  href: string;
  kind: LinkKind;
}

/** 開発プロジェクト（microCMS の projects API で管理）。 */
export interface Project {
  /** URL に使う識別子。microCMS の contentId */
  slug: string;
  title: string;
  summary: string;
  /** YYYY-MM-DD 形式 */
  date: string;
  tags: string[];
  thumbnail?: string;
  links: ContentLink[];
}
```

`src/lib/microcms/types.ts` — `RawWorkLink` / `RawWork` を以下に置き換え:

```ts
export interface RawLink {
  fieldId: string;
  label: string;
  href: string;
  kind: string[];
}

export interface RawProject {
  id: string;
  title: string;
  summary: string;
  date: string;
  tags?: string;
  thumbnail?: MicroCMSImage;
  links?: RawLink[];
}
```

- [ ] **Step 4: mapper と公開 API のリネーム**

`src/lib/microcms/mappers.ts` —
- import を更新: `ContentLink, LinkKind, PressItem, Project, TimelineCategory, TimelineEntry` を `@/content/types` から、`RawLink, RawPress, RawProject, RawTimelineEntry` を `./types` から。`import { sortByDateDesc } from "@/lib/utils";` の行を削除
- `WORK_CATEGORIES` 定数を削除
- `parseBody` 関数（コメント含む）を削除
- `mapWorkLink` / `mapWork` を以下に置き換え:

```ts
function mapLink(raw: RawLink): ContentLink {
  return {
    label: raw.label,
    href: raw.href,
    kind: pickSelect(raw.kind, LINK_KINDS, "other"),
  };
}

export function mapProject(raw: RawProject): Project {
  return {
    slug: raw.id,
    title: raw.title,
    summary: raw.summary,
    date: toJstDateString(raw.date),
    tags: parseTags(raw.tags),
    thumbnail: raw.thumbnail?.url,
    links: (raw.links ?? []).map(mapLink),
  };
}
```

- ファイル末尾の `const PROJECT_CATEGORIES` と `filterProjects`（コメント含む）を削除

`src/lib/microcms/index.ts` — works 取得を projects 直取得に変更:

```ts
import type { PressItem, Project, TimelineEntry } from "@/content/types";

import { fetchList } from "./client";
import { mapPress, mapProject, mapTimelineEntry } from "./mappers";
import type { RawPress, RawProject, RawTimelineEntry } from "./types";
```

```ts
/** Projects セクション用：開発プロジェクトを日付降順で全件返す。 */
export async function getProjects(): Promise<Project[]> {
  const contents = await fetchList<RawProject>("projects");
  return contents.map(mapProject);
}
```

`src/lib/utils.ts` — `sortByDateDesc`（コメント含む）を削除し `cn` のみ残す。
`src/lib/utils.test.ts` — ファイルごと削除（`sortByDateDesc` 専用のため）: `git rm src/lib/utils.test.ts`

- [ ] **Step 5: UI コンポーネントの追随**

`src/components/projects/project-card.tsx` — 全体を以下に置き換え（prop 名も `project` に統一。category 廃止のためフォールバックアイコンは全件 Rocket。Task 1 で入れた `group` + ズームは維持）:

```tsx
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Link as LinkIcon, Rocket } from "lucide-react";
import Image from "next/image";

import type { Project } from "@/content/types";

export function ProjectCard({ project }: { project: Project }) {
  const github = project.links.find((l) => l.kind === "github")?.href;
  const demo = project.links.find((l) => l.kind === "demo")?.href;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent/10 via-muted to-secondary">
            <Rocket className="size-9 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute right-2 top-2 flex gap-2">
          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.title} の GitHub リポジトリ`}
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
              aria-label={`${project.title} のデプロイ先`}
              className="inline-flex size-8 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LinkIcon className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-bold leading-snug">{project.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.summary}
        </p>
      </div>
    </div>
  );
}
```

`src/components/projects/projects-section.tsx` — map 部分を以下に変更:

```tsx
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
```

- [ ] **Step 6: 検証**

Run: `pnpm test && pnpm lint && pnpm exec tsc --noEmit`
Expected: 全て成功（旧 `Work` / `mapWork` / `filterProjects` / `sortByDateDesc` / `parseBody` への参照が残っていれば tsc が落ちる）

注: microCMS の `projects` API は移行済みのため、ホームの描画はこの時点で動く（クリーンアップ実行までは旧 experience 込みの 18 件が表示される。設計どおり）。

- [ ] **Step 7: Commit**

```bash
git add -A src
git commit -m "refactor: works API を projects に統一し Work 型を Project にリネーム"
```

---

### Task 4: クリーンアップスクリプト作成 + 旧シードスクリプト削除

**Files:**
- Create: `scripts/cleanup-microcms.mjs`
- Delete: `scripts/seed-microcms.mjs`

**Interfaces:**
- Consumes: microCMS REST API（DELETE `projects/{id}` / `works/{id}`、書き込みキー）
- Produces: 手動実行する一発スクリプト（コードからの import はなし）

- [ ] **Step 1: クリーンアップスクリプトを作成**

`scripts/cleanup-microcms.mjs`:

```js
/**
 * microCMS のリネーム移行で残った不要コンテンツを削除するワンショットスクリプト。
 * - projects: 旧 works の experience 8 件（同等の内容が timeline に既存。
 *   うち 5 件相当は新 works に seed-works.mjs でシードする）
 * - works: スキーマ確認用のテストアイテム
 *
 * 使い方:
 *   MICROCMS_SERVICE_DOMAIN=xxxx MICROCMS_WRITE_API_KEY=yyyy \
 *     node scripts/cleanup-microcms.mjs
 */

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_WRITE_API_KEY;
if (!serviceDomain || !apiKey) {
  console.error(
    "MICROCMS_SERVICE_DOMAIN / MICROCMS_WRITE_API_KEY を設定してください。",
  );
  process.exit(1);
}

const TARGETS = [
  ["projects", "chotech"],
  ["projects", "n-code-labo"],
  ["projects", "zenrin-internship"],
  ["projects", "brightj-internship"],
  ["projects", "iiit-delhi-exchange"],
  ["projects", "tni-summer-school"],
  ["projects", "jset-2024"],
  ["projects", "nagasaki-univ-award"],
  ["works", "o9e0-5d2v"], // スキーマ確認用テストアイテム「tesuto」
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (const [endpoint, id] of TARGETS) {
  const res = await fetch(
    `https://${serviceDomain}.microcms.io/api/v1/${endpoint}/${id}`,
    { method: "DELETE", headers: { "X-MICROCMS-API-KEY": apiKey } },
  );
  if (!res.ok) {
    throw new Error(
      `DELETE ${endpoint}/${id} failed: ${res.status} ${await res.text()}`,
    );
  }
  console.log(`${endpoint}/${id} deleted`);
  await sleep(250); // 書き込み API のレート制限対策
}

console.log(`done: ${TARGETS.length} 件`);
```

- [ ] **Step 2: 旧シードスクリプトを削除**

```bash
git rm scripts/seed-microcms.mjs
```

- [ ] **Step 3: 検証（構文チェックのみ。実行は最終セクションで）**

Run: `node --check scripts/cleanup-microcms.mjs && pnpm lint`
Expected: エラーなし

- [ ] **Step 4: Commit**

```bash
git add scripts/cleanup-microcms.mjs
git commit -m "feat: microCMS クリーンアップスクリプトを追加し旧シードスクリプトを削除"
```

---

### Task 5: 新 Work 型（開発以外の取り組み）とデータ層

新 `works` API はユーザーが作成済み。スキーマは title / summary / date / url / thumbnail のシンプル構成（category / tags / links / body なし）。

**Files:**
- Modify: `src/lib/microcms/mappers.test.ts`
- Modify: `src/content/types.ts`
- Modify: `src/lib/microcms/types.ts`
- Modify: `src/lib/microcms/mappers.ts`
- Modify: `src/lib/microcms/index.ts`

**Interfaces:**
- Consumes: `toJstDateString` / `fetchList`（既存）
- Produces:
  - `Work`（`slug / title / summary / date / url? / thumbnail?`。旧 Work とは別物）
  - `RawWork`（title / summary / date / url? / thumbnail?）
  - `mapWork(raw: RawWork): Work`
  - `getWorks(): Promise<Work[]>`（新 `works` エンドポイント）

- [ ] **Step 1: mapWork のテストを先に書く**

`src/lib/microcms/mappers.test.ts` — import に `mapWork` と `RawWork` を追加し、ファイル末尾に追記:

```ts
const rawWork: RawWork = {
  id: "chotech",
  title: "学生エンジニアコミュニティ ChoTech 設立・運営",
  summary: "長崎の学生エンジニアコミュニティを設立し、代表として運営。",
  date: "2025-03-31T15:00:00.000Z",
  url: "https://example.com/chotech",
};

describe("mapWork", () => {
  it("contentId を slug として Work に変換する", () => {
    expect(mapWork(rawWork)).toEqual({
      slug: "chotech",
      title: "学生エンジニアコミュニティ ChoTech 設立・運営",
      summary: "長崎の学生エンジニアコミュニティを設立し、代表として運営。",
      date: "2025-04-01",
      url: "https://example.com/chotech",
      thumbnail: undefined,
    });
  });

  it("未設定・空文字の url は undefined になる", () => {
    expect(mapWork({ ...rawWork, url: undefined }).url).toBeUndefined();
    expect(mapWork({ ...rawWork, url: "" }).url).toBeUndefined();
  });
});
```

- [ ] **Step 2: テストが落ちることを確認**

Run: `pnpm test`
Expected: FAIL — `mapWork` / `RawWork` が存在しない

- [ ] **Step 3: 型と実装を追加**

`src/content/types.ts` — `Project` 定義の直後に追記:

```ts
/** 開発以外の取り組み（microCMS の works API で管理）。 */
export interface Work {
  /** URL に使う識別子。microCMS の contentId */
  slug: string;
  title: string;
  summary: string;
  /** YYYY-MM-DD 形式 */
  date: string;
  /** 紹介先の外部リンク（任意。あればカード全体がリンクになる） */
  url?: string;
  thumbnail?: string;
}
```

`src/lib/microcms/types.ts` — `RawProject` の直後に追記:

```ts
/** 新 works API（開発以外の取り組み）。 */
export interface RawWork {
  id: string;
  title: string;
  summary: string;
  date: string;
  url?: string;
  thumbnail?: MicroCMSImage;
}
```

`src/lib/microcms/mappers.ts` —
- import に `Work`（`@/content/types`）と `RawWork`（`./types`）を追加
- `mapProject` の直後に追加:

```ts
export function mapWork(raw: RawWork): Work {
  return {
    slug: raw.id,
    title: raw.title,
    summary: raw.summary,
    date: toJstDateString(raw.date),
    url: raw.url || undefined,
    thumbnail: raw.thumbnail?.url,
  };
}
```

`src/lib/microcms/index.ts` — import に `Work` / `mapWork` / `RawWork` を追加し、`getProjects` の直後に追加:

```ts
/** Works セクション用：開発以外の取り組みを日付降順で全件返す。 */
export async function getWorks(): Promise<Work[]> {
  const contents = await fetchList<RawWork>("works");
  return contents.map(mapWork);
}
```

- [ ] **Step 4: 検証**

Run: `pnpm test && pnpm lint && pnpm exec tsc --noEmit`
Expected: 全て成功

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "feat: 開発以外の取り組み用の Work 型と works API フェッチを追加"
```

---

### Task 6: WorksSection / WorkCard を作成しホームに挿入

**Files:**
- Create: `src/components/works/work-card.tsx`
- Create: `src/components/works/works-section.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Work`（Task 5）、`getWorks()`（Task 5）、shadcn `Card`、`cn`
- Produces: `WorksSection({ className })`（async Server Component）、`WorkCard({ work })`

- [ ] **Step 1: WorkCard を作成**

`src/components/works/work-card.tsx`（`url` があればカード全体を外部リンクにする。サムネなしのフォールバックは Sparkles）:

```tsx
import { Sparkles } from "lucide-react";
import Image from "next/image";

import type { Work } from "@/content/types";

const cardClassName =
  "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background";

function WorkCardBody({ work }: { work: Work }) {
  return (
    <>
      <div className="relative aspect-video overflow-hidden bg-muted">
        {work.thumbnail ? (
          <Image
            src={work.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent/10 via-muted to-secondary">
            <Sparkles className="size-9 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-bold leading-snug">{work.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {work.summary}
        </p>
      </div>
    </>
  );
}

export function WorkCard({ work }: { work: Work }) {
  if (work.url) {
    return (
      <a
        href={work.url}
        target="_blank"
        rel="noreferrer"
        className={`${cardClassName} transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        <WorkCardBody work={work} />
      </a>
    );
  }

  return (
    <div className={cardClassName}>
      <WorkCardBody work={work} />
    </div>
  );
}
```

- [ ] **Step 2: WorksSection を作成**

`src/components/works/works-section.tsx`:

```tsx
import { Card } from "@/components/ui/card";
import { getWorks } from "@/lib/microcms";
import { cn } from "@/lib/utils";

import { WorkCard } from "./work-card";

export async function WorksSection({ className }: { className?: string }) {
  const works = await getWorks();

  return (
    <Card
      className={cn(
        "flex flex-col gap-6 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-2xl font-extrabold tracking-tight">Works</h2>
      {works.length === 0 ? (
        <p className="text-sm text-muted-foreground">取り組みは準備中です。</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => (
            <li key={work.slug}>
              <WorkCard work={work} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
```

- [ ] **Step 3: ホームに挿入**

`src/app/page.tsx` —
- import 追加: `import { WorksSection } from "@/components/works/works-section";`
- `ProjectsSection` タイルの**直前**に挿入:

```tsx
        <BentoTileMotion className="col-span-2 md:col-span-6">
          <WorksSection className="h-full" />
        </BentoTileMotion>

        <BentoTileMotion className="col-span-2 md:col-span-6">
          <ProjectsSection className="h-full" />
        </BentoTileMotion>
```

- [ ] **Step 4: 検証**

Run: `pnpm test && pnpm lint && pnpm exec tsc --noEmit`
Expected: 全て成功（描画確認はクリーンアップ・シード実行後、最終セクションで）

- [ ] **Step 5: Commit**

```bash
git add src/components/works src/app/page.tsx
git commit -m "feat: ホームの Projects 上に Works セクション（開発以外の取り組み）を追加"
```

---

### Task 7: 新 works のシードスクリプト

**Files:**
- Create: `scripts/seed-works.mjs`

**Interfaces:**
- Consumes: microCMS REST API（PUT `works/{slug}`、書き込みキー）
- Produces: 手動実行する一発スクリプト（初期データ 5 件。title / summary / date のみ。url・サムネイルはあとから管理画面で設定）

- [ ] **Step 1: シードスクリプトを作成**

`scripts/seed-works.mjs`:

```js
/**
 * 新 works API（開発以外の取り組み）へ初期データ 5 件を投入するワンショットスクリプト。
 *
 * 使い方:
 *   MICROCMS_SERVICE_DOMAIN=xxxx MICROCMS_WRITE_API_KEY=yyyy node scripts/seed-works.mjs
 *
 * - slug を contentId にするため PUT を使う
 * - 画像（thumbnail）と url は content API から投入せず、管理画面から手動で設定する
 */

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_WRITE_API_KEY;
if (!serviceDomain || !apiKey) {
  console.error(
    "MICROCMS_SERVICE_DOMAIN / MICROCMS_WRITE_API_KEY を設定してください。",
  );
  process.exit(1);
}

const WORKS = [
  {
    slug: "chotech",
    title: "学生エンジニアコミュニティ ChoTech 設立・運営",
    summary:
      "長崎の学生エンジニアコミュニティを設立し、代表として LT 会やワークショップを運営。2026 年度から長崎大学の公認団体。",
    date: "2025-04-01",
  },
  {
    slug: "nagasaki-hackathon-2025",
    title: "長崎ハッカソン2025 企画・運営",
    summary:
      "長崎スタジアムシティでは初のハッカソンを学生団体として企画・運営。ジャパネット賞を受賞。",
    date: "2025-10-01",
  },
  {
    slug: "junior-doctor-mentor",
    title: "長崎大学ジュニアドクター育成塾 メンター",
    summary:
      "中学生のアプリ開発支援に従事。主に Unity を用いたゲーム開発を指導。",
    date: "2024-07-01",
  },
  {
    slug: "technova-mentor",
    title: "テクノバながさき 学生メンター",
    summary:
      "子ども向けクリエイティブ活動支援を行う学生メンター。システム&デザイン担当としてチェックインシステム開発やポスター制作も担当。",
    date: "2024-06-01",
  },
  {
    slug: "n-code-labo",
    title: "N Code Labo プログラミング講師",
    summary:
      "角川ドワンゴ学園でオンライン家庭教師として Unity / Python / Swift 等のプログラミング指導。",
    date: "2024-05-01",
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** "YYYY-MM-DD" → microCMS 日付フィールド用 ISO（UTC 0時 = JST 9時で日付が保たれる）。 */
const toIsoDate = (date) => `${date}T00:00:00.000Z`;

for (const w of WORKS) {
  const res = await fetch(
    `https://${serviceDomain}.microcms.io/api/v1/works/${w.slug}`,
    {
      method: "PUT",
      headers: {
        "X-MICROCMS-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: w.title,
        summary: w.summary,
        date: toIsoDate(w.date),
      }),
    },
  );
  if (!res.ok) {
    throw new Error(
      `PUT works/${w.slug} failed: ${res.status} ${await res.text()}`,
    );
  }
  console.log(`works/${w.slug} OK`);
  await sleep(250); // 書き込み API のレート制限対策
}

console.log(`done: ${WORKS.length} 件`);
```

- [ ] **Step 2: 検証（構文チェックのみ）**

Run: `node --check scripts/seed-works.mjs && pnpm lint`
Expected: エラーなし

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-works.mjs
git commit -m "feat: 新 works API の初期データ投入スクリプトを追加"
```

---

## 最終セクション: microCMS クリーンアップ・シードと目視検証

microCMS 側のスキーマ変更（projects へのリネーム・press type 削除・新 works API 作成）は
**完了済み**。コード実装完了後、以下を進める。キーは `.env` にある
（`set -a && source .env && set +a` で読み込む。値はログ・出力に表示しない）。

- [ ] **1. クリーンアップ実行**: `node scripts/cleanup-microcms.mjs` → `done: 9 件` を確認
- [ ] **2. シード実行**: `node scripts/seed-works.mjs` → `done: 5 件` を確認
- [ ] **3. API 確認**: GET `projects?limit=100` が 10 件・GET `works?limit=100` が 5 件を返すことを curl で確認
- [ ] **4. ユーザー: 管理画面で works 5 件のサムネイル・url、projects のサムネイルを任意設定**（随時で可）
- [ ] **5. 目視検証**: `pnpm dev` を起動し以下を確認
  - ホーム: Works セクションが Projects の上に出る（5 件、サムネなしは Sparkles アイコン）
  - ホーム: Projects に 10 件（experience が消えている）
  - /press: サムネイルがカード縁までフィットし、種別バッジが消えている
  - /blogs: サムネイルがカード縁までフィット
  - 各カードのホバーでサムネイルがゆっくりズームする（1.05 倍 / 500ms）
- [ ] **6. `pnpm build` が通ることを確認してデプロイ**
