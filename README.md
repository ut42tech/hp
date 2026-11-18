# ut42tech

[ut42tech.com](https://ut42tech.com) とそのサブドメインのサイトをまとめた monorepo。

設計: [`docs/superpowers/specs/2026-11-16-monorepo-foundation-design.md`](docs/superpowers/specs/2026-11-16-monorepo-foundation-design.md)

## 構成

| パス               | 中身                                            | 公開先                                      |
| ------------------ | ----------------------------------------------- | ------------------------------------------- |
| `apps/web`         | ポートフォリオ（Nuxt 4 + Vue + Tailwind v4）    | ut42tech.com（Vercel プロジェクト `hp-v2`） |
| `packages/tokens`  | デザイントークン（CSS 変数 + Tailwind テーマ）  | —                                           |
| `packages/assets`  | favicon・プロフィール写真などの共有アセット     | —                                           |
| `packages/profile` | 名前・モットー・SNS リンク（依存のない素の TS） | —                                           |
| `packages/config`  | 共通の `tsconfig`                               | —                                           |

`blog.` や名刺、遊びのページ、API（Hono）は今後 `apps/` に追加していく。

## 前提

- Node 24（`.node-version`）
- [Vite+](https://viteplus.dev) の `vp` 1.6 以上。pnpm は `vp` が `packageManager` のバージョンで用意する。
  - グローバルの `vp` が古いと、整形などがプロジェクトの設定どおりに動かない。古い場合は更新するか（mise なら `mise use -g viteplus@latest`）、`pnpm exec vp` を使う。

## コマンド

| コマンド                  | 内容                                                                             |
| ------------------------- | -------------------------------------------------------------------------------- |
| `vp install`              | 依存のインストール                                                               |
| `vp run dev`              | `apps/web` の開発サーバー（http://localhost:3000）                               |
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

- Lint（Oxlint）は `.vue` のスクリプト部分しか見ず、テンプレートは対象外。テンプレートの型は `nuxt typecheck`（vue-tsc）で補っている（`apps/web` の `typecheck`）。Oxlint が対応したら外す。
- TypeScript は 6 を使っている（Astro のころは `@astrojs/check` の対応待ちだった。7 への更新はまだ確かめていない）。
- Lint と整形の設定はルートの `vite.config.ts` だけに書く。パッケージごとの違いは `overrides` で表す。

## ポートフォリオ（`apps/web`）

デザインは Figma の [ut42tech — Portfolio](https://www.figma.com/design/ZPaC9SNAfMyKTROfRvAJyT) で確定している。設計書は [構造](docs/superpowers/specs/2026-11-16-portfolio-wireframe-design.md)、[見た目](docs/superpowers/specs/2026-11-17-portfolio-visual-design.md)、[動きと Nuxt への移行](docs/superpowers/specs/2026-11-18-portfolio-motion-design.md)（食い違いは最後のものが優先）。

Nuxt 4 で全 URL を静的に書き出し（`nuxt generate`、出力は `apps/web/.output/public`）、読み込んだあとは同じ文書の中でページを移る。Hello、ヘッダー、シート、ナビバーはページを移っても作り直さない（`app/app.vue`）。

### ページと URL

| URL                                                  | 中身                                                                                               |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/`                                                  | 言語へ振り分ける（Vercel の `apps/web/vercel.json`。Vercel の外では `app/pages/index.vue` の転送） |
| `/ja/`                                               | Hello                                                                                              |
| `/ja/about`                                          | About（連絡先は `/ja/about#contact`）                                                              |
| `/ja/works/apps` ・ `career` ・ `awards` ・ `events` | Works の4分類（`/ja/works` は Apps へ転送）                                                        |
| `/ja/works/apps/<slug>`                              | Apps の詳細（スマホでは一覧の上に重なるシート）                                                    |
| `/ja/press`                                          | Press                                                                                              |

- スマホとパソコンは同じ HTML を CSS で出し分ける。境目は 1024px。
- ページは `app/pages/[locale]/`。Apps の詳細は一覧のページ（`works/[category].vue`）が描く（閉じる動きを、URL が変わったあとも見せるため）。
- `import` はすべて明示する（Nuxt の自動 import と部品の自動登録は切ってある）。Nuxt の関数は `#imports`、部品は `#components` から読む。

### 動き

- 数値は `packages/tokens/motion.ts`（ばね、閉じる判断、入れ替えの時間など）。
- 動きの仕組み（指で引く、慣性の予測、シートと詳細の状態の移り変わり、閉じたときの履歴）は `app/motion/` の素の TS。Vue、Nuxt、Motion for Vue を import しない（`test/layers.test.ts` が見張る）。画面とのつなぎは `app/composables/use-sheet.ts` と `use-detail.ts`。
- シートと詳細の位置は CSS 変数（`--sheet-progress`、`--detail-progress`）で渡し、CSS が 1024px 未満でだけ動かす。
- 選んでいる印（ナビゲーションバー、Works の分類）は `SelectionMark.vue`。Motion の `layoutId` で、押した項目へ滑らせる。
- パソコンで Apps の詳細を開閉するときは、カードのサムネイルが詳細の画像へ移る（`app/plugins/detail-morph.client.ts`。ブラウザの View Transitions）。

### ハードコードしない

`apps/web/test/no-hardcode.test.ts` が見張っている。

- **アイコン**: 操作のアイコンは `@tabler/icons-vue`（`app/components/UiIcon.vue`）、ブランドは `simple-icons`（`app/components/BrandIcon.vue`）。SVG やパスをソースに書かない。LinkedIn だけは最新版から外されたため、`simple-icons-11`（11.0.0 の別名）から読む。
- **文言**: `app/i18n/messages/ja.ts` と `en.ts` の辞書を通す。部品（`components` / `pages` / `app.vue` / `error.vue`）に日本語を書かない。鍵を足すときは両方に足す。
- **色・角丸・余白・影**: `packages/tokens/tokens.css` の `--ut-*` だけを使う。ライト（`:root`）とダーク（`prefers-color-scheme` と `[data-theme="dark"]` の2か所）をそろえて書く。Tailwind の名前（`bg-surface`、`text-muted`、`rounded-card`、`text-title-l` など）は `packages/tokens/theme.css`。
- Tailwind の `dark:` は OS 設定ではなく `[data-theme]` に連動する（`theme.css` の `@custom-variant dark`）。

### 中身を足す

`apps/web/content/<collection>/<lang>/<slug>.md` に Markdown を置く（`@nuxt/content`）。日付は `YYYY-MM` か `YYYY-MM-DD`。項目の型は `apps/web/content.config.ts`。

| コレクション | frontmatter                                                                                                                 | 本文       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `apps`       | `title`、`date`、`thumbnail?`、`initial?`、`demo?`、`github?`、`stack`（Skills のアイコン名）                               | 詳細の説明 |
| `career`     | `title`、`start`、`end?`、`summary`、`thumbnail?`、`initial?`                                                               | —          |
| `events`     | `title`、`date`、`thumbnail?`、`initial?`、`url?`                                                                           | —          |
| `awards`     | `title`、`date`、`initial?`                                                                                                 | —          |
| `press`      | `title`、`date`、`url`、`source`（`note` / `youtube` / `zenn` / `qiita` / `speakerdeck` / `other`）、`outlet`、`thumbnail?` | —          |

- 画像は `apps/web/public/works/<collection>/` に置き、`thumbnail` に `/works/<collection>/<file>` と書く（書き出し時に `@nuxt/image` が幅ごとに縮める）。無ければ頭文字（`initial` で上書きできる）か、Press では媒体のアイコンが出る。
- 英語の版が無い項目は、日本語の版が出る。

### 公開前に本人が書くもの

- About の自己紹介と「これまで」（辞書の `about.intro` と `about.history`。今は「（仮）」の文）。
- 素材に無かった Press（note、Zenn、Qiita、YouTube、Speaker Deck の記事や資料）と、「長崎のWA!」のインタビュー（URL が素材に無かった）。
- Apps の `stack`（今は空）。
- Career の終了月。素材に無かったので、インターン2件は開始月だけ、ほかは続いている扱い（「YYYY.MM –」）にしてある。

### 英語を公開する

1. `app/i18n/messages/en.ts` の文を本番の文に直す（About は今「(Draft)」）。
2. `content/*/en/` に翻訳を足す。
3. `app/i18n/config.ts` の `publishedLocales` に `"en"` を足す。ページは `[locale]` から書き出され、言語の切り替え（表示の切り替えの左）が自動で出る。
4. `apps/web/vercel.json` の `/` の振り分けを3本にする。上から順に、クッキー `ut42tech-lang` が `en` なら `/en/`、`Accept-Language` が英語で始まるなら `/en/`、それ以外は `/ja/`。

### 登場演出、あいさつ、ポインター（動きの段階2）

- **登場演出**: そのタブで最初の読み込みだけ、幕と名前が上がり、Hello では「Welcome.」が1文字ずつ上がる。
  - 見せるかどうかは `<head>` のインラインのスクリプトが決める（`app/motion/intro-gate.ts` を、そのまま文字列として埋め込む）。
  - 時間割は `app/motion/intro.ts`、始めるのは `app/plugins/intro.client.ts`。キー、ホイール、タップでその場で完成する。
  - 本体の読み込みに失敗しても、幕は 5 秒で CSS だけで消える。
  - 同じタブでもう一度見たいときは、`sessionStorage` の `ut42tech:intro` を消す。
- **あいさつ**: 「Welcome.」の文字がポインターに寄り、押すと弾む（`app/motion/greeting.ts`）。
- **ポインター**: パソコンのマウスで、押せる要素（`data-cursor="block"`）に吸い付き、要素も少し寄ってくる。[ipad-cursor](https://github.com/CatsJuice/ipad-cursor)（MIT）を、ほぼ既定の見た目のまま `app/plugins/pointer.client.ts` で始める。タッチ端末と動きを減らす設定では始めない。
- **表示の切り替え**: ライトとダークの2つ。新しい表示がボタンから円で広がり（`app/motion/theme-switch.ts`）、アイコンは [@theme-toggles/vue](https://toggles.dev)（MIT）の Classic で太陽から月へ形が変わる。

**重さ**（2026-11-18、書き出し後の gzip。中身が増えると変わる）

- `/ja/` を最初に開くとき: JavaScript が 128KB、CSS が 208KB。CSS の大半は LINE Seed JP の書体の定義。
- 書き出した JavaScript の合計: 317KB。
- ポインター（ipad-cursor）: 約 3KB。どの端末でも最初に読み込む（タッチ端末では動かさない）。
