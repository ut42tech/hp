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

## ポートフォリオ（`apps/web`）

デザインは Figma の [ut42tech — Portfolio](https://www.figma.com/design/ZPaC9SNAfMyKTROfRvAJyT) で確定している。設計書は [構造](docs/superpowers/specs/2026-11-16-portfolio-wireframe-design.md) と [見た目](docs/superpowers/specs/2026-11-17-portfolio-visual-design.md)。

### ページと URL

| URL                                                  | 中身                                                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/`                                                  | 言語へ振り分ける（Vercel の `apps/web/vercel.json`。Vercel の外では `src/pages/index.astro` の転送） |
| `/ja/`                                               | Hello                                                                                                |
| `/ja/about`                                          | About（連絡先は `/ja/about#contact`）                                                                |
| `/ja/works/apps` ・ `career` ・ `awards` ・ `events` | Works の4分類（`/ja/works` は Apps へ転送）                                                          |
| `/ja/works/apps/<slug>`                              | Apps の詳細（スマホでは一覧の上に重なるシート）                                                      |
| `/ja/press`                                          | Press                                                                                                |

- スマホとパソコンは同じ HTML を CSS で出し分ける。境目は 1024px。
- ページは `src/pages/[locale]/` の薄い入口で、本体は `src/views/`。

### ハードコードしない

`apps/web/test/no-hardcode.test.ts` が見張っている。

- **アイコン**: 操作のアイコンは `@tabler/icons-vue`（`src/components/UiIcon.vue`）、ブランドは `simple-icons`（`src/components/BrandIcon.vue`）。SVG やパスをソースに書かない。LinkedIn だけは最新版から外されたため、`simple-icons-11`（11.0.0 の別名）から読む。
- **文言**: `src/i18n/messages/ja.ts` と `en.ts` の辞書を通す。部品（`components` / `views` / `layouts`）に日本語を書かない。鍵を足すときは両方に足す。
- **色・角丸・余白・影**: `packages/tokens/tokens.css` の `--ut-*` だけを使う。ライト（`:root`）とダーク（`prefers-color-scheme` と `[data-theme="dark"]` の2か所）をそろえて書く。Tailwind の名前（`bg-surface`、`text-muted`、`rounded-card`、`text-title-l` など）は `packages/tokens/theme.css`。
- Tailwind の `dark:` は OS 設定ではなく `[data-theme]` に連動する（`theme.css` の `@custom-variant dark`）。

### 中身を足す

`apps/web/src/content/<collection>/<lang>/<slug>.md` に Markdown を置く。日付は `YYYY-MM` か `YYYY-MM-DD`。項目の型は `src/content.config.ts`。

| コレクション | frontmatter                                                                                                                 | 本文       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `apps`       | `title`、`date`、`thumbnail?`、`initial?`、`demo?`、`github?`、`stack`（Skills のアイコン名）                               | 詳細の説明 |
| `career`     | `title`、`start`、`end?`、`summary`、`thumbnail?`、`initial?`                                                               | —          |
| `events`     | `title`、`date`、`thumbnail?`、`initial?`、`url?`                                                                           | —          |
| `awards`     | `title`、`date`、`initial?`                                                                                                 | —          |
| `press`      | `title`、`date`、`url`、`source`（`note` / `youtube` / `zenn` / `qiita` / `speakerdeck` / `other`）、`outlet`、`thumbnail?` | —          |

- 画像は `src/assets/works/<collection>/` に置き、`thumbnail` に相対パスで書く。無ければ頭文字（`initial` で上書きできる）か、Press では媒体のアイコンが出る。
- 英語の版が無い項目は、日本語の版が出る。

### 公開前に本人が書くもの

- About の自己紹介と「これまで」（辞書の `about.intro` と `about.history`。今は「（仮）」の文）。
- 素材に無かった Press（note、Zenn、Qiita、YouTube、Speaker Deck の記事や資料）と、「長崎のWA!」のインタビュー（URL が素材に無かった）。
- Apps の `stack`（今は空）。
- Career の終了月。素材に無かったので、インターン2件は開始月だけ、ほかは続いている扱い（「YYYY.MM –」）にしてある。

### 英語を公開する

1. `src/i18n/messages/en.ts` の文を本番の文に直す（About は今「(Draft)」）。
2. `src/content/*/en/` に翻訳を足す。
3. `src/i18n/config.ts` の `publishedLocales` に `"en"` を足す。ページは `[locale]` から書き出され、言語の切り替え（表示の切り替えの左）が自動で出る。
4. `apps/web/vercel.json` の `/` の振り分けを3本にする。上から順に、クッキー `ut42tech-lang` が `en` なら `/en/`、`Accept-Language` が英語で始まるなら `/en/`、それ以外は `/ja/`。

### 次の計画「動き」で足すもの

- 登場演出（幕と名前、「Welcome.」が1文字ずつ上がる）
- 「Welcome.」の文字がポインターに寄る動きと、押したときの弾み
- ipad-cursor（押せる要素にはもう `data-cursor="block"` が付いている）
- シートのせり上がり、払って閉じる操作
- カードから詳細へ広がる遷移、詳細のシートが重なるときに下のシートが奥へ下がる動き
- 押したときの沈み（`scale(.92)`）
