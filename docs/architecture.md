# Architecture — Portfolio Site

本ドキュメントはポートフォリオサイトの技術構成と設計判断を記述する。要件は [requirements.md](./requirements.md)、デザイン方針は [design.md](./design.md) を参照。

## 技術スタック

| カテゴリ | 採用 | バージョン | 補足 |
|---|---|---|---|
| フレームワーク | **Next.js** | 16.2.3 | App Router / Turbopack(デフォルト) |
| ランタイム | **React** | 19.2.4 | Server Components 中心、Client Components は最小限 |
| 言語 | **TypeScript** | 5.x | `strict: true`、`moduleResolution: "bundler"` |
| スタイリング | **Tailwind CSS** | v4 | `@theme` でデザイントークン定義 |
| UI プリミティブ | **shadcn/ui** | 最新(`base-nova` preset) | `button`, `card`, `badge`, `tabs`, `dropdown-menu`, `separator`。内部では `@base-ui/react`(Radix の後継)を使用 |
| アイコン | **lucide-react** | 最新 | 他のアイコンライブラリは使わない |
| アニメーション | **motion** | 最新 | 旧 framer-motion、import は `motion/react` |
| テーマ切替 | **next-themes** | 最新 | `class` 戦略、`suppressHydrationWarning` 必須 |
| 多言語化 | **(未導入)** | — | 初期実装は日本語のみ。将来 **next-intl** で導入予定 |
| フォント | **LINE Seed JP** | — | `next/font/google` 経由 |
| Lint / Format | **Biome** | 2.2.0 | `noUnknownAtRules: off`(Tailwind v4 用) |
| パッケージマネージャ | **pnpm** | — | `pnpm-workspace.yaml` 使用 |
| デプロイ | **Vercel** | — | 標準ビルド(`output: 'export'` は使わない) |

## Next.js 16 の重要な変更点

Next.js 16 には訓練データ以後の破壊的変更がいくつかある。実装時に特に注意すべき点を列挙する。ソースは全てローカルの `node_modules/next/dist/docs/` を直接参照。

### 1. `params` / `searchParams` が Promise 化

- Server Component で受け取る `params` と `searchParams` は `Promise<...>` 型
- 使用前に必ず `await` する必要がある
  ```ts
  export default async function Page({ params }: PageProps<'/works/[slug]'>) {
    const { slug } = await params;
    // ...
  }
  ```

### 2. `PageProps<'...'>` / `LayoutProps<'...'>` 型ヘルパー

- Next.js 16 ではルートパスから params の型を推論するグローバル型ヘルパーが提供される
- import 不要、ファイルのどこでも使える
- 例: `PageProps<'/works/[slug]'>` は `params: Promise<{ slug: string }>` を持つ

### 3. Turbopack がデフォルト

- `next dev` / `next build` の両方で Turbopack が既定のバンドラ
- 追加設定は不要
- カスタマイズする場合は `next.config.ts` の `turbopack` フィールド(旧 `experimental.turbo` からリネーム)

### 4. Middleware → Proxy リネーム(今回は未使用)

- v16 で `middleware.ts` が `proxy.ts` にリネームされた
- 配置場所は変わらずプロジェクトルート(または `src/` 直下)、関数名は `proxy`
- `NextRequest` / `NextResponse` / `config.matcher` の API 形状は変わらず
- 本プロジェクトでは初期実装で proxy を使わない。将来 next-intl を導入する際に **next-intl のミドルウェアを `proxy.ts` として配置する**ことになる
- 出典: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- 引用:
  > Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose. The functionality remains the same.

### 5. Cache Components(本プロジェクトでは不使用)

- v16 で導入された新しいキャッシュモデル(`'use cache'` ディレクティブ + `cacheLife`)
- 有効化は `next.config.ts` の `cacheComponents: true`
- 本プロジェクトは静的コンテンツのみで `generateStaticParams` による SSG で十分なため、**有効化しない**
- 旧来の `dynamic = 'force-static'` や `revalidate` も使用しない

## 言語と将来の i18n 戦略

### 現状(初期実装)

- **日本語のみ**の単一言語サイト
- `src/app/layout.tsx` に `<html lang="ja">` を固定で記述
- UI 文言はコンポーネント内に日本語の文字列リテラルとして直接書く
- コンテンツデータ(Profile / Work)も `string` 型で日本語固定

`[lang]` セグメント、`proxy.ts`、dictionaries、LocaleSwitcher などは **いずれも作らない**。

### 将来: next-intl で多言語化

多言語対応が必要になった時点で、別タスクとして **next-intl** を導入する。自前実装(proxy + dictionaries)を選ばない理由:

- ICU メッセージフォーマット(複数形・性別・日付等)が標準でサポートされる
- `useTranslations()` で型安全な翻訳キー参照が得られる
- App Router への公式対応(routing middleware、`setRequestLocale`)
- 英字・日本語など subset に関わらず、翻訳ファイルのホットリロードや抽出ツールが揃っている

導入時の想定手順(メモ):

1. `pnpm add next-intl` し、`messages/ja.json` / `messages/en.json` を作成
2. 既存の日本語文字列を `messages/ja.json` に機械的に移植、英語版を追加
3. 各コンポーネントで `const t = useTranslations()` に置換
4. `src/app/` の内容を `src/app/[locale]/` にリネーム移動(ファイル構造変更)
5. `next-intl/plugin` を `next.config.ts` に組み込み、routing 設定で `locales: ['ja','en']`, `defaultLocale: 'ja'` を宣言
6. next-intl の routing middleware を **`proxy.ts`** としてルート直下に配置(Next.js 16 では middleware → proxy リネーム済みのため)
7. `generateMetadata` に `alternates.languages` を追加、`sitemap.ts` を多言語化

この移行はコンテンツが固まった後に行う想定で、初期実装段階では意識しない。ただし **文言はベタ書きしつつ、あとから抽出しやすい書き方**を意識する(定数としてまとめる、文の中に JSX を混ぜ込まない等)。

## ディレクトリ構成

```
portfolio/
├── next.config.ts                           # 空(Turbopack デフォルト)
├── postcss.config.mjs                       # @tailwindcss/postcss のみ
├── components.json                          # shadcn/ui 設定(init で生成)
├── biome.json                               # 変更なし
├── tsconfig.json                            # @/* エイリアス
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   └── design.md
├── public/
│   └── favicon.ico
└── src/
    ├── app/
    │   ├── globals.css                      # Tailwind v4 @theme + トークン
    │   ├── layout.tsx                       # ROOT layout(<html lang="ja">)
    │   ├── page.tsx                         # Bento home
    │   ├── not-found.tsx
    │   ├── robots.ts
    │   ├── sitemap.ts
    │   ├── opengraph-image.tsx
    │   └── works/
    │       ├── page.tsx                     # 一覧
    │       └── [slug]/
    │           ├── page.tsx
    │           └── opengraph-image.tsx      # per-work OG
    ├── components/
    │   ├── ui/                              # shadcn 生成
    │   ├── providers/
    │   │   └── theme-provider.tsx
    │   ├── layout/
    │   │   ├── header.tsx
    │   │   ├── footer.tsx
    │   │   └── theme-toggle.tsx
    │   ├── bento/
    │   │   ├── bento-grid.tsx
    │   │   ├── hero-tile.tsx
    │   │   ├── about-tile.tsx
    │   │   ├── featured-tile.tsx
    │   │   ├── tech-stack-tile.tsx
    │   │   └── contact-tile.tsx
    │   ├── works/
    │   │   ├── work-card.tsx
    │   │   ├── category-filter.tsx
    │   │   ├── works-grid.tsx               # Client コンポーネント
    │   │   └── work-detail.tsx
    │   └── motion/
    │       ├── fade-in.tsx
    │       └── bento-tile-motion.tsx
    ├── content/
    │   ├── types.ts
    │   ├── profile.ts
    │   └── works.ts
    └── lib/
        ├── site.ts
        └── utils.ts
```

将来 next-intl を導入する際には、この構成に `proxy.ts`(ルート直下)、`src/app/[locale]/` セグメント、`messages/ja.json` / `messages/en.json` を追加する想定(詳細は「言語と将来の i18n 戦略」参照)。

## データ型(主要なもの)

初期実装は日本語のみなので、文言は全てプレーンな `string` で定義する。次節「言語と将来の i18n 戦略」に従い、翻訳が必要になった時点で next-intl の `messages/*.json` に機械的に移植できる前提で設計する。

```ts
// src/content/types.ts

export type WorkCategory = 'project' | 'oss' | 'research' | 'experience';
export type LinkKind = 'github' | 'demo' | 'paper' | 'slide' | 'article' | 'other';

export interface WorkLink {
  label: string;
  href: string;
  kind: LinkKind;
}

export interface Work {
  slug: string;
  category: WorkCategory;
  title: string;
  summary: string;
  body?: string[];                // 段落配列
  date: string;                   // YYYY-MM-DD
  tags: string[];
  thumbnail?: string;
  links: WorkLink[];
  featured?: boolean;
}

export type SocialIcon = 'github' | 'x' | 'linkedin' | 'mail' | 'other';

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
}

export interface Profile {
  name: string;
  role: string;
  affiliation: string;
  bio: string;
  social: SocialLink[];
  techStack: string[];
}
```

## デザイントークン方針

- **Tailwind v4 の `@theme`** でデザイントークンを CSS 変数として定義
- ダークモード切替は next-themes の `class` 戦略(`<html class="dark">`)
- Tailwind v4 では `@custom-variant dark (&:where(.dark, .dark *));` でクラスベース dark を宣言
- shadcn/ui のセマンティック命名(`background`, `foreground`, `muted`, `border`, `card`, `accent`, `ring` など)に準拠し、shadcn コンポーネントが追加設定なく動作するようにする
- 数値(色・半径)は OKLCH で定義。RGB は使わない(広色域ディスプレイでの発色と将来性のため)

詳細なトークン値と Bento レイアウトは [design.md](./design.md) を参照。

## コーディング規約

本プロジェクトで守るべきコード規約。レビュー時のチェックリストとしても機能する。

### スタイリング

- **Tailwind CSS のみ**を使う。CSS-in-JS(styled-components, emotion 等)は導入しない
- **arbitrary value を禁止**: `className="[0.01]"`, `bg-[#0a0a0a]` のような角カッコ記法は書かない
- Tailwind **標準スケールクラスは OK**: `p-8`, `gap-6`, `rounded-3xl`, `duration-300` 等
- 標準スケールに無い値が必要な場合は、`globals.css` の `@theme` にトークンを追加してセマンティックなクラスで参照する
- 色は CSS 変数(`--color-*`)経由でのみ指定。`bg-white`, `text-black` のようなリテラルは避け、`bg-background`, `text-foreground` のようなセマンティッククラスを使う

### UI コンポーネント

- 新しい UI パーツが必要になったら **まず shadcn/ui** に該当コンポーネントがないか確認する
- shadcn にあるものは `pnpm dlx shadcn@latest add <name>` で追加
- shadcn は `base-nova` preset(`@base-ui/react`)で初期化済み。生成ファイルは `@base-ui/react/*` を直接 import する
- `@base-ui/react` / `@radix-ui/*` を shadcn 経由以外で直接追加しない。Headless UI / MUI / Mantine / daisyUI など他の UI ライブラリも導入しない

### アイコン

- **lucide-react のみ**を使用
- react-icons, @heroicons/react, @radix-ui/react-icons などは追加しない

### アニメーション

- **motion** ライブラリ(`motion/react`)を使用
- CSS keyframes や `@keyframes` を直接書くのは最小限に
- Apple 的な ease-out を基調とし、派手なパララックスや過剰な動きは避ける

### Server / Client Components の分離

- デフォルトは **Server Component**
- Client Component は本当に必要な場合のみ(`useState`, `useEffect`, イベントハンドラ、`useTheme` 等が必要な時)
- ファイル先頭に `'use client';` を明示

### 型

- `any` 禁止。どうしても必要なら `unknown` + type narrowing
- 動的ルート(`works/[slug]`)の params は `PageProps<'/works/[slug]'>` 型ヘルパーを使う。Next.js 16 では `Promise<{ slug: string }>` 型になっている点に注意

### パス

- import パスは `@/*` エイリアスを使う(`tsconfig.json` で `./src/*` にマッピング済み)

## 既知のリスク

| リスク | 対処 |
|---|---|
| LINE Seed JP の subset に `japanese` が無い | Google 側の unicode-range CSS で日本語グリフは配信される想定。実装時に実際に表示確認し、ダメなら `fallback` フォントを追加するか `next/font/local` で self-host に切り替え |
| shadcn init が `globals.css` を上書き | init 実行後に `design.md` のトークン定義を再適用するステップを Phase A に含める |
| `next-themes` の hydration flash | `<html suppressHydrationWarning>` と `ThemeToggle` の `mounted` ガードを必須化 |
| 後から i18n を導入する際の文言抽出コスト | 文言はコンポーネント直書きでも、文中に JSX を混ぜ込まず定数化・段落単位で切り出しておく。next-intl への移植が機械的な置換で済むように書く |
