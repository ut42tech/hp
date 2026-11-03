# モバイルファースト・リニューアル 設計書

- **日付:** 2026-11-03
- **対象リポジトリ:** `ut42tech/hp`（Next.js 16 App Router / React 19 / Tailwind v4 / shadcn(base-ui) / motion / Biome / Vitest）
- **ステータス:** 設計合意済み（実装計画は別途 writing-plans で作成）
- **前提:** 2026-06-02 / 2026-06-03 の Bento 系設計を **置き換える**。Bento グリッドは廃止する。

## 1. 目的とゴール

情報が古く、開発も中途半端（Press が空、docs と実装の食い違い等）になっているため、
**デザインと構成をモバイルファーストで一新**する。技術スタックと `src/content/` のデータは使い回す。

### 読者と優先度

最優先は **名刺代わり（SNS・名刺から流入し、スマホで開く人）**。
数秒で「誰で、何をしている人か」が伝わり、そこから SNS へ飛べることを最重要とする。
就活・研究・技術コミュニティ向けの情報は、同じページの下方で深掘りできれば良い。

### 成功条件

- 幅 375px で、**スクロールせずに** 名前・肩書き・所属・主要 SNS が見える。
- どの幅でも横スクロールが発生しない（意図した横スワイプ領域を除く）。
- 1 ページの縦スクロールで、ハイライト → 自己紹介 → 制作物 → スキル → 経歴 → 発信 に辿り着ける。
- 掲載記事（Press）が 0 件でも、空のセクションやリンク切れが一切表示されない。
- `pnpm lint` / `pnpm test` / `pnpm build` が通る。

### 非ゴール（スコープ外）

- **文面の更新**（肩書き・自己紹介・Timeline・Projects の中身）。デザインと分離し、後で
  `docs/content-update-checklist.md` に沿って反映する。本リニューアルでは型の追加と、
  新フィールドへの暫定値投入（既存文面からの転記・抜粋）のみ行う。
- 多言語化、CMS 導入、カラー・フォントの変更、技術スタックの変更。
- `/works` 系ページ、Projects 専用ページの新設。

## 2. デザイントーン

- 既存のカラートークン（モノクロ基調 + GitHub Green アクセント 1 点）、LINE Seed JP、ダークモードは **継続**。
- **カード（枠・背景付きの箱）を原則使わない。** 情報の優先度は文字サイズ・太さ・余白・色の濃淡で表す。
  例外はハイライトのスワイプカードのみ。
- 本文幅はモバイルで全幅（左右 `px-5` 前後）、`md` 以上で `max-w-2xl` 前後の中央寄せ。
- セクション見出しは小さめの英字ラベル（例: `Projects`）＋細い区切り線。共通コンポーネントで統一する。

## 3. ページ構成

### 3.1 ホーム `/`（1 カラム縦スクロール）

| # | セクション | 内容 |
|---|---|---|
| 1 | **Intro**（ファーストビュー） | アバター、名前（日本語＋英語）、`headline` 1 行、所属（M1 / 長崎大学 / 瀬戸崎研へのリンク）、モットー 1 行。その下に主要 SNS ボタン（`primary: true` のもの、4 個程度）を横並び。 |
| 2 | **Highlights** | 受賞・代表作を最大 3 件、横スワイプのカードで表示（CSS scroll-snap、JS なし）。Work / Timeline の `highlight: true` から生成。0 件ならセクションごと非表示。 |
| 3 | **About** | `summary`（2〜3 文）。「続きを読む」（`<details>`）で既存 `bio` を展開。活動・役職（`titles`）を箇条書き。写真 3 枚を横スクロールの小さな写真帯で表示。 |
| 4 | **Projects** | 1 作品 1 行のリスト。作品名・1 行 summary・タグ・リンク（GitHub / Demo 等）。`getProjects()` の結果を全件。 |
| 5 | **Skills** | `techStack` をカテゴリ別（Languages / Web / Infra / Creative / Academic）の小チップで列挙。 |
| 6 | **Timeline** | 既定では `featured: true` の項目（6 件程度）を表示。「すべて見る」ボタン（client component の toggle、`aria-expanded` 付き）で全件に切り替え。`life` カテゴリは全件表示時のみ。 |
| 7 | **Writing** | Blog 最新 3 件＋ `/blogs` へのリンク。Press が 1 件以上あるときのみ、同セクション内に Press 一覧（最新 3 件）と `/press` へのリンクを追加。 |
| 8 | **Footer** | 全 SNS リンク、© 表記。 |

### 3.2 その他ページ・共通 UI

- **`/blogs`**：機能は維持し、新トーン（カードを減らしたリスト表示）に揃える。
- **`/press`**：`hasPress()` が false のとき `notFound()`。サイトマップ・ナビにも 1 件以上のときのみ掲載。
- **ヘッダー**：名前（ホームへのリンク）、`Blog` リンク、テーマ切替のみ。ハンバーガーメニューは廃止。
- **OGP 画像・metadata**：既存を維持。description は `headline` に合わせて調整する。

## 4. データモデル（`src/content/types.ts`）

追加・変更のみ記す。既存フィールドは特記なき限り維持。

```ts
interface TimelineEntry {
  // 既存...
  highlight?: boolean; // Highlights に載せる
  featured?: boolean;  // Timeline の折りたたみ時にも表示
}

interface Work {
  // 既存...
  highlight?: boolean; // Highlights に載せる
}

interface SocialLink {
  // 既存...
  primary?: boolean; // Intro に表示
}

type TechCategory = "languages" | "web" | "infra" | "creative" | "academic";

interface Profile {
  // 既存...
  headline: string;   // Intro の肩書き 1 行（新規）
  summary: string[];  // About の短い自己紹介 2〜3 文（新規）
  bio?: string[];     // 「続きを読む」の本文（既存を流用）
  techStack: Record<TechCategory, string[]>; // カテゴリ別に変更
}
```

削除: `Keyword` 型、`roleTags`、`mottoEn`（Hero 演出専用だったため）。
`roleTags` の内容は `headline` に統合する。

### 選択関数（純粋関数・Vitest でテスト）

| 関数 | 置き場所 | 振る舞い |
|---|---|---|
| `getHighlights(n = 3)` | `src/content/highlights.ts` | Work と Timeline の `highlight: true` を共通の表示型 `Highlight`（title / date / description / href? / kind）に変換し、日付降順で最大 n 件返す。 |
| `getFeaturedTimeline()` | `src/content/timeline.ts` | `featured: true` の項目を日付降順で返す。 |
| `getTimeline({ includeLife })` | 同上 | 全件（`includeLife: false` なら `life` を除外）を日付降順で返す。 |
| `hasPress()` | `src/content/press.ts` | 掲載が 1 件以上あるか。 |
| `getPrimarySocial()` | `src/content/profile.ts` 付近 | `primary: true` の SNS を定義順で返す。 |

既存の `getProjects()` / `getLatestPress()` / `getLatestBlogPosts()` はそのまま使う。

暫定値: `highlight` / `featured` / `primary` / `headline` / `summary` は既存データから仮に設定し、
文面の最終確定はチェックリストで行う。

## 5. コンポーネント構成

### 新規（`src/components/home/`）

| ファイル | 役割 | 種別 |
|---|---|---|
| `section.tsx` | 見出しラベル＋区切り線＋余白の共通ラッパ（`id` でアンカー可能） | Server |
| `intro.tsx` | セクション 1 | Server |
| `highlights.tsx` | セクション 2（scroll-snap 横スワイプ） | Server |
| `about.tsx` | セクション 3（`<details>` で bio 展開、写真帯） | Server |
| `project-list.tsx` | セクション 4 | Server |
| `skills.tsx` | セクション 5 | Server |
| `timeline.tsx` | セクション 6（既存 `components/home/timeline.tsx` を作り直し、展開トグルを含む） | Client（展開部のみ） |
| `writing.tsx` | セクション 7 | Server |

モーション: `components/motion/fade-in.tsx` を流用し、各セクション入場時の軽いフェードのみ。
`prefers-reduced-motion` で無効化。

### 削除

- `src/components/bento/` 一式（hero / keywords / tech-stack / contact / photo / blog-teaser / press-teaser / marquee / block-reveal / keywords-layout とテスト）
- `src/components/motion/bento-tile-motion.tsx`
- `src/components/projects/` 一式
- `src/content/keywords.ts`
- `src/components/layout/mobile-nav.tsx`、使われなくなった `ui/drawer.tsx` 等の shadcn 部品
- 依存: `matter-js`、`@types/matter-js`、`vaul`（使用箇所がなくなった場合）

### 更新

- `src/app/page.tsx`：新セクションを順に並べるだけの薄い構成に。
- `src/app/press/page.tsx`、`src/app/sitemap.ts`：Press 0 件対応。
- `src/components/layout/header.tsx` / `footer.tsx`、`src/lib/navigation.ts`。
- `src/app/blogs/page.tsx` と `components/blog/*`：新トーンに揃える。

## 6. エラー・境界ケース

- Highlights / Press / Blog が 0 件 → 該当セクション（または該当ブロック）を描画しない。
- Blog 取得失敗（外部 RSS / Qiita API）→ 既存の挙動どおり空配列扱いで Writing の Blog 部分を非表示、`/blogs` へのリンクは残す。
- 画像なし（`profile.image` 未設定）→ Intro はイニシャルのプレースホルダで表示。
- 長い作品名・肩書き → 折り返し可能にし、`truncate` で情報を欠落させない。

## 7. テスト・検証

- **ユニット（Vitest）**：第 4 章の選択関数すべて（件数上限、日付降順、フラグによる絞り込み、`life` 除外、0 件時）。既存 `works.test.ts` / `utils.test.ts` は維持。
- **静的チェック**：`pnpm lint`、`pnpm build`（型チェック含む）。
- **見た目（Playwright、手動実行スクリプト）**：幅 375px / 1280px、ライト / ダークでスクリーンショットを取得し、
  - 375px でファーストビュー内に名前・headline・所属・SNS ボタンが収まる
  - `document.documentElement.scrollWidth <= clientWidth`（横スクロールなし）
  を確認する。

## 8. ドキュメント

- `docs/content-update-checklist.md` を新規作成。肩書き・自己紹介（`headline` / `summary` / `bio` / `titles` / `affiliation`）、
  Timeline（追加・`featured` / `highlight` の見直し）、Projects（追加・リンク確認・`highlight`）ごとに確認項目を列挙する。
- `docs/requirements.md` / `docs/design.md` / `docs/architecture.md` / `README.md` を本設計に合わせて更新（Bento・`/works` の記述を除去）。
