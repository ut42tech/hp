# MicroCMS 移行 + Timeline 丸アバター化 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Press / Projects / Timeline のコンテンツを MicroCMS（単一ソース）に移行し、Timeline を丸アイコンサムネイル（フォールバックはカテゴリアイコン）前提のデザインにする。

**Architecture:** `src/lib/microcms/` に `lib/blog` と同じ流儀（config / client / types / mappers / index）で素の `fetch + next: { revalidate }` のデータ層を作り、既存ドメイン型（`PressItem` / `Work` / `TimelineEntry`）に純関数でマップする。ローカルデータは削除し、移行はワンショットのシードスクリプトで行う。

**Tech Stack:** Next.js 16.2.3（App Router、Cache Components 無効 = 従来のデータキャッシュモデル）、TypeScript、Tailwind v4、vitest、biome。

**Spec:** `docs/superpowers/specs/2026-07-07-microcms-migration-design.md`

## Global Constraints

- microcms-js-sdk は追加しない（素の `fetch` を使う）
- ローカルデータへのフォールバックはしない。env 未設定は明確なメッセージで throw
- 環境変数: `MICROCMS_SERVICE_DOMAIN` / `MICROCMS_API_KEY`（アプリ）、`MICROCMS_WRITE_API_KEY`（シードのみ）
- revalidate は 3600 秒
- microCMS の日付フィールドは UTC ISO で返る。**JST 基準で `YYYY-MM-DD` に正規化する**（UTC のまま slice すると 1 日ずれる）
- セレクトフィールドは単一選択でも `string[]` で返る
- コメント・文言は日本語、既存コードの流儀（`lib/blog` 参照）に合わせる
- 各タスクの完了ゲート: `pnpm lint` と `pnpm test` が通ること（`pnpm build` は microCMS 側の準備が必要なため Task 8 でまとめて検証）

---

### Task 1: microCMS 接続基盤（config / client / raw types / .env.example）

**Files:**
- Create: `src/lib/microcms/config.ts`
- Create: `src/lib/microcms/config.test.ts`
- Create: `src/lib/microcms/client.ts`
- Create: `src/lib/microcms/types.ts`
- Create: `.env.example`
- Modify: `.gitignore`（33-34行付近の `.env*` の下に `!.env.example` を追加）

**Interfaces:**
- Produces: `getMicroCMSConfig(): { serviceDomain: string; apiKey: string }`（未設定で throw）、`MICROCMS_REVALIDATE_SECONDS = 3600`、`fetchList<T>(endpoint: string): Promise<T[]>`、raw 型 `RawPress` / `RawWork` / `RawWorkLink` / `RawTimelineEntry` / `MicroCMSImage` / `MicroCMSListResponse<T>`

- [ ] **Step 1: config の失敗テストを書く**

`src/lib/microcms/config.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

import { getMicroCMSConfig } from "./config";

describe("getMicroCMSConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("env が揃っていれば設定を返す", () => {
    vi.stubEnv("MICROCMS_SERVICE_DOMAIN", "example");
    vi.stubEnv("MICROCMS_API_KEY", "test-key");
    expect(getMicroCMSConfig()).toEqual({
      serviceDomain: "example",
      apiKey: "test-key",
    });
  });

  it("未設定なら設定方法を含むメッセージで throw する", () => {
    vi.stubEnv("MICROCMS_SERVICE_DOMAIN", "");
    vi.stubEnv("MICROCMS_API_KEY", "");
    expect(() => getMicroCMSConfig()).toThrow(/MICROCMS_SERVICE_DOMAIN/);
  });
});
```

- [ ] **Step 2: テストが落ちることを確認**

Run: `pnpm test`
Expected: FAIL（`./config` が存在しない）

- [ ] **Step 3: config.ts を実装**

`src/lib/microcms/config.ts`:

```ts
/** ISR の再生成間隔（秒）。1時間。 */
export const MICROCMS_REVALIDATE_SECONDS = 3600;

export interface MicroCMSConfig {
  serviceDomain: string;
  apiKey: string;
}

/**
 * microCMS の接続設定を env から読む。
 * 本サイトは microCMS を単一ソースとするため、未設定はフォールバックせず即 throw する
 * （ビルドを明確なメッセージで失敗させる）。
 */
export function getMicroCMSConfig(): MicroCMSConfig {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = process.env.MICROCMS_API_KEY;
  if (!serviceDomain || !apiKey) {
    throw new Error(
      "MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です。" +
        "ローカルは .env.local、本番は Vercel の環境変数に設定してください（.env.example 参照）。",
    );
  }
  return { serviceDomain, apiKey };
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `pnpm test`
Expected: PASS（config.test.ts の 2 件を含む）

- [ ] **Step 5: raw 型と client を実装**

`src/lib/microcms/types.ts`:

```ts
/**
 * microCMS API の raw レスポンス型。
 * - 日付フィールドは ISO 8601 UTC 文字列（JST で選んだ日付は前日 15:00Z になる）
 * - セレクトフィールドは単一選択でも string[]
 * - 画像フィールドは { url, width, height }
 * - 繰り返しカスタムフィールドは fieldId 付きオブジェクトの配列
 */

export interface MicroCMSImage {
  url: string;
  width?: number;
  height?: number;
}

export interface MicroCMSListResponse<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

export interface RawPress {
  id: string;
  title: string;
  outlet: string;
  url: string;
  date: string;
  type: string[];
  thumbnail?: MicroCMSImage;
  excerpt?: string;
}

export interface RawWorkLink {
  fieldId: string;
  label: string;
  href: string;
  kind: string[];
}

export interface RawWork {
  id: string;
  title: string;
  category: string[];
  summary: string;
  body?: string;
  date: string;
  tags?: string;
  thumbnail?: MicroCMSImage;
  links?: RawWorkLink[];
}

export interface RawTimelineEntry {
  id: string;
  title: string;
  date: string;
  category: string[];
  description?: string;
  location?: string;
  thumbnail?: MicroCMSImage;
}
```

`src/lib/microcms/client.ts`:

```ts
import { MICROCMS_REVALIDATE_SECONDS, getMicroCMSConfig } from "./config";
import type { MicroCMSListResponse } from "./types";

/** リスト型 API の全件取得（日付降順）。各 API は 100 件以内の前提。 */
export async function fetchList<T>(endpoint: string): Promise<T[]> {
  const { serviceDomain, apiKey } = getMicroCMSConfig();
  const url = `https://${serviceDomain}.microcms.io/api/v1/${endpoint}?limit=100&orders=-date`;
  const res = await fetch(url, {
    headers: { "X-MICROCMS-API-KEY": apiKey },
    next: { revalidate: MICROCMS_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`microCMS ${endpoint} fetch failed: ${res.status}`);
  }
  const data = (await res.json()) as MicroCMSListResponse<T>;
  return data.contents;
}
```

- [ ] **Step 6: .env.example を作成し .gitignore を調整**

`.env.example`:

```bash
# microCMS（必須。未設定だとビルドが失敗する）
MICROCMS_SERVICE_DOMAIN=
MICROCMS_API_KEY=

# シードスクリプト（scripts/seed-microcms.mjs）専用。アプリ本体では未使用
MICROCMS_WRITE_API_KEY=
```

`.gitignore` の `.env*` 行の直後に追加:

```
!.env.example
```

- [ ] **Step 7: lint + test + コミット**

Run: `pnpm lint && pnpm test`
Expected: どちらも PASS

```bash
git add src/lib/microcms .env.example .gitignore
git commit -m "feat: microCMS 接続基盤（config/client/raw 型）を追加"
```

---

### Task 2: マッパーと公開 API（TDD）

**Files:**
- Create: `src/lib/microcms/mappers.test.ts`
- Create: `src/lib/microcms/mappers.ts`
- Create: `src/lib/microcms/index.ts`

**Interfaces:**
- Consumes: Task 1 の raw 型、`fetchList<T>(endpoint)`。既存の `@/content/types`（`PressItem` / `Work` / `TimelineEntry` ほか）と `@/lib/utils` の `sortByDateDesc`
- Produces:
  - `mappers.ts`: `toJstDateString(iso: string): string`、`parseTags(text?: string): string[]`、`parseBody(text?: string): string[] | undefined`、`mapPress(raw: RawPress): PressItem`、`mapWork(raw: RawWork): Work`、`mapTimelineEntry(raw: RawTimelineEntry): TimelineEntry`、`filterProjects(works: Work[]): Work[]`
  - `index.ts`（アプリが使う唯一の入口）: `getAllPress(): Promise<PressItem[]>`、`getLatestPress(n: number): Promise<PressItem[]>`、`getProjects(): Promise<Work[]>`、`getTimeline(): Promise<TimelineEntry[]>`

注意: この時点では `TimelineEntry` に `thumbnail` がまだ無い（Task 5 で追加）。`mapTimelineEntry` の `thumbnail` 行は Task 5 まで入れない。

- [ ] **Step 1: マッパーの失敗テストを書く**

`src/lib/microcms/mappers.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  filterProjects,
  mapPress,
  mapTimelineEntry,
  mapWork,
  parseBody,
  parseTags,
  toJstDateString,
} from "./mappers";
import type { RawPress, RawTimelineEntry, RawWork } from "./types";

describe("toJstDateString", () => {
  it("JST で選んだ日付（前日 15:00Z）を正しい日付に戻す", () => {
    expect(toJstDateString("2026-03-31T15:00:00.000Z")).toBe("2026-04-01");
  });

  it("UTC 深夜 0 時はそのままの日付になる", () => {
    expect(toJstDateString("2026-04-01T00:00:00.000Z")).toBe("2026-04-01");
  });
});

describe("parseTags", () => {
  it("カンマ区切りを trim して配列にする", () => {
    expect(parseTags("Next.js, FastAPI , AWS")).toEqual([
      "Next.js",
      "FastAPI",
      "AWS",
    ]);
  });

  it("未設定・空文字は空配列", () => {
    expect(parseTags(undefined)).toEqual([]);
    expect(parseTags("")).toEqual([]);
  });
});

describe("parseBody", () => {
  it("空行区切りで段落に分割する", () => {
    expect(parseBody("一段落目。\n\n二段落目。")).toEqual([
      "一段落目。",
      "二段落目。",
    ]);
  });

  it("未設定・空文字は undefined", () => {
    expect(parseBody(undefined)).toBeUndefined();
    expect(parseBody("")).toBeUndefined();
  });
});

const rawPress: RawPress = {
  id: "abc",
  title: "掲載記事",
  outlet: "長崎のWA!",
  url: "https://example.com/article",
  date: "2025-10-31T15:00:00.000Z",
  type: ["interview"],
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
      type: "interview",
      thumbnail: "https://images.microcms-assets.io/x/press.jpg",
      excerpt: "取材いただきました。",
    });
  });

  it("未知の type は media にフォールバックする", () => {
    expect(mapPress({ ...rawPress, type: ["unknown"] }).type).toBe("media");
  });

  it("空文字 excerpt は undefined になる", () => {
    expect(mapPress({ ...rawPress, excerpt: "" }).excerpt).toBeUndefined();
  });
});

const rawWork: RawWork = {
  id: "coto2-ba",
  title: "コトコトバ",
  category: ["project"],
  summary: "受賞作品。",
  body: "一段落目。\n\n二段落目。",
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

describe("mapWork", () => {
  it("contentId を slug として Work に変換する", () => {
    expect(mapWork(rawWork)).toEqual({
      slug: "coto2-ba",
      category: "project",
      title: "コトコトバ",
      summary: "受賞作品。",
      body: ["一段落目。", "二段落目。"],
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

  it("未知の category は project、未知の link kind は other にフォールバックする", () => {
    const mapped = mapWork({
      ...rawWork,
      category: ["unknown"],
      links: [{ fieldId: "link", label: "L", href: "https://a", kind: ["x"] }],
    });
    expect(mapped.category).toBe("project");
    expect(mapped.links[0]?.kind).toBe("other");
  });
});

const rawTimeline: RawTimelineEntry = {
  id: "t1",
  title: "大学院に進学",
  date: "2026-03-31T15:00:00.000Z",
  category: ["education"],
  description: "瀬戸崎研究室に継続所属。",
  location: "長崎大学",
};

describe("mapTimelineEntry", () => {
  it("TimelineEntry に変換する", () => {
    expect(mapTimelineEntry(rawTimeline)).toEqual({
      date: "2026-04-01",
      category: "education",
      title: "大学院に進学",
      description: "瀬戸崎研究室に継続所属。",
      location: "長崎大学",
    });
  });

  it("未知の category は other、空文字 description/location は undefined", () => {
    const mapped = mapTimelineEntry({
      ...rawTimeline,
      category: ["unknown"],
      description: "",
      location: "",
    });
    expect(mapped.category).toBe("other");
    expect(mapped.description).toBeUndefined();
    expect(mapped.location).toBeUndefined();
  });
});

describe("filterProjects", () => {
  const base = { title: "t", summary: "s", tags: [], links: [] };

  it("project/oss/research のみ返し experience を除外する", () => {
    const list = filterProjects([
      { ...base, slug: "a", category: "project", date: "2026-01-01" },
      { ...base, slug: "b", category: "experience", date: "2026-02-01" },
      { ...base, slug: "c", category: "oss", date: "2026-03-01" },
      { ...base, slug: "d", category: "research", date: "2026-04-01" },
    ]);
    expect(list.map((w) => w.slug)).toEqual(["d", "c", "a"]);
  });

  it("日付降順に並ぶ", () => {
    const list = filterProjects([
      { ...base, slug: "old", category: "project", date: "2024-01-01" },
      { ...base, slug: "new", category: "project", date: "2026-01-01" },
    ]);
    expect(list.map((w) => w.slug)).toEqual(["new", "old"]);
  });
});
```

- [ ] **Step 2: テストが落ちることを確認**

Run: `pnpm test`
Expected: FAIL（`./mappers` が存在しない）

- [ ] **Step 3: mappers.ts を実装**

`src/lib/microcms/mappers.ts`:

```ts
import type {
  LinkKind,
  PressItem,
  PressType,
  TimelineCategory,
  TimelineEntry,
  Work,
  WorkCategory,
  WorkLink,
} from "@/content/types";
import { sortByDateDesc } from "@/lib/utils";

import type { RawPress, RawTimelineEntry, RawWork, RawWorkLink } from "./types";

const PRESS_TYPES: PressType[] = [
  "interview",
  "feature",
  "award",
  "event",
  "media",
];
const WORK_CATEGORIES: WorkCategory[] = [
  "project",
  "oss",
  "research",
  "experience",
];
const TIMELINE_CATEGORIES: TimelineCategory[] = [
  "life",
  "education",
  "work",
  "event",
  "other",
];
const LINK_KINDS: LinkKind[] = [
  "github",
  "demo",
  "paper",
  "slide",
  "article",
  "other",
];

/**
 * microCMS の日付（UTC ISO）→ JST 基準の YYYY-MM-DD。
 * JST で選んだ日付は「前日T15:00:00.000Z」で返るため、UTC のまま切り出すと 1 日ずれる。
 */
export function toJstDateString(iso: string): string {
  const utc = new Date(iso);
  const jst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** セレクトフィールド（単一選択でも string[]）の先頭値を既知の値に照合する。 */
function pickSelect<T extends string>(
  values: string[] | undefined,
  allowed: T[],
  fallback: T,
): T {
  const value = values?.[0];
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** カンマ区切りテキスト → タグ配列。 */
export function parseTags(text: string | undefined): string[] {
  return (text ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** テキストエリア → 空行区切りの段落配列。空なら undefined。 */
export function parseBody(text: string | undefined): string[] | undefined {
  const paragraphs = (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : undefined;
}

export function mapPress(raw: RawPress): PressItem {
  return {
    title: raw.title,
    outlet: raw.outlet,
    url: raw.url,
    date: toJstDateString(raw.date),
    type: pickSelect(raw.type, PRESS_TYPES, "media"),
    thumbnail: raw.thumbnail?.url,
    excerpt: raw.excerpt || undefined,
  };
}

function mapWorkLink(raw: RawWorkLink): WorkLink {
  return {
    label: raw.label,
    href: raw.href,
    kind: pickSelect(raw.kind, LINK_KINDS, "other"),
  };
}

export function mapWork(raw: RawWork): Work {
  return {
    slug: raw.id,
    category: pickSelect(raw.category, WORK_CATEGORIES, "project"),
    title: raw.title,
    summary: raw.summary,
    body: parseBody(raw.body),
    date: toJstDateString(raw.date),
    tags: parseTags(raw.tags),
    thumbnail: raw.thumbnail?.url,
    links: (raw.links ?? []).map(mapWorkLink),
  };
}

export function mapTimelineEntry(raw: RawTimelineEntry): TimelineEntry {
  return {
    date: toJstDateString(raw.date),
    category: pickSelect(raw.category, TIMELINE_CATEGORIES, "other"),
    title: raw.title,
    description: raw.description || undefined,
    location: raw.location || undefined,
  };
}

const PROJECT_CATEGORIES: WorkCategory[] = ["project", "oss", "research"];

/** Projects セクション用：project/oss/research のみ日付降順で返す。 */
export function filterProjects(works: Work[]): Work[] {
  return sortByDateDesc(
    works.filter((w) => PROJECT_CATEGORIES.includes(w.category)),
  );
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `pnpm test`
Expected: PASS（mappers.test.ts の全件）

- [ ] **Step 5: index.ts（公開 API）を実装**

`src/lib/microcms/index.ts`:

```ts
import type { PressItem, TimelineEntry, Work } from "@/content/types";

import { fetchList } from "./client";
import { filterProjects, mapPress, mapTimelineEntry, mapWork } from "./mappers";
import type { RawPress, RawTimelineEntry, RawWork } from "./types";

/** 日付降順で全 Press を返す。 */
export async function getAllPress(): Promise<PressItem[]> {
  const contents = await fetchList<RawPress>("press");
  return contents.map(mapPress);
}

/** 最新 n 件（ホームのタイル用）。 */
export async function getLatestPress(n: number): Promise<PressItem[]> {
  return (await getAllPress()).slice(0, n);
}

/** Projects セクション用：作品（project/oss/research）を日付降順で全件返す。 */
export async function getProjects(): Promise<Work[]> {
  const contents = await fetchList<RawWork>("works");
  return filterProjects(contents.map(mapWork));
}

/** 自己紹介タイムラインを日付降順で全件返す。 */
export async function getTimeline(): Promise<TimelineEntry[]> {
  const contents = await fetchList<RawTimelineEntry>("timeline");
  return contents.map(mapTimelineEntry);
}
```

- [ ] **Step 6: lint + test + コミット**

Run: `pnpm lint && pnpm test`
Expected: どちらも PASS

```bash
git add src/lib/microcms
git commit -m "feat: microCMS マッパーと公開 API（press/works/timeline）を追加"
```

---

### Task 3: シードスクリプト（既存データの移行）

**注意: このタスクは Task 4・5 のローカルデータ削除より先に行うこと**（データの出典元ファイルがまだ存在するうちにスナップショットを作る）。

**Files:**
- Create: `scripts/seed-microcms.mjs`

**Interfaces:**
- Consumes: `src/content/works.ts` の `works` 配列（18 件、4〜252 行目）と `src/content/profile.ts` の `timeline` 配列（30 件、100〜308 行目）のデータをスクリプト内に定数として転記する
- Produces: microCMS の `works` / `timeline` API へコンテンツを投入するワンショットスクリプト（`node scripts/seed-microcms.mjs` で実行）

- [ ] **Step 1: seed-microcms.mjs を作成**

`scripts/seed-microcms.mjs`（`WORKS` / `TIMELINE` には出典元の配列をオブジェクトリテラルのまま**全件**転記する。改変しない）:

```js
/**
 * 既存ローカルデータを microCMS に投入するワンショットスクリプト。
 *
 * 使い方:
 *   MICROCMS_SERVICE_DOMAIN=xxxx MICROCMS_WRITE_API_KEY=yyyy node scripts/seed-microcms.mjs
 *
 * - works は slug を contentId にするため PUT、timeline は POST で投入する
 * - 画像（thumbnail）は content API から投入できないため、管理画面から手動で設定する
 * - press は現在 0 件のため対象外
 */

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_WRITE_API_KEY;
if (!serviceDomain || !apiKey) {
  console.error(
    "MICROCMS_SERVICE_DOMAIN / MICROCMS_WRITE_API_KEY を設定してください。",
  );
  process.exit(1);
}

// ─── src/content/works.ts の works 配列を転記（18 件） ───
const WORKS = [
  // …… works.ts 4〜252 行目の配列要素をそのまま貼り付ける ……
];

// ─── src/content/profile.ts の timeline 配列を転記（30 件） ───
const TIMELINE = [
  // …… profile.ts 100〜308 行目の配列要素をそのまま貼り付ける ……
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** "YYYY-MM" / "YYYY-MM-DD" → microCMS 日付フィールド用 ISO（UTC 0時 = JST 9時で日付が保たれる）。 */
const toIsoDate = (date) => {
  const [y, m, d] = date.split("-");
  return `${y}-${m}-${d ?? "01"}T00:00:00.000Z`;
};

async function send(method, path, body) {
  const res = await fetch(
    `https://${serviceDomain}.microcms.io/api/v1/${path}`,
    {
      method,
      headers: {
        "X-MICROCMS-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(`${method} ${path} failed: ${res.status} ${await res.text()}`);
  }
}

for (const w of WORKS) {
  await send("PUT", `works/${w.slug}`, {
    title: w.title,
    category: [w.category],
    summary: w.summary,
    ...(w.body ? { body: w.body.join("\n\n") } : {}),
    date: toIsoDate(w.date),
    ...(w.tags.length > 0 ? { tags: w.tags.join(", ") } : {}),
    ...(w.links.length > 0
      ? {
          links: w.links.map((l) => ({
            fieldId: "link",
            label: l.label,
            href: l.href,
            kind: [l.kind],
          })),
        }
      : {}),
  });
  console.log(`works/${w.slug} OK`);
  await sleep(250); // 書き込み API のレート制限対策
}

for (const t of TIMELINE) {
  await send("POST", "timeline", {
    title: t.title,
    date: toIsoDate(t.date),
    category: [t.category],
    ...(t.description ? { description: t.description } : {}),
    ...(t.location ? { location: t.location } : {}),
  });
  console.log(`timeline: ${t.title} OK`);
  await sleep(250);
}

console.log(`done: works=${WORKS.length}, timeline=${TIMELINE.length}`);
```

- [ ] **Step 2: 転記の検証**

Run: `node -e "const s=require('fs').readFileSync('scripts/seed-microcms.mjs','utf8'); console.log('works(slug):', (s.match(/slug:/g)||[]).length, '/ titles:', (s.match(/title:/g)||[]).length)"`
Expected: `works(slug): 18 / titles: 48`（works 18 件 + timeline 30 件 = title 48 個）。目視で TIMELINE の先頭が 2026-05-24、末尾が 2003-04 であることも確認

- [ ] **Step 3: lint + コミット**

Run: `pnpm lint`
Expected: PASS（biome が scripts/ を対象にする場合もフォーマット済みであること）

```bash
git add scripts/seed-microcms.mjs
git commit -m "feat: microCMS へのデータ移行用シードスクリプトを追加"
```

---

### Task 4: Press の microCMS 化（+ next/image 対応）

**Files:**
- Modify: `src/app/press/page.tsx`（14-15 行目: async 化 + import 変更）
- Modify: `src/app/page.tsx`（17 行目の import と 31 行目の await）
- Modify: `src/components/press/press-card.tsx`（17-33 行目: img → next/image）
- Modify: `next.config.ts`（remotePatterns 追加）
- Delete: `src/content/press.ts`

**Interfaces:**
- Consumes: Task 2 の `getAllPress()` / `getLatestPress(n)`（`@/lib/microcms`）
- Produces: なし（消費側の置き換えのみ）

- [ ] **Step 1: next.config.ts に microCMS の画像ホストを追加**

`next.config.ts` 全体:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.microcms-assets.io" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: press/page.tsx を async 化**

`src/app/press/page.tsx` の import を変更:

```ts
import { getAllPress } from "@/lib/microcms";
```

コンポーネントを async 化:

```tsx
export default async function PressPage() {
  const items = await getAllPress();
```

（return 以下は変更なし）

- [ ] **Step 3: ホームの getLatestPress を差し替え**

`src/app/page.tsx` 17 行目の `import { getLatestPress } from "@/content/press";` を削除し、19 行目付近の blog import の近くに追加:

```ts
import { getLatestPress } from "@/lib/microcms";
```

31 行目を await に変更:

```ts
const latestPress = await getLatestPress(3);
```

- [ ] **Step 4: press-card.tsx のサムネイルを next/image 化**

`src/components/press/press-card.tsx` の import に追加:

```ts
import Image from "next/image";
```

17〜33 行目のサムネイル部分を差し替え（thumbnail のホストが microCMS 固定になったため、生 img と biome-ignore コメントを廃止）:

```tsx
<div className="relative aspect-[1.91/1] w-full overflow-hidden bg-muted">
  {item.thumbnail ? (
    <Image
      src={item.thumbnail}
      alt=""
      fill
      sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
      className="object-cover"
    />
  ) : (
    <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/10 via-muted to-secondary text-muted-foreground">
      <Newspaper className="size-8 opacity-50" />
      <span className="px-3 text-center text-xs font-semibold">
        {item.outlet}
      </span>
    </div>
  )}
</div>
```

- [ ] **Step 5: content/press.ts を削除**

```bash
rm src/content/press.ts
```

- [ ] **Step 6: lint + test + コミット**

Run: `pnpm lint && pnpm test`
Expected: どちらも PASS（`@/content/press` への参照が残っていれば lint / tsc が検知する）

```bash
git add -A
git commit -m "feat: Press を microCMS から取得するように移行"
```

---

### Task 5: Projects の microCMS 化

**Files:**
- Modify: `src/components/projects/projects-section.tsx`
- Delete: `src/content/works.ts`
- Delete: `src/content/works.test.ts`（契約は Task 2 の `filterProjects` テストに移植済み）

**Interfaces:**
- Consumes: Task 2 の `getProjects()`（`@/lib/microcms`）
- Produces: `ProjectsSection` は async サーバーコンポーネントになる（呼び出し側 `src/app/page.tsx` の JSX 使用箇所は変更不要）

- [ ] **Step 1: projects-section.tsx を async 化 + 空状態を追加**

`src/components/projects/projects-section.tsx` 全体:

```tsx
import { Card } from "@/components/ui/card";
import { getProjects } from "@/lib/microcms";
import { cn } from "@/lib/utils";

import { ProjectCard } from "./project-card";

export async function ProjectsSection({ className }: { className?: string }) {
  const projects = await getProjects();

  return (
    <Card
      className={cn(
        "flex flex-col gap-6 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-2xl font-extrabold tracking-tight">Projects</h2>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">作品は準備中です。</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((work) => (
            <li key={work.slug}>
              <ProjectCard work={work} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: works.ts と works.test.ts を削除**

```bash
rm src/content/works.ts src/content/works.test.ts
```

- [ ] **Step 3: lint + test + コミット**

Run: `pnpm lint && pnpm test`
Expected: どちらも PASS（works.test.ts が消え、mappers.test.ts が契約を担う）

```bash
git add -A
git commit -m "feat: Projects を microCMS から取得するように移行"
```

---

### Task 6: Timeline データの microCMS 化（型変更 + ホーム配線）

**Files:**
- Modify: `src/content/types.ts`（`TimelineEntry` に thumbnail 追加、`Profile` から timeline 削除）
- Modify: `src/content/profile.ts`（timeline 配列 100〜308 行目を削除）
- Modify: `src/lib/microcms/mappers.ts`（`mapTimelineEntry` に thumbnail を追加）
- Modify: `src/lib/microcms/mappers.test.ts`（thumbnail のテストを追加）
- Modify: `src/app/page.tsx`（getTimeline の await、空ガード）

**Interfaces:**
- Consumes: Task 2 の `getTimeline()`（`@/lib/microcms`）
- Produces: `TimelineEntry.thumbnail?: string`（Task 7 の UI が使う）

- [ ] **Step 1: mappers.test.ts に thumbnail のテストを追加（失敗を確認）**

`mapTimelineEntry` の describe 内に追加:

```ts
it("thumbnail の URL をマップする", () => {
  const mapped = mapTimelineEntry({
    ...rawTimeline,
    thumbnail: { url: "https://images.microcms-assets.io/x/t.jpg" },
  });
  expect(mapped.thumbnail).toBe("https://images.microcms-assets.io/x/t.jpg");
});
```

既存の「TimelineEntry に変換する」テストの期待値に `thumbnail: undefined` を追加する。

Run: `pnpm test`
Expected: FAIL（`mapTimelineEntry` がまだ thumbnail を返さない）

- [ ] **Step 2: 型とマッパーを更新**

`src/content/types.ts` の `TimelineEntry` に追加:

```ts
export interface TimelineEntry {
  /** YYYY-MM または YYYY-MM-DD 形式 */
  date: string;
  category: TimelineCategory;
  title: string;
  description?: string;
  /** 所属先や場所(任意) */
  location?: string;
  /** 丸アバター用サムネイル URL(任意。なければカテゴリアイコンでフォールバック) */
  thumbnail?: string;
}
```

`Profile` インターフェースから `timeline: TimelineEntry[];` の行を削除。

`src/lib/microcms/mappers.ts` の `mapTimelineEntry` の return に追加:

```ts
    thumbnail: raw.thumbnail?.url,
```

Run: `pnpm test`
Expected: PASS

- [ ] **Step 3: profile.ts から timeline 配列を削除**

`src/content/profile.ts` の `timeline: [ … ],`（100〜308 行目）を丸ごと削除する。`photos` 以降は残す。

- [ ] **Step 4: page.tsx を getTimeline に配線 + 空ガード**

`src/app/page.tsx` の import に追加（Task 4 で追加済みの行を拡張）:

```ts
import { getLatestPress, getTimeline } from "@/lib/microcms";
```

データ取得を Promise.all にまとめ、キャプション計算を置き換え:

```tsx
export default async function Home() {
  const [latestPosts, latestPress, timeline] = await Promise.all([
    getLatestBlogPosts(3),
    getLatestPress(3),
    getTimeline(),
  ]);

  // photos: [0]=タージ・マハル, [1]=長崎ハッカソン, [2]=アユタヤ
  const hackathon = profile.photos.at(1);
  const taj = profile.photos.at(0);
  const ayutthaya = profile.photos.at(2);

  // Timeline 見出し下の git ログ風キャプション用。空のときは非表示にする。
  const timelineYears = timeline.map((e) => Number(e.date.slice(0, 4)));
  const timelineSpan =
    timelineYears.length > 0
      ? `${Math.min(...timelineYears)}–${Math.max(...timelineYears)}`
      : null;
```

Timeline タイル部分を差し替え:

```tsx
<BentoTileMotion className="col-span-2 md:col-span-6">
  <Card className="flex flex-col gap-6 rounded-3xl border-border bg-card p-6 md:p-8">
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-extrabold tracking-tight">
        Timeline
      </h2>
      {timelineSpan ? (
        <p className="text-xs tabular-nums text-muted-foreground">
          {timeline.length} commits · {timelineSpan}
        </p>
      ) : null}
    </div>
    {timeline.length === 0 ? (
      <p className="text-sm text-muted-foreground">経歴は準備中です。</p>
    ) : (
      <Timeline entries={timeline} />
    )}
  </Card>
</BentoTileMotion>
```

- [ ] **Step 5: lint + test + コミット**

Run: `pnpm lint && pnpm test`
Expected: どちらも PASS（`profile.timeline` への参照が残っていれば tsc が検知する）

```bash
git add -A
git commit -m "feat: Timeline を microCMS から取得するように移行"
```

---

### Task 7: Timeline 丸アバターデザイン

**Files:**
- Modify: `src/components/home/timeline.tsx`

**Interfaces:**
- Consumes: Task 6 の `TimelineEntry.thumbnail?: string`、既存の `bg-cat-*` / `text-cat-*` カラートークン（`src/app/globals.css` 26-30 行目で定義済み）

**デザイン仕様（スペック準拠）:**
- レール列: `w-5` → `w-10`（年見出し行・エントリ行の両方。レールの連続性のため揃える）
- エントリノード: 小ドット → `size-10` 丸アバター（`ring-4 ring-card` 維持）
  - thumbnail あり: `next/image`（`fill` + `sizes="40px"`）+ `object-cover`
  - なし: `bg-cat-*/15` 背景 + `text-cat-*` の lucide アイコン
- アイコン: life=Heart / education=GraduationCap / work=Briefcase / event=Trophy / other=Sparkles
- 年見出しノード: `size-3.5` のまま（広くなった列の中央に自然に配置される）
- コンテンツ先頭行が 40px アバターと光学的に揃うよう、エントリ本文に `pt-2` を追加

- [ ] **Step 1: timeline.tsx を改修**

import を変更（`MapPin` に追加）:

```ts
import {
  Briefcase,
  GraduationCap,
  Heart,
  type LucideIcon,
  MapPin,
  Sparkles,
  Trophy,
} from "lucide-react";
import { type MotionProps, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
```

`categoryConfig` を差し替え:

```ts
const categoryConfig: Record<
  TimelineCategory,
  { label: string; dot: string; icon: LucideIcon; avatar: string }
> = {
  life: {
    label: "life",
    dot: "bg-cat-life",
    icon: Heart,
    avatar: "bg-cat-life/15 text-cat-life",
  },
  education: {
    label: "education",
    dot: "bg-cat-education",
    icon: GraduationCap,
    avatar: "bg-cat-education/15 text-cat-education",
  },
  work: {
    label: "work",
    dot: "bg-cat-work",
    icon: Briefcase,
    avatar: "bg-cat-work/15 text-cat-work",
  },
  event: {
    label: "event",
    dot: "bg-cat-event",
    icon: Trophy,
    avatar: "bg-cat-event/15 text-cat-event",
  },
  other: {
    label: "other",
    dot: "bg-cat-other",
    icon: Sparkles,
    avatar: "bg-cat-other/15 text-cat-other",
  },
};
```

年見出し行のレール列（146 行目）を `w-5` → `w-10` に:

```tsx
<div className="flex w-10 flex-col items-center">
```

エントリ行のノード部分（175〜181 行目）を差し替え:

```tsx
<div className="flex w-10 flex-col items-center">
  <span
    aria-hidden
    className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-card"
  >
    {entry.thumbnail ? (
      <Image
        src={entry.thumbnail}
        alt=""
        fill
        sizes="40px"
        className="object-cover"
      />
    ) : (
      <span
        className={cn(
          "flex size-full items-center justify-center",
          config.avatar,
        )}
      >
        <config.icon className="size-4" />
      </span>
    )}
  </span>
  {lineSegment}
</div>
```

注: `config` の宣言（`const config = categoryConfig[entry.category];`）はノードより後ろ（164 行目）にあるため、エントリ分岐の先頭（`const { entry } = row;` の直後）で参照できる位置関係は現状のまま使える。`<config.icon />` は JSX でそのまま書ける（小文字始まりのプロパティアクセスはコンポーネント扱いになる）が、biome/tsx の流儀に合わせるなら `const Icon = config.icon;` を分岐内で宣言して `<Icon className="size-4" />` とする。**`const Icon = config.icon;` 方式を採用する**（project-card.tsx と同じ流儀）。

エントリ本文のコンテナ（182〜187 行目）に `pt-2` を追加:

```tsx
<div
  className={cn(
    "flex flex-1 flex-col gap-2 pt-2",
    nextIsYear ? "pb-14" : "pb-8",
  )}
>
```

- [ ] **Step 2: lint + test + コミット**

Run: `pnpm lint && pnpm test`
Expected: どちらも PASS

```bash
git add src/components/home/timeline.tsx
git commit -m "feat: Timeline を丸アイコンサムネイル前提のデザインに変更"
```

---

### Task 8: 統合検証（要ユーザー操作: microCMS 側の準備）

**このタスクの前提（ユーザーが行う）:**
1. microCMS でサービスを作成し、スペックどおりに `press` / `works` / `timeline` の 3 API（リスト型）を作成
2. 読み取り用 API キーを `.env.local` に設定（`MICROCMS_SERVICE_DOMAIN` / `MICROCMS_API_KEY`）
3. 書き込み権限付きキーで `MICROCMS_SERVICE_DOMAIN=xxxx MICROCMS_WRITE_API_KEY=yyyy node scripts/seed-microcms.mjs` を実行
4. Vercel の環境変数にも同じ読み取り設定を追加
5. （任意）timeline のサムネイル画像を管理画面から設定

**Files:** なし（検証のみ）

- [ ] **Step 1: 全体チェック**

Run: `pnpm lint && pnpm test && pnpm build`
Expected: すべて PASS（env 未設定の場合、build は `MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です` で失敗する = 意図どおりのメッセージが出ることも確認）

- [ ] **Step 2: 表示確認**

Run: `pnpm dev`
確認項目:
- ホーム: Press タイル（3 件）、Projects グリッド（experience が混ざっていない・日付降順）、Timeline（件数と年レンジのキャプション、丸アバター表示）
- Timeline: thumbnail 設定済みエントリは画像、未設定はカテゴリ色アイコンのフォールバック。年見出しレールが連続している
- /press: 一覧表示（0 件なら「記事はまだありません。」）
- ライト / ダークテーマ両方でアバターのコントラスト確認

- [ ] **Step 3: 完了コミット（残変更があれば）**

```bash
git status
```

Expected: クリーン（各タスクでコミット済み）
