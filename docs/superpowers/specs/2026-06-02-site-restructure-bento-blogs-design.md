# サイト再構成: 統合ホーム（Bento）+ Blogs 設計書

- **日付:** 2026-06-02
- **対象リポジトリ:** `ut42tech/hp`（Next.js 16 App Router / React 19 / Tailwind v4 / shadcn(base-ui) / motion / Biome）
- **ステータス:** 設計合意済み（実装計画は別途 writing-plans で作成）

## 1. 目的とゴール

**主目的: 自己紹介の質を上げる。** 訪問者（多くは SNS 経由・モバイル）に「自分が何者か」を最初の一画面で強く伝えることを最優先する。

サイトをシンプルな2ページ構成に再編する:

- **`/`（統合ホーム）** … 現在の Home と About を1ページに統合した、自己紹介の主役ページ。Bento UI を維持しつつ、経歴・代表作・人物像写真・最新ブログを束ねる。
- **`/blogs`（新設）** … Qiita / Zenn / note の記事を自動取得して横断表示する発信ページ。

### 成功条件

- トップに来た訪問者が、スクロールせずとも「名前・肩書き・人となり」を把握できる。
- **モバイルでも Bento の個性が崩れない**（現状は1列カードに崩壊している）。
- ブログ記事は一度書けば自動で反映され、手動更新が不要。
- Qiita/Zenn が現在0件でも、空状態が破綻しない。

### 非ゴール（スコープ外）

- 多言語化（i18n）。型定義のコメントにある next-intl 移行は後続タスク。
- CMS 導入。コンテンツは引き続き `src/content/*.ts` のプレーンデータ。
- 作品の詳細ページ（`/works/[slug]`）の存続。今回廃止する。
- デザインシステム（カラー・フォント・shadcn 構成）の刷新。既存を踏襲する。

## 2. 情報アーキテクチャ

### ルーティング（After）

| ルート | 内容 | 変更 |
|---|---|---|
| `/` | 統合された自己紹介ページ（Bento） | Home に About 由来の内容を統合 |
| `/blogs` | Qiita/Zenn/note 記事の集約一覧 | **新設** |

### 削除するルート

- `/about` → `/` に統合
- `/works`, `/works/[slug]`（一覧・詳細・OG画像）→ 代表作は `/` の Selected Works タイルへ。詳細ページは廃止し外部（Demo/GitHub）へリンク
- `/gallery` → 廃止

### ナビゲーション

単一ソース `src/lib/navigation.ts` を更新する。ヘッダー・フッター・モバイルナビはすべて `navItems` を参照しているため、1ファイルの変更で3箇所に反映される。

```ts
export const navItems = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blogs" },
] as const;
```

## 3. 統合ホーム（`/`）

### 3.1 採用方針

- **デザイン方向:** Refined Bento（現状の Bento UI の世界観を維持）。
- **デスクトップ:** 既存の `md:grid-cols-6` + `grid-flow-row-dense` をそのまま活用。
- **モバイル:** 「非対称 Bento」。現状の `grid-cols-1`（1列崩れ）を改め、**`grid-cols-2` を基準**に、タイルごとに `col-span` と `row-span`（高さ）を変えて、大小タイルのモザイク感を小画面でも成立させる。

### 3.2 タイル構成

| タイル | データ源 | デスクトップ目安 | 備考 |
|---|---|---|---|
| Hero | `profile.name/role/affiliation/image` | `col-span-6`（全幅・大） | 既存 HeroTile を踏襲 |
| About | `profile.bio` | `col-span-4 row-span-2` | 読み物。冒頭に statement |
| Tech Stack | `profile.techStack` | `col-span-2` | 既存 TechStackTile |
| Contact | `profile.social` | `col-span-2` | 既存 ContactTile |
| Journey 写真 ×3 | `profile.photos`（home 3枚） | 各 `col-span-2`（中サイズ） | **散りばめ配置**。日本語キャプション付（撮影地・文脈） |
| Selected Works | `getFeaturedWorks()` | `col-span-4` | 各カードは外部 Demo/GitHub へ。内部詳細ページは無し |
| Latest Blog | ブログ集約（最新2〜3件） | `col-span-2` | `/blogs` へ誘導。`getAllBlogPosts()` を共有（同じ ISR キャッシュ）。取得失敗/0件時は「Blog →」リンクにフォールバック。これによりホームも ISR で再生成される |
| Timeline（経歴） | `profile.timeline` | `col-span-6`（全幅） | `/about` の Timeline を移設（フィルタ機能付き） |

実際の `col-span`/`row-span` の値は実装時に視覚調整する。上表は意図を示す目安。

### 3.3 人物像写真（Journey tiles）

- home の3枚（タージ・マハル / 富士山ご来光 / アユタヤ）は「人となり」を伝える要素として**保持**する。
- Bento 内に中サイズタイルとして散りばめ、各写真にキャプション（`profile.photos[].caption` / `date`）を添える。
- モバイル（2カラム基準）では写真タイルが自然に2列に収まる。
- クリック/タップでキャプションをオーバーレイ表示する現行挙動は踏襲してよい（写真詳細のための新規モーダルは作らない）。

### 3.4 Selected Works タイル

- `components/bento/featured-tile.tsx` を Selected Works として転用。
- 各カードのリンク先を `/works/${slug}`（廃止）から、その作品の**主要外部リンク**（`work.links` の `demo` 優先、無ければ `github`）へ変更。`target="_blank" rel="noreferrer"`。
- 「View all（→ /works）」導線は削除する。

### 3.5 メタデータ

- 統合ホームの `metadata` に About 由来の説明（経歴・人物像を含む）を統合し、`alternates.canonical` は `/`。
- 既存の `app/layout.tsx` のグローバル metadata はそのまま。

## 4. Blogs ページ（`/blogs`）

### 4.1 正規化データモデル

```ts
type BlogPlatform = "qiita" | "zenn" | "note";

interface BlogPost {
  platform: BlogPlatform;
  title: string;
  url: string;
  publishedAt: string; // ISO 8601（各APIの JST を正規化）
  excerpt?: string;
  thumbnail?: string;
  tags?: string[];     // 取得可能なプラットフォームのみ
  likes?: number;      // 取得可能なプラットフォームのみ
}
```

### 4.2 取得元（2026-06-02 時点で実機検証済み）

| Platform | 採用ソース | 取得できる主なフィールド | 注意点 |
|---|---|---|---|
| **Qiita** | 公式 API v2: `GET https://qiita.com/api/v2/users/{username}/items?per_page=100` | title, url, created_at, tags[].name, likes_count, body（→抜粋生成） | 認証不要（GET）・CORS `*`・レート 60/分(未認証)。**サムネ無し** → ブランド色カードで代替。`per_page` 最大100。**不正な Bearer は 401**（トークンを送るなら有効なもの、無ければ Authorization ヘッダ自体を付けない） |
| **Zenn** | 公式 RSS: `https://zenn.dev/{username}/feed` | title, link, pubDate, description（抜粋）, enclosure（OG画像URL=サムネ） | RSS 2.0。**最新20件まで**。`<enclosure>` の type/length 属性は壊れているが URL 自体は有効な Cloudinary OG画像。タグは無し |
| **note** | 公式 RSS: `https://note.com/{username}/rss` | title, link, pubDate, description（抜粋）, media:thumbnail（サムネ） | RSS 2.0。タグは無し。正しいパスは `/{username}/rss`（`/info/n/...` は404） |

- Qiita のみ JSON、Zenn/note は XML(RSS)。**`fast-xml-parser` を1つ追加**し、Zenn/note の RSS を共通パーサで処理する。
- タグは Qiita のみ、いいね数は Qiita（likes_count）のみ確実に取得可能。UI では任意表示。
- 不採用案のメモ: Zenn/note には非公式 JSON API（`zenn.dev/api/articles`、`note.com/api/v2/creators/...`）も存在し、いいね数や全件取得が可能だが、**非公式で破綻リスクがあるため公式 RSS を優先**する。将来いいね数等が欲しくなれば差し替え可能。

### 4.3 取得・キャッシュ・耐障害

- `src/lib/blog/` にプラットフォーム別フェッチャ（`qiita.ts` / `zenn.ts` / `note.ts`）と集約関数（`index.ts` の `getAllBlogPosts()`）を実装。
- 各フェッチャは正規化済み `BlogPost[]` を返す。
- 取得は Server Component から `fetch(url, { next: { revalidate: 3600 } })` を使用し、**ISR で1時間ごとに再生成**。外部APIをサーバー側で叩くため CORS の影響を受けない。
- 集約は `Promise.allSettled` で並行実行。**1プラットフォームが失敗しても他は表示**（rejected は空配列扱いにしてログ）。
- 全件を `publishedAt` 降順でマージ・ソート。

### 4.4 設定（handle）

```ts
// src/lib/blog/config.ts
export const blogHandles = {
  qiita: "ut42tech",
  zenn: "ut42tech",
  note: "ut42tech",
} as const;
```

- handle はこの1ファイルで管理。現時点で Qiita/Zenn は0件、note は要確認。handle が異なる場合はここを差し替えるだけでよい。

### 4.5 UI

- ページヘッダー: タイトル「Blog」+ サブタイトル（「Qiita・Zenn・note の記事をまとめています」）。
- **フィルタ:** `All / Qiita / Zenn / note`。既存の `components/ui/tabs.tsx` を流用。
- **カードグリッド:** 新着順。各カードは外部記事へ `target="_blank" rel="noreferrer"`。
  - サムネがあれば表示、無ければ（Qiita）**プラットフォームのブランド色 + ロゴ**のプレースホルダ。
  - プラットフォームバッジ（ブランド色）。アイコンは既存の `@icons-pack/react-simple-icons` を使用（Qiita/Zenn/note が無い場合はテキストバッジにフォールバック）。
  - タイトル・日付・抜粋（line-clamp）。タグ/いいねは取得できた場合のみ。
- **空状態:**
  - 全0件 → 「記事はまだありません」＋各プラットフォームのプロフィールリンク。
  - 特定プラットフォームのみ0件 → そのタブは空メッセージ。
- **メタデータ:** `/blogs` 専用 title「Blog」/ description / `alternates.canonical = "/blogs"`。

## 5. コンテンツ層の変更

### `src/content/profile.ts`

- `photos`（home の3枚）は**保持**（Journey tiles で使用）。
- bio / techStack / social / timeline はそのまま活用。

### `src/content/types.ts`

- `PhotoEntry` と `Profile.photos` は**保持**（home 写真の Journey tiles で引き続き使用。ギャラリー専用の型は存在しないため削除対象なし）。
- Works 系型（`Work` / `WorkCategory` / `WorkLink` / `LinkKind`）は Selected Works で使うため保持。

### `src/content/works.ts`

- `works` データと `getFeaturedWorks()` は保持。
- 詳細ページ廃止で未使用になる `getWorkBySlug` / `getWorksByCategory` / `workCategories` を削除。

### `src/content/gallery.ts`

- 削除。

## 6. ファイル変更一覧

### 削除

- ルート: `src/app/about/`, `src/app/works/`（`page.tsx`, `[slug]/page.tsx`, `[slug]/opengraph-image.tsx`）, `src/app/gallery/`
- コンポーネント: `src/components/works/`（work-card, works-grid, category-filter, work-detail）, `src/components/gallery/`
- `src/components/shared/under-construction.tsx`（参照元の works/gallery ページ削除で未使用化）
- コンテンツ: `src/content/gallery.ts`
- 画像: `public/photos/placeholder-*.svg`（ギャラリー用の仮画像）
- **保持（削除しない）:** `src/components/bento/photo-tile.tsx`, `public/photos/home/{1,2,3}.jpg`

### 修正

- `src/lib/navigation.ts` … `Home ・ Blogs` の2項目に
- `src/app/page.tsx` … 写真タイルの扱いを Journey 化、Timeline / Selected Works / Latest Blog を追加し Bento 再構成。モバイル2カラム基準のスパン設計
- `src/components/bento/featured-tile.tsx` … Selected Works 化。リンクを外部（Demo/GitHub）へ、View all 導線を削除
- `src/components/about/timeline.tsx` … ホームで使用するため `src/components/home/`（または適切な場所）へ移設
- `src/app/sitemap.ts` … `/about` `/works/*` を除去し、`/` と `/blogs` を列挙（works 依存の import も削除）
- 統合ホームの `metadata` … About 由来の説明を統合

### 追加

- `src/app/blogs/page.tsx` … Blogs ページ（Server Component, ISR）
- `src/lib/blog/config.ts` … handle 設定
- `src/lib/blog/types.ts` … `BlogPost` / `BlogPlatform`
- `src/lib/blog/qiita.ts`, `zenn.ts`, `note.ts` … 各フェッチャ
- `src/lib/blog/index.ts` … `getAllBlogPosts()` 集約
- Blogs 用 UI コンポーネント（カード・フィルタ）`src/components/blog/`

## 7. 依存関係

- `fast-xml-parser` を追加（Zenn/note の RSS パース用）。pnpm でインストール。

## 8. SEO / メタデータ

- `sitemap.ts` を `/` と `/blogs` のみに更新（Works 依存を除去）。
- `robots.ts` は変更不要（sitemap の場所のみ示す）。
- 統合ホーム・Blogs それぞれに `canonical` を設定。

## 9. ローンチ運用メモ

- `src/lib/site.ts` の `underConstruction` は現在 `true`。本再構成とは独立に、公開準備が整った段階で `false` に切り替える（フラグ自体は残す）。

## 10. リスクと留意点

- **handle が現状0件:** Qiita/Zenn は `ut42tech` で0件。設計は空状態を許容するが、公開時に実際の handle / 投稿状況を確認すること。
- **非公式エンドポイントを避けた選択:** Zenn/note は公式 RSS を採用。将来いいね数や全件が必要なら非公式 JSON API への差し替えを検討（破綻リスクとのトレードオフ）。
- **RSS の件数上限:** Zenn RSS は最新20件まで。20件超の全件表示が必要になった場合は API 併用を検討。
- **Qiita のサムネ欠如:** ブランド色プレースホルダで対応。OG画像のスクレイピングは行わない（複雑さ回避）。
- **Bento のモバイル調整:** 2カラム基準のスパン設計は実機での視覚確認が必要。

## 11. 検証方針

- `pnpm lint`（Biome）/ `pnpm build` が通ること。
- `/` と `/blogs` が描画され、削除したルートが 404 になること。
- ブログ取得は、各プラットフォーム handle を一時的に既知のアクティブユーザに差し替えて実データで描画確認（空状態・耐障害は0件handle/不正handleで確認）。
- モバイル幅（〜375px）で Bento が2カラムのモザイクとして成立していること。
