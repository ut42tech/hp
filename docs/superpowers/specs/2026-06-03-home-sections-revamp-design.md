# ホーム再構成: Keywords / Projects / Press / Hero リニューアル 設計書

- **日付:** 2026-06-03
- **対象リポジトリ:** `ut42tech/hp`（Next.js 16 App Router / React 19 / Tailwind v4 / shadcn(base-ui) / motion / Biome）
- **ステータス:** 設計合意済み（ビジュアルコンパニオンで全項目を視覚検証済み。実装計画は別途 writing-plans で作成）
- **前提:** [2026-06-02 サイト再構成（統合Bento + Blogs）](./2026-06-02-site-restructure-bento-blogs-design.md) の続き。本設計はその上にホームのセクションを刷新する。

## 1. 目的とゴール

ホーム（`/`）の自己紹介の質と個性をさらに高める。具体的には4つのセクション刷新と、それに伴う配置の再構成を行う。

1. **About → Keywords**：人物像が一目で伝わる「キーワードのプール」へ。中心放射＋rounded-full バッジ。
2. **Selected Works → Projects**：作品を全件、Timeline 直上のフルセクションで表示。GitHub／デプロイ先リンクを各カードに。
3. **Press（新設）**：自分が取り上げられた Web 記事の一覧。ホームにタイル、`/press` に一覧ページ。
4. **Hero 作り直し**：会話調で自然に。特にモバイルの体験を改善。

### 成功条件

- モバイル（SNS 流入）で、ヒーローを見た瞬間に「名前・肩書き・人となり」が自然に伝わる。
- Keywords は **語が重ならず**、レスポンシブに破綻しない。落ち着いたクリーンな見た目。
- Projects は各作品の **GitHub / デプロイ先**へ最短で飛べる。
- Press は手動キュレーションで、エントリ 0 件でも破綻しない。

### 非ゴール（スコープ外）

- 多言語化（i18n）、CMS 導入、デザインシステム（カラー・フォント）の刷新。既存踏襲。
- `/works` 系・作品詳細ページの復活（前回廃止済み。Projects は外部リンクのみ）。
- Projects 専用一覧ページ（`/projects`）は作らない。全件をホームに置くため不要。

## 2. ホーム情報アーキテクチャ（配置）

Bento グリッド（`md:grid-cols-6` / `grid-flow-row-dense`）を踏襲しつつ、下記に再構成する。

### Desktop（6カラム）

| 行 | 配置 |
|---|---|
| 1–2 | **Hero**（span6, row-span-2） |
| 3–4 | **Keywords**（span4, row-span-2／左） ・ **Tech Stack**（span2／右上） ・ **Contact**（span2／右下＝Tech Stack の真下） |
| 5 | **Photo ×3**（各 span2、1行3枚横並び：長崎ハッカソン / タージ・マハル / アユタヤ） |
| 6 | **Press**（span4＝旧 Selected Works 枠） ・ **Blog**（span2） |
| 7 | **Projects（全件）**（span6 フル幅・新セクション） |
| 8 | **Timeline**（span6 フル幅） |

### Mobile（2カラム → フル幅）

縦積み順：Hero → Keywords → Tech Stack → Contact → Photo（長崎ハッカソン, 全幅）→ Photo（タージ）+ Photo（アユタヤ, 半幅2列）→ Press → Blog → **Projects（全件・縦）** → Timeline。

### 変更点サマリ

- **Press タイルが旧 Selected Works の枠（Blog の隣）に入る。**
- **Projects は Bento の小タイルをやめ、Timeline 直上のフル幅セクションで全件表示。**
- About タイルは廃止し、同じ枠を Keywords が引き継ぐ。

## 3. 各セクション詳細

### 3.1 Hero（`src/components/bento/hero-tile.tsx` 全面改修）

会話調・人柄重視（モックアップ B 系）。

**構成（上から）:**
- アバター（既存 `profile.image`、円形）＋ 挨拶「**Hello 👋**」＋ 名前「**I'm Takuya Uehara**」（英語表記）
- 肩書きピル「**学生エンジニア / フルスタック**」（accent カラーの rounded-full バッジ）
- 所属：「**M1 Student · Nagasaki University**」＋ 改行して「**@ Setozaki Lab**」（`https://www.setozakilab.com` へのリンク・チェーン(link)アイコン付き・`target="_blank" rel="noreferrer"`）
- モットー：「**デザインとテクノロジーで、最高のユーザ体験を。**」（左ボーダー accent の引用風）

**やらないこと:** ソーシャルリンクはヒーローに置かない（Contact タイルにある）。長い自己紹介文も置かない。

**レイアウト:**
- モバイル：アバター＋挨拶＋名前を上部の横並びヘッダー、その下に肩書き・所属・モットーを縦に。左揃え。
- デスクトップ：左にアバター＋名前ブロック、右にモットー／所属を横並び展開（同要素の再配置）。

### 3.2 Keywords（`src/components/bento/keywords-tile.tsx` 新規・client component）

About を置き換える「キーワードのプール」。**白いクリーンなカード × rounded-full バッジ × 中心放射**。

**見た目:**
- 重要な語ほど大きく中心寄り、軽い語ほど小さく外側・淡い色。一部の語を accent（緑）バッジに。
- 背景は通常のカード（白／ダークはテーマ反転）。**グロー・回転は無し**（過去案で不採用）。

**配置アルゴリズム（重なり回避）:**
- **`d3-force`** を用いる：`forceCollide`（各ピルの実寸を衝突半径に）で**絶対に重ならない**配置、`forceRadial`（重要度→目標半径、重要語ほど中心）＋弱い `forceManyBody` で「中心放射」を表現。中心の主役ピルは中央にピン留め（`fx/fy` 固定）。
- シミュレーションは一度収束させて座標を確定（毎フレーム計算しない）。
- **レスポンシブ:** `ResizeObserver` でコンテナ幅変化時に半径/フォントスケールを調整して再計算。狭い画面では語数を間引く／半径を縮める。

**モーション:**
- 算出座標に `motion`（既存依存）でピルを配置。各ピルに**ごく弱い上下ドリフト**を CSS `@keyframes`（translate のみ・回転なし、振幅 < 6px、語ごとに duration/delay を散らす）で重ねる。衝突半径にドリフト分の余白を見込む。
- ホバー：そのピルだけ拡大＋緑に反転（カーソル追従の視差は**無し**）。
- `prefers-reduced-motion: reduce` でドリフト停止。

**データ:** `src/content/keywords.ts`（後述）。ワードは README・note 記事から persona 寄りに採用。

### 3.3 Projects（フル幅セクション・新規 `src/components/projects/`）

旧 Selected Works タイルを廃し、**Timeline 直上にフル幅セクション**として `category ∈ { project, oss, research }` を**全件**グリッド表示。

**カード（`project-card.tsx`）:**
- サムネイル（`work.thumbnail`、`aspect-video`）。**サムネは各 Project 用に用意**。無い場合は従来のカテゴリアイコンのプレースホルダ。
- サムネ右上に**アイコンリンクを重ねる（モックアップ B 採用）**：
  - **GitHub アイコン**（`@icons-pack/react-simple-icons` の `SiGithub`）→ `work.links` の `kind:"github"`。
  - **チェーン(link)アイコン**（lucide `Link`）→ デプロイ先＝`kind:"demo"`。
  - リンクが片方しか無い作品はそのアイコンのみ表示（崩れない）。両方無ければアイコン無し。
  - 各アイコンは個別の `<a target="_blank" rel="noreferrer">`。**カード全体はリンクにしない**（入れ子アンカー回避）。`aria-label`（例：「GitHub リポジトリ」「デプロイ先」）を付与。
- 本文：タイトル＋サマリ（line-clamp）。
- グリッド：`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`。並び順は日付降順（任意で featured 優先）。

**データ取得:** `src/content/works.ts` に `getProjects()`（`category ∈ {project,oss,research}` を抽出・ソート）を追加。`getFeaturedWorks()` は不要になれば削除。

### 3.4 Press（タイル ＋ `/press` 一覧ページ・新規）

自分が取り上げられた Web 記事を**手動キュレーション**（外部 API なし）。

**ホームの Press タイル（`src/components/bento/press-teaser-tile.tsx`）:**
- 旧 Selected Works 枠（Blog の隣）。最新3件を媒体名（accent）＋タイトル＋日付で列挙。「View all → `/press`」。
- 0 件時は「準備中」フォールバック（Blog タイルに倣う）。

**一覧ページ（`src/app/press/page.tsx`）:** `/blogs` と同じ作り。
- ヘッダー（「Press」＋サブタイトル「メディアで取り上げていただいた記事をまとめています。」）。
- カードグリッド（`press-card.tsx`、モックアップ A＝サムネ画像つき採用）：サムネ（無ければアイコン＋媒体名のプレースホルダ）／種別バッジ（Interview / Award / Event / Feature 等）／タイトル／媒体名・日付／抜粋。外部記事へ `target="_blank" rel="noreferrer"`。
- 種別フィルタは**初期は無し**（データ構造は対応可能にしておき、エントリ増加時に追加）。
- メタデータ：title「Press」/ description / `alternates.canonical = "/press"`。
- 空状態：「記事はまだありません」。

## 4. ナビゲーション・ルーティング

- `src/lib/navigation.ts` を更新：

```ts
export const navItems = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blog" },   // 「Blogs」→「Blog」に統一（ページ見出しと一致）
  { href: "/press", label: "Press" },  // 新設
] as const;
```

- **命名規約（合意）:** ナビ／セクション見出し＝単数の“欄名”（**Blog / Press**）。ルート（URL）＝複数のコレクション（`/blogs` `/press`）。項目集合のラベルは複数（**Projects / Keywords**）。`Press` は不可算名詞のため複数形は作らない。
- `src/app/sitemap.ts`：`/press` を追加（`/` `/blogs` `/press` の3つ）。

## 5. データモデル / コンテンツ層

### `src/content/types.ts`

```ts
// Keywords
export interface Keyword {
  label: string;
  /** 重要度＝大きさ・中心への寄り。xl(主役) > lg > md > sm */
  size: "xl" | "lg" | "md" | "sm";
  /** true で accent（緑）バッジ */
  accent?: boolean;
}

// Press
export type PressType = "interview" | "feature" | "award" | "event" | "media";
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
```

`Profile` を更新：
- `role` の値を「学生エンジニア / フルスタック」に。
- `affiliation` を「M1 Student · Nagasaki University」に。
- 追加 `lab: { name: string; url: string }`（"Setozaki Lab." / `https://www.setozakilab.com`）。
- 追加 `motto: string`（"デザインとテクノロジーで、最高のユーザ体験を。"）。
- `bio`（長文4段落）はホームから引退（§8 未確定事項）。

### `src/content/keywords.ts`（新規・下書き）

README＋note 記事から採用した persona 寄りのキーワード。**最終リストは実装前に確定**（特に中心ワード）。

```
xl(主役・中心): Creative Engineer ※候補: ものづくり / Design & Dev（要確定）
lg: ものづくり, Generative AI, 弓道, 3DCG, Hackathons, Curiosity, Visual Thinker, HCI
md: Community, Metaverse, WebXR, Research, UI/UX, Spatial Computing, 茶道, Photography, Full-stack
sm: Motion Graphics, 映画・アニメ, 一人旅, Sauna, Mentor, OSS, Homelab, Apple, 恩送り, 長崎 Nagasaki
```

### `src/content/press.ts`（新規）

初期エントリは実在のもの。確実なのは「長崎のWA!（長崎市）インタビュー掲載（2025-11, interview）」。他（学長賞の大学広報、長崎ハッカソン2025 のレポート 等）は URL を確認して追加（§8）。

### `src/content/works.ts`

- `getProjects()` を追加（`category ∈ {project,oss,research}`、日付降順）。
- 各 Project に `thumbnail` を付与（画像を用意）。`links` に `github` / `demo` を整備。README にある **tecnova-platform** 等、未登録の作品の追加は任意（§8）。
- `getFeaturedWorks()` が未使用化したら削除。

## 6. 依存追加

- **`d3-force`**（Keywords の衝突回避レイアウト）＋ `@types/d3-force`（dev）。pnpm で追加。
- `motion`・`lucide-react`・`@icons-pack/react-simple-icons` は既存を流用（チェーン＝lucide `Link`、GitHub＝`SiGithub`）。

## 7. ファイル変更一覧

### 新規
- `src/components/bento/keywords-tile.tsx`（client）
- `src/components/bento/press-teaser-tile.tsx`
- `src/components/projects/projects-section.tsx`、`src/components/projects/project-card.tsx`
- `src/components/press/press-card.tsx`（必要なら `press-list.tsx`）
- `src/app/press/page.tsx`（＋必要なら `loading.tsx`）
- `src/content/keywords.ts`、`src/content/press.ts`

### 修正
- `src/components/bento/hero-tile.tsx`（全面改修）
- `src/content/types.ts`（Keyword / PressType / PressItem 追加、Profile 更新）
- `src/content/profile.ts`（role / affiliation / lab / motto、bio 引退）
- `src/content/works.ts`（`getProjects()`、thumbnail / links 整備）
- `src/app/page.tsx`（Bento 再構成：Keywords・Press タイル・Projects フルセクション）
- `src/lib/navigation.ts`（Blog へ統一・Press 追加）
- `src/app/sitemap.ts`（/press 追加）
- `src/app/page.tsx` の `metadata`（About 由来文言の調整）

### 削除
- `src/components/bento/about-tile.tsx`（Keywords が置換）
- `src/components/bento/selected-works-tile.tsx`（Projects セクションが置換）

## 8. アクセシビリティ / モーション / レスポンシブ

- Keywords のピルは実テキスト（SEO・読み上げ可）。装飾的な浮遊・ホバーのみ視覚効果。`prefers-reduced-motion` で停止。
- Projects のアイコンリンクに `aria-label`。フォーカスリング・キーボード操作可。
- Press / Projects グリッドは 1 / 2 / 3 カラムのレスポンシブ。
- Keywords は狭幅で再レイアウト（半径縮小・語間引き）。最小幅でも重ならないことを担保。

## 9. 実装メモ（Next.js 16）

- 本リポジトリの Next.js は**通常の知識と異なる破壊的変更**があり得る。`AGENTS.md` の指示どおり、実装前に `node_modules/next/dist/docs/` の該当ガイド（App Router / client components / metadata / dynamic routes）を必ず参照する。
- Keywords タイルは `"use client"`（d3-force・ResizeObserver・motion・hover）。ホームの他要素は Server Component のまま。
- Press は静的コンテンツのためフェッチ不要。`/press` は静的生成。ホームの revalidate は Blog 取得のため現状維持。

## 10. 未確定事項（実装前に確認／既定値あり）

1. **`profile.bio`（長文4段落）の扱い** — 既定：ホームから引退（人物像＝Keywords、経歴＝Timeline がカバー）。データ自体を残すか削除するかは要確認。
2. **Keywords の中心ワード／最終リスト** — 既定：中心は仮で「Creative Engineer」。候補「ものづくり」「Design & Dev」。最終語リストを実装前にテキスト確定。
3. **Press の種別フィルタ** — 既定：初期は無し。
4. **Projects の対象作品とサムネ画像** — `category ∈ {project,oss,research}` を全件。実サムネ画像の用意、tecnova-platform 等の追加可否を確認。
5. **Press の実エントリ** — 「長崎のWA!」以外の記事 URL を収集して追加。
