# Architecture — Portfolio Site

本ドキュメントはポートフォリオサイトの技術構成と設計判断を記述する。要件は [requirements.md](./requirements.md)、デザイン方針は [design.md](./design.md)、プロフィール文面の一次情報は [profile.md](./profile.md) を参照。

記述は**現在の実装に一致させる**方針で維持する。「将来やる予定」は必ずその旨を明記して分ける。

## 技術スタック

| カテゴリ | 採用 | バージョン | 補足 |
|---|---|---|---|
| フレームワーク | **Next.js** | 16.2.3 | App Router / Turbopack(デフォルト) |
| ランタイム | **React** | 19.2.4 | Server Components 中心。`"use client"` は 15 ファイルのみ |
| 言語 | **TypeScript** | 5.x | `strict: true`、`moduleResolution: "bundler"`、エイリアスは `@/*` の 1 つ |
| スタイリング | **Tailwind CSS** | v4 | 設定ファイルは持たず `globals.css` の `@theme` が唯一の設定源 |
| UI プリミティブ | **shadcn/ui** | `base-nova` preset | 導入済みは `badge` / `button` / `card` / `drawer` / `separator` / `tooltip` の 6 つ。内部は **`@base-ui/react`**(Radix ではない)。`drawer` のみ `vaul` ベース |
| アイコン | **lucide-react** + **@icons-pack/react-simple-icons** | 最新 | ブランドロゴは simple-icons、汎用 UI アイコンは lucide の使い分け |
| アニメーション | **motion** | 12.x | 旧 framer-motion、import は `motion/react` |
| 物理演算 | **matter-js** | 0.20.x | Keywords タイルのみ。`useEffect` 内で動的 import |
| テーマ切替 | **next-themes** | 0.4.x | `class` 戦略、`suppressHydrationWarning` 必須 |
| ヘッドレス CMS | **microCMS** | — | `press` / `projects` / `works` / `timeline` の 4 API。SDK は使わず `fetch` を直に叩く |
| XML パーサ | **fast-xml-parser** | 5.x | Zenn / note の RSS 解析 |
| 多言語化 | **(未導入)** | — | 現状は日本語のみ。将来 **next-intl** で導入予定 |
| フォント | **LINE Seed JP** | — | `next/font/google` 経由、`--font-sans` 変数で接続 |
| Lint / Format | **Biome** | 2.2.0 | `noUnknownAtRules: off`(Tailwind v4 用)、`organizeImports` は assist で on |
| テスト | **Vitest** | 4.x | `environment: "node"`、`src/**/*.test.ts` のみ(`.tsx` は対象外) |
| パッケージマネージャ | **pnpm** | 11.18.0 | `packageManager` フィールドで固定。`pnpm-workspace.yaml` は `allowBuilds` 専用でモノレポではない |
| デプロイ | **Vercel** | — | 標準ビルド(`output: 'export'` は使わない) |

### npm スクリプト

| スクリプト | 実体 |
|---|---|
| `pnpm dev` | `next dev` |
| `pnpm build` | `next build` |
| `pnpm start` | `next start` |
| `pnpm lint` | `biome check` |
| `pnpm format` | `biome format --write` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | `vitest run` |

`--turbopack` フラグは付けていない(Next.js 16 では既定で Turbopack のため不要)。

### 環境変数

`.env.example` に定義されている **2 つだけ**。`NEXT_PUBLIC_*` は一切使っていない。

```
MICROCMS_SERVICE_DOMAIN=
MICROCMS_API_KEY=
```

どちらか欠けると `getMicroCMSConfig()` が即 throw するため、**未設定だとビルドが失敗する**(フォールバックのダミーデータは持たない)。ローカルは `.env` / `.env.local`、本番は Vercel の環境変数に設定する。

### `next.config.ts`

設定しているのは外部画像ホストの許可のみ。

```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.microcms-assets.io" },
    ],
  },
};
```

許可しているホストは **`images.microcms-assets.io` の 1 つだけ**。この制約が、後述するブログカードのサムネイルで `next/image` ではなく `<img>` を使っている理由になっている。i18n / experimental / cacheComponents などは設定していない。

## Next.js 16 の重要な変更点

Next.js 16 には訓練データ以後の破壊的変更がいくつかある。実装時に特に注意すべき点を列挙する。ソースは全てローカルの `node_modules/next/dist/docs/` を直接参照。

### 1. `params` / `searchParams` が Promise 化

- Server Component で受け取る `params` と `searchParams` は `Promise<...>` 型で、使用前に必ず `await` する
- **現状このサイトに動的ルートは 1 つも無い**ため、この規約が効く箇所は今のところ存在しない。動的ルートを追加する際に必ず思い出すこと

### 2. `PageProps<'...'>` / `LayoutProps<'...'>` 型ヘルパー

- ルートパスから params の型を推論するグローバル型ヘルパーが提供される(import 不要)
- こちらも動的ルートを追加した時点で使う。現状は未使用

### 3. Turbopack がデフォルト

- `next dev` / `next build` の両方で Turbopack が既定のバンドラ
- 追加設定は不要。`package.json` のスクリプトにフラグを書いていないのはこのため
- カスタマイズする場合は `next.config.ts` の `turbopack` フィールド(旧 `experimental.turbo` からリネーム)

### 4. Middleware → Proxy リネーム(今回は未使用)

- v16 で `middleware.ts` が `proxy.ts` にリネームされた
- 配置場所は変わらずプロジェクトルート(または `src/` 直下)、関数名は `proxy`
- `NextRequest` / `NextResponse` / `config.matcher` の API 形状は変わらず
- 本プロジェクトには `proxy.ts` も `middleware.ts` も**存在しない**。将来 next-intl を導入する際に **next-intl のミドルウェアを `proxy.ts` として配置する**ことになる
- 出典: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- 引用:
  > Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose. The functionality remains the same.

### 5. Cache Components / PPR は使わない — 従来キャッシュモデル + ISR

- v16 の新しいキャッシュモデル(`'use cache'` ディレクティブ + `cacheLife` / `cacheTag`)と Partial Prerendering は、`next.config.ts` の `cacheComponents: true` で有効化する
- 本プロジェクトは **有効化していない**。ソース中に `'use cache'` / `cacheLife` / `cacheTag` は 1 箇所も無い
- 代わりに **従来のキャッシュモデル + ISR** を使う。ページは全て静的にプリレンダリングし、`revalidate` で一定間隔の再生成に任せる

`revalidate` の使用箇所は次の 6 箇所のみ(全て 3600 秒 = 1 時間)。

| 箇所 | 種別 | 意味 |
|---|---|---|
| `src/app/page.tsx` | route segment config | ホームの ISR 間隔 |
| `src/app/blogs/page.tsx` | route segment config | `/blogs` の ISR 間隔 |
| `src/app/press/page.tsx` | route segment config | `/press` の ISR 間隔 |
| `src/lib/microcms/client.ts` | `fetch` の `next.revalidate` | microCMS レスポンスのキャッシュ寿命 |
| `src/lib/blog/qiita.ts` | `fetch` の `next.revalidate` | Qiita API のキャッシュ寿命 |
| `src/lib/blog/rss.ts` | `fetch` の `next.revalidate` | Zenn / note RSS のキャッシュ寿命 |

route segment config は静的リテラルしか受け付けないため、ページ側の `3600` は `MICROCMS_REVALIDATE_SECONDS` / `BLOG_REVALIDATE_SECONDS` の定数を参照できず**数値をベタ書きし、同値である旨をコメントで残している**。定数を変更したらページ側も併せて直すこと。

`generateMetadata` と `export const dynamic` は 1 箇所も使っていない(メタデータは全て静的 `export const metadata`)。

## 言語と将来の i18n 戦略

### 現状

- **日本語のみ**の単一言語サイト
- `src/app/layout.tsx` に `<html lang="ja">` を固定で記述
- UI 文言はコンポーネント内に日本語の文字列リテラルとして直接書く
- コンテンツデータ(microCMS / `src/content/`)も `string` 型で日本語固定

`[lang]` セグメント、`proxy.ts`、dictionaries、LocaleSwitcher などは **いずれも存在しない**。

### 将来: next-intl で多言語化

多言語対応が必要になった時点で、別タスクとして **next-intl** を導入する。自前実装(proxy + dictionaries)を選ばない理由:

- ICU メッセージフォーマット(複数形・性別・日付等)が標準でサポートされる
- `useTranslations()` で型安全な翻訳キー参照が得られる
- App Router への公式対応(routing middleware、`setRequestLocale`)
- 翻訳ファイルのホットリロードや抽出ツールが揃っている

導入時の想定手順(メモ):

1. `pnpm add next-intl` し、`messages/ja.json` / `messages/en.json` を作成
2. 既存の日本語文字列を `messages/ja.json` に機械的に移植、英語版を追加
3. 各コンポーネントで `const t = useTranslations()` に置換
4. `src/app/` の内容を `src/app/[locale]/` にリネーム移動(ファイル構造変更)
5. `next-intl/plugin` を `next.config.ts` に組み込み、routing 設定で `locales: ['ja','en']`, `defaultLocale: 'ja'` を宣言
6. next-intl の routing middleware を **`proxy.ts`** としてルート直下に配置(Next.js 16 では middleware → proxy リネーム済みのため)
7. 静的な `metadata` を `generateMetadata` に置き換えて `alternates.languages` を追加、`sitemap.ts` を多言語化

この移行はコンテンツが固まった後に行う想定で、現段階では意識しない。ただし **文言はベタ書きしつつ、あとから抽出しやすい書き方**を意識する(定数としてまとめる、文の中に JSX を混ぜ込まない等)。

## ディレクトリ構成

```
portfolio/
├── AGENTS.md                                # Next.js 16 の注意書き(CLAUDE.md は @AGENTS.md 参照のみ)
├── CLAUDE.md
├── README.md
├── next.config.ts                           # images.remotePatterns(microCMS)のみ
├── postcss.config.mjs                       # @tailwindcss/postcss のみ
├── components.json                          # shadcn/ui 設定(style: base-nova)
├── biome.json
├── vitest.config.ts                         # environment: node / include: src/**/*.test.ts
├── tsconfig.json                            # @/* エイリアス
├── pnpm-workspace.yaml                      # allowBuilds のみ(モノレポではない)
├── .env.example                             # microCMS の 2 変数
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   ├── design.md
│   ├── profile.md
│   └── superpowers/
│       ├── plans/
│       └── specs/
├── public/
│   ├── profile.jpg
│   └── photos/
│       └── home/
│           ├── 1.jpg                        # タージ・マハル
│           ├── 2.jpg                        # 長崎ハッカソン
│           └── 3.jpg                        # アユタヤ
└── src/
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css                      # Tailwind v4 @theme + トークン
    │   ├── layout.tsx                       # RootLayout(<html lang="ja">)
    │   ├── page.tsx                         # Bento home
    │   ├── not-found.tsx
    │   ├── opengraph-image.tsx
    │   ├── robots.ts
    │   ├── sitemap.ts
    │   ├── blogs/
    │   │   ├── loading.tsx                  # 唯一の loading.tsx
    │   │   └── page.tsx
    │   └── press/
    │       └── page.tsx
    ├── components/
    │   ├── bento/                           # ホームの Bento タイル
    │   │   ├── block-reveal.tsx
    │   │   ├── blog-teaser-tile.tsx
    │   │   ├── contact-tile.tsx
    │   │   ├── hero-tile.tsx
    │   │   ├── keywords-layout.ts           # 純ロジック(螺旋配置)
    │   │   ├── keywords-layout.test.ts
    │   │   ├── keywords-tile.tsx
    │   │   ├── marquee.tsx
    │   │   ├── photo-tile.tsx
    │   │   ├── press-teaser-tile.tsx
    │   │   └── tech-stack-tile.tsx
    │   ├── blog/
    │   │   ├── blog-card.tsx
    │   │   ├── blog-filter.tsx
    │   │   └── platform-meta.tsx
    │   ├── home/
    │   │   └── timeline.tsx
    │   ├── layout/
    │   │   ├── footer.tsx
    │   │   ├── header.tsx
    │   │   ├── mobile-nav.tsx
    │   │   └── theme-toggle.tsx
    │   ├── motion/
    │   │   ├── bento-tile-motion.tsx
    │   │   └── fade-in.tsx
    │   ├── press/
    │   │   ├── press-card.tsx
    │   │   └── press-meta.tsx
    │   ├── projects/
    │   │   ├── project-card.tsx
    │   │   └── projects-section.tsx
    │   ├── providers/
    │   │   └── theme-provider.tsx
    │   ├── shared/
    │   │   ├── social-links.tsx
    │   │   └── tech-stack-list.tsx
    │   ├── ui/                              # shadcn 生成(6 ファイル)
    │   │   ├── badge.tsx
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── drawer.tsx
    │   │   ├── separator.tsx
    │   │   └── tooltip.tsx
    │   └── works/
    │       ├── work-card.tsx
    │       └── works-section.tsx
    ├── content/                             # 静的コンテンツ + ドメイン型
    │   ├── keywords.ts
    │   ├── profile.ts
    │   └── types.ts
    └── lib/
        ├── blog/                            # 外部ブログ集約
        │   ├── config.ts
        │   ├── index.ts
        │   ├── qiita.ts
        │   ├── rss.ts
        │   ├── types.ts
        │   └── utils.ts
        ├── microcms/                        # microCMS アクセス層
        │   ├── client.ts
        │   ├── config.ts
        │   ├── config.test.ts
        │   ├── index.ts
        │   ├── mappers.ts
        │   ├── mappers.test.ts
        │   └── types.ts
        ├── navigation.ts
        ├── site.ts
        └── utils.ts
```

補足:

- `src/hooks/` は**存在しない**(`components.json` の `aliases.hooks` は宣言だけで実体なし)
- `scripts/` ディレクトリは**存在しない**
- `src/app/` に `error.tsx` / `template.tsx` / `route.ts` / 動的ルートは無い。`loading.tsx` は `blogs/` の 1 つだけ
- 将来 next-intl を導入する際には、この構成に `proxy.ts`(ルート直下)、`src/app/[locale]/` セグメント、`messages/ja.json` / `messages/en.json` を追加する想定

## ルート構成

実在するルートは **3 ページ + 3 メタデータルート**のみ。動的ルートは無い。

| ルート | ファイル | `revalidate` | データ源 |
|---|---|---|---|
| `/` | `src/app/page.tsx` | 3600 | microCMS(press / timeline / projects / works)+ 外部ブログ + 静的 |
| `/blogs` | `src/app/blogs/page.tsx` | 3600 | Qiita API + Zenn/note RSS |
| `/press` | `src/app/press/page.tsx` | 3600 | microCMS `press` |
| `/opengraph-image` | `src/app/opengraph-image.tsx` | — | `next/og` の `ImageResponse`(1200×630) |
| `/robots.txt` | `src/app/robots.ts` | — | `MetadataRoute.Robots` |
| `/sitemap.xml` | `src/app/sitemap.ts` | — | 上記 3 ルートを固定で列挙 |

- **メタデータ**: `layout.tsx` で `metadataBase` / `title.template`(`"%s | Takuya Uehara"`)/ OpenGraph / Twitter Card を定義し、各ページは `description` と `alternates.canonical` を上書きする。`/blogs` と `/press` は `title` も指定するが、ホームは layout の `title.default` に任せる
- **OG 画像**: 外部フォントを読み込まず `ImageResponse` デフォルトの sans に任せる(日本語もレンダリング可能)。色は `src/lib/site.ts` の `ogColors` から取る
- **工事中バナー**: `site.underConstruction` が `true` の間、`layout.tsx` が全ページ上部に `<output>` のバナーを表示する。公開時に `false` にする
- `sitemap.ts` は `navigation.ts` の 3 ルートと対応させて手書きしている。ルートを増やしたら両方に足すこと

## データ層 — 三層構造

データの取得元は 3 系統あり、それぞれ責務と配置を分けている。**どれも Server Component 側でのみ呼ぶ**。

| 層 | 置き場所 | 内容 | 更新方法 |
|---|---|---|---|
| ① microCMS | `src/lib/microcms/` | Press / Projects / Works / Timeline | microCMS 管理画面から。ISR 3600 秒で反映 |
| ② 外部ブログ集約 | `src/lib/blog/` | Qiita / Zenn / note の投稿一覧 | 各プラットフォームに投稿すれば自動反映 |
| ③ 静的 TS | `src/content/` | Profile / Keywords | コードを編集して再デプロイ |

### ① microCMS(`src/lib/microcms/`)

エンドポイントは **`press` / `projects` / `works` / `timeline` の 4 つ**。公式 SDK は使わず、`fetch` を薄くラップした自前クライアントで取得する。

```
config.ts  → 環境変数の読み出しと検証(欠けたら throw)/ MICROCMS_REVALIDATE_SECONDS = 3600
client.ts  → fetchList<T>(endpoint): リスト型 API の全件取得(?limit=100&orders=-date)
types.ts   → Raw* 型(API レスポンスそのまま)
mappers.ts → Raw* → ドメイン型への変換
index.ts   → 公開関数(ページ / セクションが import するのはここだけ)
```

公開関数は 5 つ。

```ts
getAllPress(): Promise<PressItem[]>
getLatestPress(n: number): Promise<PressItem[]>   // getAllPress().slice(0, n)
getProjects(): Promise<Project[]>
getWorks(): Promise<Work[]>
getTimeline(): Promise<TimelineEntry[]>
```

**マッパー層を必ず挟む**理由は、microCMS のレスポンスに以下の癖があるため(`types.ts` の冒頭コメントに明記)。

- 日付フィールドは ISO 8601 の **UTC 文字列**。JST で選んだ日付は「前日 T15:00:00.000Z」で返るため、UTC のまま切り出すと 1 日ずれる → `toJstDateString()` で +9 時間してから `YYYY-MM-DD` を切り出す
- セレクトフィールドは**単一選択でも `string[]`** → `pickSelect()` で先頭値を許可リストに照合し、外れたら `"other"` にフォールバック
- 画像フィールドは `{ url, width, height }` オブジェクト → `raw.thumbnail?.url` に平坦化
- 繰り返しカスタムフィールドは `fieldId` 付きオブジェクトの配列。**未設定時は `null` が返る** → `(raw.links ?? []).map(mapLink)`
- 空文字が返る任意フィールドは `|| undefined` で正規化する
- `slug` は microCMS の `id` をそのまま使う(`Project` / `Work` / `PressItem` のみ。`TimelineEntry` は `slug` を持たない)

`mappers.ts` と `config.ts` は Vitest でユニットテストしている(日付ズレ、未知のセレクト値、`links: null`、空文字の正規化など)。**microCMS の癖に対する防御は必ずテストで固定する**。

### ② 外部ブログ集約(`src/lib/blog/`)

Qiita は REST API、Zenn / note は RSS から取得し、`BlogPost` という共通型に正規化して 1 本のリストにまとめる。

```
config.ts → blogHandles(3 プラットフォームの ID)/ BLOG_REVALIDATE_SECONDS = 3600 / blogProfileUrls
types.ts  → BlogPlatform("qiita" | "zenn" | "note")と BlogPost
qiita.ts  → fetchQiita()(取得)と parseQiitaItems()(純粋関数)
rss.ts    → fetchZenn() / fetchNote()(取得)と parseRssItems()(純粋関数)
utils.ts  → decodeHtmlEntities / toPlainExcerpt / toIso / extractThumbnail / sortByPublishedDesc
index.ts  → getAllBlogPosts() / getLatestBlogPosts(limit)
```

設計上のポイント:

- **失敗を全体の失敗にしない**。`getAllBlogPosts()` は `Promise.allSettled` を使い、rejected は `console.error` に流して**成功分だけ**を返す。1 プラットフォームが落ちてもページは描画される
- **fetch と parse を分離**する。`parseQiitaItems` / `parseRssItems` は引数だけで完結する純粋関数として export し、テストしやすい形にしている
- `toIso()` はパース不能な日付を epoch にフォールバックさせ、並べ替えで最後尾に落とす
- HTML エンティティのデコードは `&amp;` を**最後**に処理する(先に処理すると二重デコードになる)
- `tags` / `likes` は取得できるプラットフォームのみ(現状 Qiita だけ)。型上も optional

### ③ 静的 TS(`src/content/` と `src/lib/`)

CMS に置く必要のない、更新頻度が低くコードと一体で管理したいものはここに直書きする。

| ファイル | 内容 |
|---|---|
| `src/content/types.ts` | ドメイン型の単一の置き場 |
| `src/content/profile.ts` | 名前 / 肩書き / 所属 / 研究室 / モットー / SNS 7 件 / 技術スタック 32 件 / 写真 3 件 |
| `src/content/keywords.ts` | Keywords タイルの 37 語(`size` 4 段階 = xl 1 / lg 8 / md 9 / sm 19、`accent` 付きは 4 語) |
| `src/lib/site.ts` | `site`(URL / サイト名 / description / locale / `underConstruction`)と `ogColors` |
| `src/lib/navigation.ts` | `navItems`(ヘッダ / フッタ / OG 画像 / sitemap が共有する 3 ルート) |
| `src/lib/utils.ts` | `cn()` = `twMerge(clsx())` のみ |

## データ型(`src/content/types.ts`)

ドメイン型は全て `src/content/types.ts` に集約する。microCMS のレスポンス型(`Raw*`)は `src/lib/microcms/types.ts` に分離し、**UI 側はドメイン型しか知らない**状態を保つ。

```ts
// src/content/types.ts

export type LinkKind = "github" | "demo" | "paper" | "slide" | "article" | "other";

/** Projects / Works 共通の外部リンク。 */
export interface ContentLink {
  label: string;
  href: string;
  kind: LinkKind;
}

/** 開発プロジェクト（microCMS の projects API で管理）。 */
export interface Project {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  thumbnail?: string;
  links: ContentLink[];
}

/** 開発以外の取り組み（microCMS の works API で管理）。 */
export interface Work {
  slug: string;
  title: string;
  summary: string;
  date: string;
  url?: string;
  thumbnail?: string;
}

export type SocialIcon =
  | "github" | "x" | "youtube" | "wantedly" | "qiita" | "zenn" | "note" | "other";

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
}

export type TimelineCategory = "life" | "education" | "work" | "event" | "other";

export interface TimelineEntry {
  date: string;
  category: TimelineCategory;
  title: string;
  description?: string;
  location?: string;
  thumbnail?: string;
}

export interface PhotoEntry {
  src: string;
  alt: string;
  caption?: string;
}

export interface Keyword {
  label: string;
  size: "xl" | "lg" | "md" | "sm";
  accent?: boolean;
}

export interface PressItem {
  slug: string;
  title: string;
  outlet: string;
  url: string;
  date: string;
  thumbnail?: string;
  excerpt?: string;
}

export interface Profile {
  name: string;
  roleTags: string[];
  affiliation: { role: string; school: string };
  lab: { name: string; url: string };
  titles: string[];
  motto: string;
  mottoEn: string;
  image?: string;
  social: SocialLink[];
  techStack: string[];
  photos: PhotoEntry[];
}
```

ブログの型だけは外部 API 由来なので `src/lib/blog/types.ts` に置く。

```ts
export type BlogPlatform = "qiita" | "zenn" | "note";

export interface BlogPost {
  platform: BlogPlatform;
  title: string;
  url: string;
  publishedAt: string; // ISO 8601
  excerpt?: string;
  thumbnail?: string;
  tags?: string[];     // 取得できるプラットフォームのみ(現状 Qiita)
  likes?: number;      // 同上
}
```

## Server / Client Components の境界

**`src/app/` 配下に `"use client"` は 1 ファイルも無い。** 全ページが Server Component で、データ取得は必ずサーバ側で行う。境界は `src/components/` の中にある。

`"use client"` を持つのは次の 15 ファイルだけで、理由は 3 つに分類できる。

| 理由 | ファイル |
|---|---|
| `motion/react` を使う演出 | `motion/bento-tile-motion.tsx`, `motion/fade-in.tsx`, `bento/block-reveal.tsx`, `bento/marquee.tsx` |
| React フック(`useState` / `useEffect` / `usePathname` / `useTheme`) | `bento/keywords-tile.tsx`, `bento/photo-tile.tsx`, `blog/blog-filter.tsx`, `home/timeline.tsx`, `layout/mobile-nav.tsx`, `layout/theme-toggle.tsx`, `providers/theme-provider.tsx`, `shared/social-links.tsx` |
| Base UI / vaul のクライアント専用プリミティブ | `ui/drawer.tsx`, `ui/separator.tsx`, `ui/tooltip.tsx` |

守っているルール:

- **データ取得を Client に降ろさない**。`ProjectsSection` / `WorksSection` は**それ自身が async Server Component**で `getProjects()` / `getWorks()` を await する。ホームの `page.tsx` は `Promise.all([getLatestBlogPosts(3), getLatestPress(3), getTimeline()])` で 3 系統を並行取得し、Client の `Timeline` には props で渡す
- **計算だけのモジュールはクライアント指令を付けない**。`bento/keywords-layout.ts` は配置計算のみの純粋 TS に切り出し、Vitest(node 環境)でテストする。`parseQiitaItems` / `parseRssItems` も同じ理由で fetch から分離してある
- **重いライブラリは動的 import**。`matter-js` はバンドルを膨らませないよう `keywords-tile.tsx` の `useEffect` 内で `import("matter-js")` する
- Client Component は SSR とマウント後で見た目が食い違わないようにする。`ThemeToggle` はマウント前を `disabled` のプレースホルダにし、`KeywordsTile` は計測前(`nodes === null`)に `flex flex-wrap` のフォールバック UI を出す

## デザイントークン方針

- **Tailwind v4 の `@theme inline`** でデザイントークンを CSS 変数として定義。Tailwind の設定ファイルは持たず、`src/app/globals.css` が唯一の設定源
- ダークモード切替は next-themes の `class` 戦略(`<html class="dark">`)。Tailwind v4 側は `@custom-variant dark (&:where(.dark, .dark *));` で宣言
- shadcn/ui のセマンティック命名(`background`, `foreground`, `muted`, `border`, `card`, `accent`, `ring` など)に準拠し、shadcn コンポーネントが追加設定なく動作するようにする
- 色は全て **OKLCH** で定義。RGB / HEX はトークンに書かない
- ブランド色は **accent(GitHub 風グリーン)1 色**のみ。他はモノクロで組む
- 独自トークンとして、Timeline のカテゴリ識別用ドット色 `--color-cat-{life,education,work,event,other}` と、PhotoTile 用の `--aspect-photo: 4 / 3` を持つ。radius は `--radius: 0.75rem` を基準に `sm` 〜 `4xl` を計算式で導出
- フォントは `--font-sans` を `next/font/google` の LINE Seed JP 変数に接続する

詳細なトークン値と Bento レイアウトは [design.md](./design.md) を参照。

## コーディング規約

本プロジェクトで守るべきコード規約。レビュー時のチェックリストとしても機能する。

### ファイル / 命名

- ファイル名は **kebab-case**(`blog-teaser-tile.tsx`, `keywords-layout.ts`)
- コンポーネントは **PascalCase の named export**(`export function HeroTile`)。`export default` は `src/app/` の page / layout / not-found / robots / sitemap / opengraph-image だけ
- テストは `*.test.ts` を**実装と同じディレクトリに併置**する。`vitest.config.ts` の `include` が `.ts` のみなので、`.tsx` のテストは拾われない(= DOM を触るテストは書かない方針)
- マッパーは `map<Entity>` 命名(`mapPress` / `mapProject` / `mapWork` / `mapTimelineEntry`)
- 定数は SCREAMING_SNAKE(`SIZE_FONT`, `LINK_ORDER`, `BLOG_REVALIDATE_SECONDS`)
- props の型は `interface XxxProps` をローカル定義する。単純なものは `{ className }: { className?: string }` のインラインで良い
- **コメント / JSDoc は日本語**で書く。「なぜそうしたか」を残す(Safari の折り返し揺れ対策、JST の日付ズレ、タッチ端末でドラッグを付けない理由 など)

### import

Biome の `organizeImports` が強制する 3 ブロック構成を守る(ブロック間は空行)。

1. 外部パッケージ(`node:` → npm → `next/*` / `react`)
2. `@/` エイリアス
3. 相対パス `./`

```ts
import { Link as LinkIcon } from "lucide-react";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

import { BlockReveal } from "./block-reveal";
import { Marquee } from "./marquee";
```

型は値 import と混ぜず `import type { ... }` 構文で書く。import パスは常に `@/*` エイリアスを使う(`tsconfig.json` で `./src/*` にマッピング済み)。

### スタイリング

- **Tailwind CSS のみ**を使う。CSS-in-JS(styled-components, emotion 等)は導入しない
- **色とスペーシングは必ずトークン経由**。`bg-card` / `text-muted-foreground` / `border-border` / `text-accent` / `ring-ring` を使い、生の hex / oklch をクラスに書かない
- `className` のマージは `cn()`(`twMerge(clsx())`)で行う
- **arbitrary value は限定用途のみ**許可する。許容するのは次の 4 類型だけで、現在の使用箇所も以下で全てである:

  | 類型 | 実例 | 使用箇所 |
  |---|---|---|
  | 極小フォント(10–11px。標準スケールに無い) | `text-[10px]` / `text-[11px]` | `blog-card.tsx`, `blog-teaser-tile.tsx`, `press-teaser-tile.tsx`(2 箇所), `timeline.tsx` |
  | 特殊アスペクト比(OGP 比) | `aspect-[1.91/1]` | `press-card.tsx`, `blog-card.tsx` |
  | コンテナの最小サイズ | `min-h-[500px]` / `min-h-[60vh]` | `keywords-tile.tsx`(物理演算の描画領域), `not-found.tsx` |
  | 1px 単位の光学調整 | `mt-[5px]` | `hero-tile.tsx`(箇条書きドットの位置合わせ) |

  色とスペーシングに arbitrary value を使うのは禁止。それ以外で標準スケールに無い値が必要になったら、`globals.css` の `@theme` にトークンを追加してセマンティックなクラスで参照する(繰り返し使う比率は `--aspect-photo` → `aspect-photo` のようにトークン化する)。なお `src/components/ui/` は shadcn の生成物で `data-[side=…]` 等の arbitrary variant を多用しているが、生成物として扱いこの規約の対象外とする
- **`style` 属性で色を渡してよいのは外部ブランド色と Tailwind が使えない環境だけ**。現在の該当箇所は次の 3 ファイルのみ:

  | ファイル | 内容 |
  |---|---|
  | `blog-card.tsx` | `platformMeta` の Qiita `#55C500` / Zenn `#3EA8FF` / note `#41C9B4`(プレースホルダ地色とラベル色) |
  | `blog-teaser-tile.tsx` | 同じ `platformMeta` のラベル色 |
  | `opengraph-image.tsx` | Satori のため Tailwind が使えず、`ogColors`(`src/lib/site.ts`)を直接指定 |

  `style` を色以外に使うのは演出目的に限る(`marquee.tsx` の `maskImage`、`hero-tile.tsx` の `animationDelay`、`keywords-tile.tsx` の物理演算座標)
- レスポンシブのブレークポイント方針・グリッドの 2 パターン・ページ幅(`mx-auto max-w-6xl px-6 py-16`)と、フォーカスリングの定型は**見た目の仕様なので [design.md](./design.md) が正**(前者は「Tailwind クラスの規約 › レスポンシブ」、後者は「タイル共通スタイル › フォーカスリング」)。ここでは重複させない

### UI コンポーネント

- 新しい UI パーツが必要になったら **まず shadcn/ui** に該当コンポーネントがないか確認する
- shadcn にあるものは `pnpm dlx shadcn@latest add <name>` で追加(`shadcn` パッケージ自体は依存に入れていないので都度 `dlx`)
- shadcn は **`base-nova` preset** で初期化済み。生成物は Radix ではなく **`@base-ui/react`** を直接 import する(`drawer` のみ `vaul` ベース)
- `@base-ui/react` / `@radix-ui/*` を shadcn 経由以外で直接追加しない。Headless UI / MUI / Mantine / daisyUI など他の UI ライブラリも導入しない
- `ui/card.tsx` は `CardHeader` / `CardTitle` などを export しているが、実際に使っているのは `Card` だけ。既存の使い方に合わせる

### アイコン

2 つのライブラリを**用途で使い分ける**。

- **@icons-pack/react-simple-icons**: ブランドロゴ(GitHub / X / Qiita / Zenn / note / YouTube / Wantedly、技術スタックの各種ロゴ)
- **lucide-react**: それ以外の汎用 UI アイコン(`ArrowUpRight`, `Menu`, `Moon`, `Sun`, `MapPin`, `Newspaper` など)

両者を 1 つの `Record` に混ぜる場合は `LucideIcon | typeof SiGithub` や `ComponentType<{ className?: string }>` で型を揃える。react-icons / @heroicons/react / @radix-ui/react-icons は追加しない。

### 画像

- microCMS の画像(`images.microcms-assets.io`)は **`next/image`** を使う。`next.config.ts` で許可済み
- **Zenn / note のサムネイルは `<img>` を使う**。外部の可変ホスト(Cloudinary など)で `remotePatterns` に列挙できないため。`biome-ignore lint/performance/noImgElement` を理由コメント付きで置く
- ローカル画像(`public/profile.jpg`, `public/photos/home/*.jpg`)は `next/image`

### アニメーション

- **motion**(`motion/react`)を使用
- Apple 的な ease-out(`[0.22, 1, 0.36, 1]`)を基調とし、派手なパララックスや過剰な動きは避ける
- **reduced motion は必ず尊重する**。新しい演出を足すときは JS(`useReducedMotion()`)/ CSS(`motion-safe:` または `@media (prefers-reduced-motion: no-preference)`)/ `matchMedia` のいずれかで低減設定に分岐させる。コンポーネントごとの対応内訳は [design.md](./design.md) の「reduced-motion」節が正
- 生の `@keyframes` を書くのは最小限に。現状は `globals.css` の `hero-reveal` のみ

### 型

- `any` 禁止。どうしても必要なら `unknown` + type narrowing
- ドメイン型は `src/content/types.ts`、API レスポンス型は `Raw*` プレフィクスで `src/lib/microcms/types.ts` に置き、混ぜない
- 動的ルートを追加する場合、params は `PageProps<'/xxx/[slug]'>` 型ヘルパーを使う。Next.js 16 では `Promise<{ slug: string }>` 型になっている点に注意

### アクセシビリティ

- フィルタ UI は `<fieldset aria-label="...">` + `<button aria-pressed>` の形に統一(`blog-filter.tsx` / `timeline.tsx` で同じ形)
- 絞り込み結果のリストには `aria-live="polite"` を付ける
- 装飾要素は `aria-hidden`、装飾画像は `alt=""`
- `layout.tsx` に `#main` へのスキップリンクを置き、`<main id="main">` と対応させる
- 動くテキスト(`Marquee`)は `sr-only` に正規テキストを 1 度だけ置き、動く側を `aria-hidden` にする
- 外部リンクは `target="_blank"` + `rel`。`rel` は `noopener noreferrer` と `noreferrer` が混在しているので、**新規追加時は `noopener noreferrer` に寄せる**

## 既知のリスク

| リスク | 対処 |
|---|---|
| microCMS の環境変数が未設定だとビルドが落ちる | 意図的な設計(ダミーデータへのフォールバックを持たない)。`.env.example` に必須である旨を明記済み。Vercel 側の環境変数設定を忘れないこと |
| microCMS の日付・セレクト・画像フィールドの癖 | `mappers.ts` で必ず正規化し、`mappers.test.ts` で挙動を固定する。新しい API を足したら同じ形でマッパーとテストを書く |
| 各 API が 100 件を超えるとページングが必要 | `fetchList` は `limit=100` の 1 リクエストのみ。100 件に近づいたらページング実装を追加する |
| 外部ブログ API / RSS の障害 | `Promise.allSettled` で失敗を握り潰し、成功分のみ表示。全滅時は「記事はまだありません」+ 各プラットフォームへのリンクを出す |
| `revalidate` の値がページと定数で二重管理 | route segment config が静的リテラルしか受け付けないための妥協。両方にコメントを残してあるので、片方だけ変えない |
| Zenn / note のサムネイルが最適化されない | `remotePatterns` に列挙できない外部ホストのため `<img>` で妥協。ホストが固定できるなら `next/image` に戻す |
| LINE Seed JP の subset に `japanese` が無い | Google 側の unicode-range CSS で日本語グリフが配信される。加えて `fallback` に system-ui / Hiragino Sans / Yu Gothic を指定済み |
| `next-themes` の hydration flash | `<html suppressHydrationWarning>` と `ThemeToggle` の `mounted` ガードで対処済み。新しいテーマ依存 UI でも同じガードを踏襲する |
| `matter-js` によるバンドル肥大 | `useEffect` 内の動的 import で初期バンドルから除外。同様の重量級ライブラリも同じ扱いにする |
| 工事中バナーの外し忘れ | `src/lib/site.ts` の `underConstruction` を公開時に `false` にする |
| 後から i18n を導入する際の文言抽出コスト | 文言はコンポーネント直書きでも、文中に JSX を混ぜ込まず定数化・段落単位で切り出しておく。next-intl への移植が機械的な置換で済むように書く |
