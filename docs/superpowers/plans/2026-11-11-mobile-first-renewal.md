# モバイルファースト・リニューアル Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bento グリッドのホームを、名刺代わりを最優先にしたモバイルファーストの 1 カラム縦スクロール構成に作り直す。

**Architecture:** `src/content/` のデータに表示用フラグと選択関数（純粋関数・Vitest）を足し、`src/components/home/` の Server Component 群が並ぶだけの薄い `page.tsx` にする。Bento・Matter.js・ハンバーガーメニューは削除する。見た目はカードを使わず、文字サイズ・余白・濃淡で優先度を表す。

**Tech Stack:** Next.js 16 (App Router) / React 19 / TypeScript strict / Tailwind v4 / shadcn(base-ui) / motion / Biome / Vitest / pnpm。見た目の確認は事前インストール済みの Playwright（`require('playwright')`、`chromium.launch()`）。

**Spec:** `docs/superpowers/specs/2026-11-03-mobile-first-renewal-design.md`

## Global Constraints

- 技術スタック・カラートークン・LINE Seed JP・ダークモードは変更しない（spec §2）。
- カード（枠・背景付きの箱）は使わない。例外は Highlights のスワイプカードのみ（spec §2）。
- 本文幅: モバイル全幅＋左右 `px-5`、`md` 以上は `max-w-2xl` 中央寄せ（spec §2）。
- 文面（肩書き・自己紹介・Timeline・Projects の中身）は書き換えない。新フィールドは既存文面からの転記・抜粋の暫定値のみ（spec §1 非ゴール）。
- `pnpm lint` / `pnpm test` / `pnpm build` が各タスク完了時に通ること。
- Next.js 16 は訓練データと API が異なる（AGENTS.md）。`notFound` / `sitemap` / metadata / route segment config に触れる前に `node_modules/next/dist/docs/` の該当ガイドを読む。
- コミットメッセージは既存に合わせ `feat:` / `fix:` / `chore:` / `docs:` + 日本語、末尾にセッションの attribution 行。
- 外部リンクは `target="_blank" rel="noopener noreferrer"`。
- 検査用サーバは毎回 `pnpm start -p 3100` で起動し、検査後に停止する（前の Task のサーバが残っていたら先に止める）。

## Review Focus

1. **375px で長い語・長いタイトル・URL がはみ出す** → 折り返して横スクロールは発生しない。Task 2 の `scripts/check-layout.mjs` が全タスクで `scrollWidth <= clientWidth` を検査する。
2. **Highlights の横スワイプ領域がページ全体の横スクロールを生む** → スワイプはセクション内に閉じる（同スクリプトで検査、Task 3）。
3. **ビルド時に Blog の外部取得が失敗／0 件** → Writing の記事リストだけ消え、`/blogs` へのリンクは残る（Task 6 で 0 件の描画を確認）。
4. **リンクを持たない Work（例: MapChat）が Highlight になる** → カードはリンクなしで表示され、壊れた `href` を出さない（Task 1 のテストで `href` が `undefined`）。
5. **`featured` が 1 件も付いていない Timeline** → 折りたたみ時は `life` 以外の全件を出し、空にならない（Task 1 のテスト）。

---

## File Structure

| パス | 責務 |
|---|---|
| `src/content/types.ts` | 型。フラグと `headline` / `summary` / カテゴリ別 `techStack` を追加、`Keyword` / `roleTags` / `mottoEn` を削除 |
| `src/content/profile.ts` | データ。暫定値とフラグを投入 |
| `src/content/works.ts` | `highlight` フラグ投入（`getProjects` は既存） |
| `src/content/highlights.ts` (+test) | `getHighlights` |
| `src/content/timeline.ts` (+test) | `getFeaturedTimeline` / `getTimeline` |
| `src/content/social.ts` (+test) | `getPrimarySocial` |
| `src/content/press.ts` (+test) | `hasPress` を追加 |
| `src/components/home/*.tsx` | 各セクション（section / intro / highlights / about / project-list / skills / timeline / writing） |
| `src/components/shared/social-links.tsx` | `links` を props で受け取る形に変更 |
| `src/components/shared/tech-stack-list.tsx` | `items` を props で受け取る形に変更 |
| `scripts/check-layout.mjs` | Playwright でのレイアウト検査・スクリーンショット |
| `docs/content-update-checklist.md` | 後で文面を更新するためのチェックリスト |

---

### Task 1: データモデルと選択関数

**Files:**
- Modify: `src/content/types.ts`, `src/content/profile.ts`, `src/content/works.ts`, `src/content/press.ts`
- Modify: `src/components/shared/tech-stack-list.tsx`, `src/components/bento/tech-stack-tile.tsx`（ビルドを通すための最小変更）
- Create: `src/content/highlights.ts`, `src/content/timeline.ts`, `src/content/social.ts`
- Test: `src/content/highlights.test.ts`, `src/content/timeline.test.ts`, `src/content/social.test.ts`, `src/content/press.test.ts`

**Interfaces:**
- Produces:
  - 型（`types.ts`）:
    - `TimelineEntry.highlight?: boolean`, `TimelineEntry.featured?: boolean`
    - `Work.highlight?: boolean`
    - `SocialLink.primary?: boolean`
    - `type TechCategory = "languages" | "web" | "infra" | "creative" | "academic"`
    - `Profile.headline: string`, `Profile.summary: string[]`, `Profile.techStack: Record<TechCategory, string[]>`
    - `interface Highlight { title: string; date: string; description?: string; href?: string; kind: "work" | "timeline" }`
  - `getHighlights(n = 3, works?: Work[], timeline?: TimelineEntry[]): Highlight[]`（`highlights.ts`）
  - `getFeaturedTimeline(entries = profile.timeline): TimelineEntry[]`、`getTimeline(opts: { includeLife: boolean }, entries = profile.timeline): TimelineEntry[]`（`timeline.ts`）
  - `getPrimarySocial(links = profile.social): SocialLink[]`（`social.ts`）
  - `hasPress(items = press): boolean`（`press.ts`）
  - `TechStackList({ items: string[]; className?: string })`

この Task では `roleTags` / `mottoEn` / `Keyword` はまだ削除しない（Bento が参照しているため。Task 2 で削除）。

- [ ] **Step 1: 依存をインストールして現状が通ることを確認**

Run: `pnpm install && pnpm test && pnpm lint`
Expected: すべて PASS（既存テスト `works.test.ts` / `utils.test.ts` / `keywords-layout.test.ts`）

- [ ] **Step 2: 失敗するテストを書く**

`src/content/highlights.test.ts`（テスト用の Work / TimelineEntry を引数で渡す）:
- `highlight: true` のものだけを Work と Timeline の両方から集める
- 日付降順。`"2026-03-15"`（Work）と `"2026-03"`（Timeline）が混在しても `sortByDateDesc` の順になる（`"2026-03-15"` が先）
- 4 件あっても `n = 3` なら 3 件
- Work → `{ kind: "work", description: work.summary, href: work.links[0]?.href }`。`links: []` の Work は `href` が `undefined`
- Timeline → `{ kind: "timeline", description: entry.description, href: undefined }`
- 何もフラグが無ければ `[]`
- 実データ: `getHighlights()` が 1〜3 件を返す

`src/content/timeline.test.ts`:
- `getFeaturedTimeline` は `featured: true` だけを日付降順で返す
- `featured` が 0 件の入力では `life` 以外の全件を日付降順で返す（Review Focus 5）
- `getTimeline({ includeLife: false })` は `life` を含まない、`{ includeLife: true }` は全件、どちらも日付降順
- 実データ: `getFeaturedTimeline().length` が 4〜8 件

`src/content/social.test.ts`:
- `primary: true` だけを定義順で返す
- 実データ: X / GitHub / Zenn / Wantedly の 4 件をこの順で返す

`src/content/press.test.ts`:
- `hasPress([])` が `false`、1 件の配列で `true`
- 実データ: `hasPress()` が `false`（現状 0 件）

- [ ] **Step 3: 失敗を確認**

Run: `pnpm test`
Expected: 新しい 4 ファイルが import エラーで FAIL

- [ ] **Step 4: 型とデータを追加**

`profile.ts` に投入する暫定値（文面は既存からの転記のみ）:
- `headline: "学生エンジニア / フルスタック・デザイン"`
- `summary`: 既存 `bio` から次の 3 文を抜粋
  1. `"「デザインとテクノロジーで最高のユーザ体験を届けたい」がモットー。"`
  2. `"卒業研究では生成AIを用いたコミュニケーション支援メタバースプラットフォームをWeb技術をメインにフルスクラッチで開発。"`
  3. `"長崎のテックカルチャーを盛り上げたいという想いから、学生エンジニアコミュニティChoTechを創設し、地域の技術コミュニティの活性化にも取り組んでいます。"`
- `techStack`: 既存配列を既存のコメント区切りどおりに分割（languages: TypeScript〜Java / web: React〜Three.js / infra: AWS〜Git / creative: Unity〜Figma / academic: LaTeX, Typst）
- `social`: X / GitHub / Zenn / Wantedly に `primary: true`
- Timeline `featured: true`: 大学院進学 (2026-04)、学長賞 (2026-03)、ガバイソン (2026-03)、ChoTech 設立 (2025-04)、インド短期留学 (2025-02)、JSET 優秀発表賞 (2024-03)
- Timeline `highlight: true`: 学長賞 (2026-03)、JSET 優秀発表賞 (2024-03)

`works.ts`: `coto2-ba` に `highlight: true`。

- [ ] **Step 5: 選択関数を実装**

`highlights.ts` / `timeline.ts` / `social.ts` / `press.ts` に上記シグネチャで実装。並べ替えは既存 `sortByDateDesc`（`src/lib/utils.ts`）を使う。

- [ ] **Step 6: `TechStackList` を `items` props 化**

`profile.techStack` を直接読まず `items: string[]` を受け取る。`bento/tech-stack-tile.tsx` は `Object.values(profile.techStack).flat()` を渡す。`Badge` と `techIconMap` は維持。

- [ ] **Step 7: 通ることを確認**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: すべて PASS。ビルド成功

- [ ] **Step 8: Commit**

```bash
git add src/content src/components/shared/tech-stack-list.tsx src/components/bento/tech-stack-tile.tsx
git commit -m "feat: リニューアル用のデータフラグと選択関数を追加"
```

---

### Task 2: 新ホームの骨格・Intro・Bento の撤去・レイアウト検査スクリプト

**Files:**
- Create: `src/components/home/section.tsx`, `src/components/home/intro.tsx`, `scripts/check-layout.mjs`
- Modify: `src/app/page.tsx`（全面書き換え）、`src/components/shared/social-links.tsx`、`src/components/motion/fade-in.tsx`、`src/app/opengraph-image.tsx`、`src/content/types.ts`、`src/content/profile.ts`、`src/components/layout/footer.tsx`
- Delete: `src/components/bento/`（全ファイル）、`src/components/motion/bento-tile-motion.tsx`、`src/components/projects/`、`src/content/keywords.ts`
- Modify: `package.json`（`matter-js` と `@types/matter-js` を削除）

**Interfaces:**
- Consumes: `getPrimarySocial()`、`profile.headline`（Task 1）
- Produces:
  - `Section({ id: string; label: string; children: ReactNode; className?: string })`: `<section id aria-labelledby>`、見出しは `text-xs font-medium uppercase tracking-widest text-muted-foreground` のラベル＋細い区切り線。セクション間の縦余白はここで一元管理（`py-12 md:py-16`）
  - `SocialLinks({ links: SocialLink[]; size?: "default" | "sm"; className?: string })`
  - `FadeIn`: 既存 props のまま、`animate` を `whileInView` + `viewport={{ once: true, margin: "-10% 0px" }}` に変更（reduced motion 時は即表示のまま）
  - `scripts/check-layout.mjs <baseUrl> <outDir>`: 375×812 と 1280×800、light / dark の 4 通りで `/` と `/blogs` を撮影し、`document.documentElement.scrollWidth > clientWidth` の組み合わせがあれば非ゼロ終了。375px の `/` では `[data-intro-name]` / `[data-intro-headline]` / `[data-intro-affiliation]` / `[data-intro-social]` の `getBoundingClientRect().bottom <= 812` も検査
  - `page.tsx` のレイアウト: `<div className="mx-auto max-w-2xl px-5">` の中にセクションを順に並べ、Intro 以外の各セクションを `<FadeIn>` で包む。以降の Task はここにセクションを 1 つずつ追加する

- [ ] **Step 1: Next.js 16 の metadata / OG 画像のガイドを読む**

Run: `ls node_modules/next/dist/docs/` から metadata・opengraph-image の該当ファイルを開いて読む。

- [ ] **Step 2: レイアウト検査スクリプトを書き、現行ホームで実行**

Run: `pnpm build && (pnpm start -p 3100 &) && node scripts/check-layout.mjs http://localhost:3100 "$SCRATCH/layout-before"`
（`$SCRATCH` はセッションの scratchpad。以降も同じ）
Expected: スクリプトが動き、スクリーンショットが保存される。Intro 用の `data-*` が無いので Intro の検査は FAIL になる（これがこの Task の失敗テスト）

- [ ] **Step 3: Bento を撤去し、`Section` と `Intro` を実装**

`Intro` の中身（spec §3.1 #1）: アバター（`profile.image` を `next/image`、無ければ `profile.name` の頭文字のプレースホルダ）、名前（`profile.name`）、`headline`、所属（`affiliation.role` · `affiliation.school` と `lab` へのリンク）、モットー（`profile.motto`）、`getPrimarySocial()` の SNS ボタン。各要素に上記の `data-intro-*` 属性を付ける。`Intro` は `Section` を使わない（ラベルなしのファーストビュー）。

`types.ts` から `Keyword` / `roleTags` / `mottoEn` を削除し、`profile.ts` の該当値も削除する。`opengraph-image.tsx` は `profile.roleTags.join(" / ")` を `profile.headline` に置き換える。`footer.tsx` は `<SocialLinks links={profile.social} size="sm" />` を渡す。`pnpm remove matter-js @types/matter-js`。

- [ ] **Step 4: 検査を通す**

Run: `pnpm lint && pnpm test && pnpm build && (pnpm start -p 3100 &) && node scripts/check-layout.mjs http://localhost:3100 "$SCRATCH/layout-t2"`
Expected: すべて PASS。375px のスクリーンショットで名前・肩書き・所属・SNS が最初の画面内に見える

- [ ] **Step 5: Commit**

```bash
git add -A src scripts package.json pnpm-lock.yaml
git commit -m "feat: ホームを 1 カラム構成に作り直し Intro を追加、Bento と Matter.js を撤去"
```

---

### Task 3: Highlights と About

**Files:**
- Create: `src/components/home/highlights.tsx`, `src/components/home/about.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Section`（Task 2）、`getHighlights()`、`Highlight`、`profile.summary` / `bio` / `titles` / `photos`（Task 1）
- Produces: `Highlights({ items: Highlight[] })`、`About()`

- [ ] **Step 1: Highlights を実装**

`Section id="highlights" label="Highlights"`。`items.length === 0` なら `null`。横並びのリストで `overflow-x-auto snap-x snap-mandatory`、各カードは `snap-start shrink-0 w-[80%] md:w-[calc((100%-2rem)/3)]`、角丸＋極薄ボーダー（唯一のカード）。日付（`YYYY.MM`）・タイトル・説明 2 行（`line-clamp-2`）。`href` があればカード全体を外部リンク、無ければ `<div>`。スワイプ領域の左右はみ出しは `-mx-5 px-5` までに留め、ページ幅を超えないこと。

- [ ] **Step 2: About を実装**

`Section id="about" label="About"`。`summary` を段落で表示 → `<details><summary>続きを読む</summary>` に `bio` 段落 → `titles` を `<ul>` の箇条書き → `photos` を横スクロールの写真帯（各 `next/image`、高さ固定 `h-28`、`caption` を `alt` とは別に `figcaption` で小さく）。

- [ ] **Step 3: `page.tsx` に Intro の後へ追加し、検査を通す**

Run: `pnpm lint && pnpm build && (pnpm start -p 3100 &) && node scripts/check-layout.mjs http://localhost:3100 "$SCRATCH/layout-t3"`
Expected: PASS（Highlights があっても横スクロールなし）。スクリーンショットでカードが 375px では 1 枚強見え、1280px では 3 枚並ぶ

- [ ] **Step 4: Commit**

```bash
git add src/components/home src/app/page.tsx
git commit -m "feat: Highlights と About セクションを追加"
```

---

### Task 4: Projects と Skills

**Files:**
- Create: `src/components/home/project-list.tsx`, `src/components/home/skills.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Section`、`getProjects()`（既存）、`TechStackList({ items })`、`profile.techStack`、`TechCategory`
- Produces: `ProjectList()`、`Skills()`

- [ ] **Step 1: ProjectList を実装**

`Section id="projects" label="Projects"`。`<ul>` で 1 作品 1 行（`divide-y divide-border`）。各行: タイトル（太字）＋年（`date.slice(0, 4)`、右寄せ `tabular-nums`）、`summary` 1 行、タグ（小さい muted テキストを ` · ` 区切り）、`links` を `label` テキスト＋矢印アイコン（`lucide-react` の `ArrowUpRight`）で並べる。`links` が空なら何も出さない。長いタイトルは折り返す（`truncate` しない）。

- [ ] **Step 2: Skills を実装**

`Section id="skills" label="Skills"`。カテゴリの表示名は `{ languages: "Languages", web: "Web", infra: "Infra / Cloud", creative: "Creative", academic: "Academic" }` の順で固定。各カテゴリは小見出し＋`<TechStackList items={profile.techStack[cat]} />`。空配列のカテゴリは出さない。

- [ ] **Step 3: `page.tsx` の About の後に追加し、検査を通す**

Run: `pnpm lint && pnpm build && (pnpm start -p 3100 &) && node scripts/check-layout.mjs http://localhost:3100 "$SCRATCH/layout-t4"`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/home src/app/page.tsx
git commit -m "feat: Projects と Skills セクションを追加"
```

---

### Task 5: Timeline（主要項目＋すべて見る）

**Files:**
- Modify（全面書き換え）: `src/components/home/timeline.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Section`、`getFeaturedTimeline()`、`getTimeline({ includeLife: true })`（Task 1）
- Produces: `Timeline({ featured: TimelineEntry[]; all: TimelineEntry[] })`（`"use client"`）

- [ ] **Step 1: Timeline を実装**

`page.tsx`（Server）で 2 つの配列を作って渡す。`useState(false)` で展開状態。表示する配列は展開前 `featured`、展開後 `all`。各行: 日付（既存 `formatDate` の `YYYY.MM` 形式）、カテゴリ色のドット（既存 `bg-cat-*` トークン）、タイトル、`description`、`location`（`MapPin` アイコン）。年の見出し行は既存どおり年が変わるたびに挿入。下部に「すべて見る（全 N 件）」／「主要な項目だけ表示」の `<button aria-expanded aria-controls>`。`featured.length === all.length` ならボタンを出さない。既存の motion 演出は削除（`FadeIn` はセクション単位で親が付ける）。`Section id="timeline" label="Timeline"` で包む。

- [ ] **Step 2: 検査を通す**

Run: `pnpm lint && pnpm build && (pnpm start -p 3100 &) && node scripts/check-layout.mjs http://localhost:3100 "$SCRATCH/layout-t5"`
Expected: PASS。スクリーンショットで 6 件＋ボタンが見える。ボタンを押すと幼少期の項目まで出ることをブラウザ（`pnpm dev`）で一度確認

- [ ] **Step 3: Commit**

```bash
git add src/components/home/timeline.tsx src/app/page.tsx
git commit -m "feat: Timeline を主要項目表示＋すべて見るトグルに作り直し"
```

---

### Task 6: Writing と Press の 0 件対応

**Files:**
- Create: `src/components/home/writing.tsx`
- Modify: `src/app/page.tsx`, `src/app/press/page.tsx`, `src/app/sitemap.ts`
- Delete: `src/components/bento/blog-teaser-tile.tsx` 等は Task 2 で削除済み。`src/components/press/press-card.tsx` は `/press` で継続使用

**Interfaces:**
- Consumes: `Section`、`getLatestBlogPosts(3)`（既存 `src/lib/blog`）、`hasPress()`、`getLatestPress(3)`（Task 1・既存）
- Produces: `Writing({ posts: BlogPost[]; press: PressItem[] })`

- [ ] **Step 1: Next.js 16 の `notFound` と sitemap のガイドを読む**

`node_modules/next/dist/docs/` の該当ページを読む。

- [ ] **Step 2: Writing を実装**

`Section id="writing" label="Writing"`。`posts` が 1 件以上なら 1 行 1 記事（日付 `YYYY.MM.DD`、プラットフォーム名は既存 `platformMeta`、タイトル）を外部リンクで。0 件なら記事リストを出さない。`/blogs` への「記事をすべて見る」リンクは常に表示（Review Focus 3）。`press.length > 0` のときだけ小見出し「Press」＋同形式のリストと `/press` へのリンクを出す。

- [ ] **Step 3: `/press` と sitemap を 0 件対応**

`press/page.tsx`: `hasPress()` が false なら `notFound()`（「記事はまだありません。」の分岐は削除）。`sitemap.ts`: `/press` は `hasPress()` が true のときだけ配列に含める。

- [ ] **Step 4: 検査**

Run: `pnpm lint && pnpm test && pnpm build && (pnpm start -p 3100 &) && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/press && curl -s http://localhost:3100/sitemap.xml | grep -c press ; node scripts/check-layout.mjs http://localhost:3100 "$SCRATCH/layout-t6"`
Expected: `/press` が `404`、sitemap の `press` 出現数 `0`、レイアウト検査 PASS。Writing に `/blogs` リンクが表示される（ブログ取得が失敗する環境でも）

- [ ] **Step 5: Commit**

```bash
git add src/components/home/writing.tsx src/app
git commit -m "feat: Writing セクションを追加し Press 0 件時はページとサイトマップから外す"
```

---

### Task 7: ヘッダー・フッター・/blogs を新トーンに

**Files:**
- Modify: `src/components/layout/header.tsx`, `src/components/layout/footer.tsx`, `src/lib/navigation.ts`, `src/app/blogs/page.tsx`, `src/components/blog/blog-card.tsx`, `src/components/blog/blog-filter.tsx`
- Delete: `src/components/layout/mobile-nav.tsx`、`src/components/ui/drawer.tsx`、この時点で import されていない `src/components/ui/*`（`grep` で確認してから）
- Modify: `package.json`（`vaul` を削除）

**Interfaces:**
- Consumes: `SocialLinks({ links })`（Task 2）
- Produces: `navItems = [{ href: "/blogs", label: "Blog" }] as const`

- [ ] **Step 1: ヘッダーを簡素化**

名前（`/` へのリンク）・`Blog` リンク・`ThemeToggle` を、モバイルも含め常に横一列で。コンテナ幅は本文と同じ `max-w-2xl px-5`。`MobileNav` の import を削除。

- [ ] **Step 2: フッターと /blogs を揃える**

フッター: `max-w-2xl px-5`、全 SNS（`profile.social`）、`© {year} {site.name}`。`navItems` からホームを外したので、フッターのナビは `Blog` のみ。
`/blogs`: コンテナを `max-w-2xl px-5`。`BlogCard` をカードではなく Writing と同じ 1 行リスト（サムネイルなし、日付・プラットフォーム・タイトル・Qiita はタグといいね数）に変更。`BlogFilter` のプラットフォーム絞り込みは維持。

- [ ] **Step 3: 未使用部品を削除**

Run: `grep -rn "components/ui/" src | sort -u` で使われていない ui ファイルを確認し削除。`pnpm remove vaul`。

- [ ] **Step 4: 検査**

Run: `pnpm lint && pnpm test && pnpm build && (pnpm start -p 3100 &) && node scripts/check-layout.mjs http://localhost:3100 "$SCRATCH/layout-t7"`
Expected: PASS。375px でヘッダーが 1 行に収まる

- [ ] **Step 5: Commit**

```bash
git add -A src package.json pnpm-lock.yaml
git commit -m "feat: ヘッダー・フッター・Blog 一覧を新トーンに揃え、ハンバーガーメニューを廃止"
```

---

### Task 8: ドキュメントと最終確認

**Files:**
- Create: `docs/content-update-checklist.md`
- Modify: `docs/requirements.md`, `docs/design.md`, `docs/architecture.md`, `README.md`, `src/app/page.tsx`（metadata の description）, `src/lib/site.ts`（`description`）
- Modify: `.claude/skills/add-work/SKILL.md`（`highlight` フラグに触れる場合のみ）

- [ ] **Step 1: 更新チェックリストを書く**

spec §8 のとおり 3 区分。各項目は「対象フィールド（ファイル:キー）」「今の値の要約」「確認すること」のチェックボックス:
- 肩書き・自己紹介: `profile.headline` / `summary` / `bio` / `titles` / `affiliation`（M1 表記など）/ `motto`
- Timeline: 2026-05 以降の追加、各項目の `featured` / `highlight` の見直し
- Projects: 追加作品、各 `links` の生存確認、`summary`、`highlight` の見直し、MapChat の空リンク

- [ ] **Step 2: docs を実装に合わせる**

`requirements.md`: ページ構成表を `/`・`/blogs`・`/press`（掲載 1 件以上のときのみ）に、`/works` と Bento の記述を削除し読者の優先度（名刺代わり最優先）を追記。`design.md`: 「Bento UI × Apple 風」を spec §2 のトーンに書き換え、Bento レイアウト節を新セクション構成に置換。`architecture.md` と `README.md` のディレクトリ構成・依存一覧を更新。トップの metadata description を `headline` と整合させる。

- [ ] **Step 3: 最終確認**

Run: `pnpm lint && pnpm test && pnpm build && (pnpm start -p 3100 &) && node scripts/check-layout.mjs http://localhost:3100 "$SCRATCH/layout-final"`
Expected: すべて PASS。4 通りのスクリーンショットを目視し、ダークモードでコントラスト崩れがないこと

- [ ] **Step 4: Commit と push**

```bash
git add -A docs README.md src .claude
git commit -m "docs: リニューアル後の構成に docs を更新し、文面更新チェックリストを追加"
git push -u origin claude/stoic-feynman-qko285
```
