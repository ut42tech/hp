# ut42tech

[ut42tech.com](https://ut42tech.com) とそのサブドメインのサイトをまとめた monorepo。

設計: [`docs/superpowers/specs/2026-11-16-monorepo-foundation-design.md`](docs/superpowers/specs/2026-11-16-monorepo-foundation-design.md)

## 構成

| パス               | 中身                                            | 公開先                                      |
| ------------------ | ----------------------------------------------- | ------------------------------------------- |
| `apps/web`         | ポートフォリオ（Astro 7 + Vue + Tailwind v4）   | ut42tech.com（Vercel プロジェクト `hp-v2`） |
| `packages/tokens`  | デザイントークン（CSS 変数 + Tailwind テーマ）  | —                                           |
| `packages/assets`  | favicon・プロフィール写真などの共有アセット     | —                                           |
| `packages/profile` | 名前・モットー・SNS リンク（依存のない素の TS） | —                                           |
| `packages/config`  | 共通の `tsconfig`                               | —                                           |

`blog.` や名刺、遊びのページ、API（Hono）は今後 `apps/` に追加していく。

## 前提

- Node 24（`.node-version`）
- [Vite+](https://viteplus.dev) の `vp` 1.6 以上。pnpm は `vp` が `packageManager` のバージョンで用意する。
  - グローバルの `vp` が古いと、`.astro` の整形などがプロジェクトの設定どおりに動かない。古い場合は更新するか（mise なら `mise use -g viteplus@latest`）、`pnpm exec vp` を使う。

## コマンド

| コマンド                  | 内容                                                                             |
| ------------------------- | -------------------------------------------------------------------------------- |
| `vp install`              | 依存のインストール                                                               |
| `vp run dev`              | `apps/web` の開発サーバー（http://localhost:4321）                               |
| `vp run -r --cache build` | 全パッケージのビルド（変更がなければキャッシュから再生）                         |
| `vp run check`            | 整形・Lint・型チェック（`vp check` + 各パッケージの `typecheck`）                |
| `vp test`                 | ルートから全テストを実行（`apps/web/test` はビルド結果を検査するので先に build） |

テストは各パッケージではなく、ルートの `vp test` でまとめて実行する（Vite+ 1.6 では、`vite.config.ts` を持たないパッケージの中で `vp test` を実行すると失敗するため）。テストは `vite-plus/test` から import する。

## 新しいアプリを追加する

1. `apps/<name>` を作り、`package.json` の `name` を `@ut42tech/<name>` にする。
2. 共有パッケージを `"@ut42tech/tokens": "workspace:*"` のように依存に書く（Vercel が変更の影響範囲を判断するのに使う）。
3. scripts に `dev` / `build` / `typecheck` を揃える。Astro や Nuxt のアプリでは、フレームワークの CLI を scripts から呼ぶ（Vite+ はこれらのプロジェクトで `vp dev` / `vp build` を拒否する）。素の Vite アプリなら `vp dev` / `vp build` をそのまま使える。
4. Tailwind を使うなら、CSS で `@import "tailwindcss";` の後に `@import "@ut42tech/tokens/theme.css";`。使わないなら `@ut42tech/tokens/tokens.css` だけを読み込む。
5. Vercel にプロジェクトを作る（Root Directory を `apps/<name>`、「Include files outside the root directory」は有効、「Skip unaffected projects」も有効）。

## サブドメインを追加する

1. 上の手順で Vercel プロジェクトを作る。
2. Vercel のプロジェクトにドメイン（例: `blog.ut42tech.com`）を追加する。
3. Cloudflare の DNS に、Vercel が示す CNAME を追加する。**プロキシはオフ（DNS only）** にする。

## ツール選定についての注記

- Lint（Oxlint）は `.astro` と `.vue` のスクリプト部分しか見ず、テンプレートは対象外。テンプレートの型は `astro check` と `vue-tsc` で補っている（`apps/web` の `typecheck`）。Oxlint が対応したら外す。
- TypeScript は 7 ではなく 6 を使っている。`@astrojs/check` がまだ TypeScript 6 までしか対応していないため。
- Lint と整形の設定はルートの `vite.config.ts` だけに書く。パッケージごとの違いは `overrides` で表す。

## デザインへの引き継ぎ

今のトークンの値と `apps/web` の画面は、配線を確認するための**仮のもの**。Figma でデザインを決めるときに触るのは次の場所。

- 色・フォント・角丸: `packages/tokens/tokens.css` の `--ut-*`。ライト（`:root`）とダーク（`prefers-color-scheme` と `[data-theme="dark"]` の2か所）を揃えて書く。ここを差し替えれば全アプリに反映される。
- Tailwind の `dark:` は OS 設定ではなく `[data-theme]`（トグル）に連動する（`theme.css` の `@custom-variant dark`）。
- Tailwind のユーティリティ名（`bg-bg`, `text-fg`, `text-muted`, `text-accent`, `border-border`, `rounded-ut` など）: `packages/tokens/theme.css`。
- フォントファイル・ロゴ: `packages/assets` に置き、`exports` に追加する。
- ページ本体: `apps/web/src`。
