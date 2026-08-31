# Design — Portfolio Site

本ドキュメントはポートフォリオサイトのデザイン方針・トークン・レイアウトを定義する。要件は [requirements.md](./requirements.md)、実装上の規約は [architecture.md](./architecture.md) を参照。

記述はすべて **現在の実装の実態**である。将来の予定は「将来」と明記する。

## デザイン方向性

- **Bento UI × Apple 風**
- サイズの異なる角丸タイル(Bento)を 1 画面にまとめ、情報の優先度をタイルサイズで表現する
- Apple の製品ページ(AirPods, Apple Watch 等)や Raycast / Linear の Bento セクションを参考
- **モノクロ基調**(オフホワイトと near-black)に **GitHub Green アクセント**を 1 点使い
- 余白は大きめ、ボーダーは極薄、角丸は深め(`rounded-3xl`)、ホバー時の反応は控えめ
- 「静的な板を並べる」だけにせず、**Hero のテキスト演出(BlockReveal / Marquee)と Keywords の物理シミュレーション**の 2 点だけを "動くもの" として置き、他は極力静かに保つ

### 避けるもの

- 派手なグラデーション、ネオン、発光エフェクト
- 重いパララックス、スクロールジャック
- 過剰なマイクロインタラクション
- 装飾過多のイラスト・3D モデル

## カラートークン

全ての色は **OKLCH** で定義する。Light / Dark の両モードで同じトークン名を使い、値だけを切り替える。ダークモードは純黒(`#000`)ではなく、**わずかに緑味を帯びた near-black**(GitHub dark の質感)を使用する。

実体は [`src/app/globals.css`](../src/app/globals.css)。`:root` / `.dark` に生の値を置き、`@theme inline` で `--color-*` として Tailwind に公開する二段構えになっている。

### Light モード(`:root`)

| トークン | OKLCH | 用途 |
|---|---|---|
| `--background` | `oklch(1 0 0)` | ページ背景 |
| `--foreground` | `oklch(0.145 0 0)` | 本文テキスト |
| `--card` | `oklch(1 0 0)` | Bento タイル背景 |
| `--card-foreground` | `oklch(0.145 0 0)` | タイル内テキスト |
| `--popover` | `oklch(1 0 0)` | Tooltip / Drawer 等の浮遊面 |
| `--primary` | `oklch(0.145 0 0)` | 主操作色(near-black) |
| `--primary-foreground` | `oklch(0.985 0 0)` | primary 上のテキスト |
| `--secondary` | `oklch(0.97 0 0)` | バッジ等の副次背景 |
| `--muted` | `oklch(0.97 0 0)` | 控えめな背景(サムネのプレースホルダ等) |
| `--muted-foreground` | `oklch(0.45 0 0)` | 控えめなテキスト(キャプション等) |
| `--accent` | `oklch(0.52 0.17 152)` | **GitHub Green アクセント(唯一のブランド色)** |
| `--accent-foreground` | `oklch(0.985 0 0)` | アクセント上のテキスト |
| `--destructive` | `oklch(0.577 0.245 27.325)` | 破壊的操作(現状 UI では未使用) |
| `--border` | `oklch(0.92 0 0)` | ボーダー(極薄) |
| `--input` | `oklch(0.92 0 0)` | 入力欄の境界 |
| `--ring` | `oklch(0.52 0.17 152)` | フォーカスリング |
| `--radius` | `0.75rem` | 基準半径。`--radius-sm/md/lg/xl/2xl/3xl/4xl` が `0.6x / 0.8x / 1x / 1.4x / 1.8x / 2.2x / 2.6x` と派生する |

`--primary` はモノクロ基調(light は near-black、dark は near-white)を維持する。ボタンなどデフォルトの主操作色として機能させ、green は `--accent` と `--ring` だけに留める。

### Dark モード(`.dark`)

| トークン | OKLCH | 備考 |
|---|---|---|
| `--background` | `oklch(0.14 0.008 155)` | near-black(緑味の微かなティント) |
| `--foreground` | `oklch(0.96 0 0)` | ほぼ白 |
| `--card` | `oklch(0.17 0.008 155)` | タイル背景(bg より微妙に明るい) |
| `--card-foreground` | `oklch(0.96 0 0)` | タイル内テキスト |
| `--popover` | `oklch(0.17 0.008 155)` | card と同値 |
| `--primary` | `oklch(0.96 0 0)` | near-white |
| `--primary-foreground` | `oklch(0.14 0.008 155)` | near-black |
| `--secondary` | `oklch(0.2 0.008 155)` | 副次背景 |
| `--muted` | `oklch(0.2 0.008 155)` | secondary と同値 |
| `--muted-foreground` | `oklch(0.7 0 0)` | 控えめテキスト |
| `--accent` | `oklch(0.65 0.19 150)` | Green(dark では少し明るく) |
| `--accent-foreground` | `oklch(0.14 0.008 155)` | near-black |
| `--destructive` | `oklch(0.704 0.191 22.216)` | dark 用に明るく |
| `--border` | `oklch(0.25 0.008 155)` | 極薄ボーダー |
| `--input` | `oklch(0.28 0.008 155)` | 入力欄の境界 |
| `--ring` | `oklch(0.65 0.19 150)` | フォーカスリング |

### Timeline カテゴリ色

Timeline のカテゴリ識別専用の色。**極小ドット・小さなアイコン・`/15` の淡い地色**にしか使わず、面積の大きい背景には使わない(モノクロ基調を崩さないため)。`--color-cat-*` として `bg-cat-life` / `text-cat-work` のように参照する。

| トークン | Light | Dark | 色味 |
|---|---|---|---|
| `--cat-life` | `oklch(0.7 0.15 70)` | `oklch(0.78 0.14 75)` | amber |
| `--cat-education` | `oklch(0.58 0.13 250)` | `oklch(0.7 0.12 250)` | blue |
| `--cat-work` | `oklch(0.55 0.15 300)` | `oklch(0.68 0.14 300)` | violet |
| `--cat-event` | `oklch(0.52 0.17 152)` | `oklch(0.65 0.19 150)` | brand green(アクセントと同値) |
| `--cat-other` | `oklch(0.55 0 0)` | `oklch(0.7 0 0)` | gray |

### `globals.css` の骨格

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  /* セマンティックトークンを --color-* として公開 */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* … card / popover / primary / secondary / muted / accent / destructive / border / input / ring … */

  /* Timeline カテゴリ識別用の極小ドット専用色（地色には使わない） */
  --color-cat-life: var(--cat-life);
  --color-cat-education: var(--cat-education);
  --color-cat-work: var(--cat-work);
  --color-cat-event: var(--cat-event);
  --color-cat-other: var(--cat-other);

  --font-sans: var(--font-sans);       /* next/font の LINE Seed JP 変数と接続 */

  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  --aspect-photo: 4 / 3;               /* PhotoTile の aspect-photo */
}

:root { /* Monochrome base + accent green + カテゴリ色 + --radius: 0.75rem */ }
.dark { /* Near-black with a faint green tint — GitHub dark feel */ }

@layer base {
  * { @apply border-border outline-ring/50; }
  html { @apply font-sans antialiased; }
  body { @apply bg-background text-foreground; }
}
```

末尾に Hero 用の CSS アニメーションを 1 つだけ定義している(詳細は[モーション](#モーション))。

Tailwind v4 なので設定ファイル(`tailwind.config.*`)は持たず、**`globals.css` の `@theme inline` が唯一の設定源**である。Biome では `@theme` / `@custom-variant` / `@apply` を通すために `suspicious.noUnknownAtRules` を off にしている。

## タイポグラフィ

### フォントファミリー

- **LINE Seed JP**(`next/font/google` の `LINE_Seed_JP`)を CSS 変数 `--font-sans` として読み込み、`html` に `font-sans` を当てる
- 英語・日本語とも同じファミリーを使用
- `display: "swap"`、fallback は `system-ui, -apple-system, 'Hiragino Sans', 'Yu Gothic', sans-serif`
- 追加の Web フォントは読み込まない。OG 画像([`src/app/opengraph-image.tsx`](../src/app/opengraph-image.tsx))も外部フォントを取らず、`ImageResponse` デフォルトの sans に任せる(日本語もレンダリング可能)

### ウェイト

読み込むウェイトは以下 3 段階だけに絞る:

| ウェイト | クラス | 用途 |
|---|---|---|
| **400** Regular | `font-normal` | 本文・説明文 |
| **700** Bold | `font-bold` | 見出し・強調・カードタイトル |
| **800** ExtraBold | `font-extrabold` | Hero の名前、ページ `<h1>`、セクション `<h2>` |

`font-medium` / `font-semibold` を書いている箇所があるが、実ファイルに 500 / 600 は無いため**ブラウザが 400 または 700 に丸める**。意図的な太さの差は 400 / 700 / 800 の 3 段階だけで設計する。

### スケール(実装で使っている組み合わせ)

| 用途 | クラス | 実例 |
|---|---|---|
| ページのラベル(eyebrow) | `text-xs font-medium uppercase tracking-widest text-muted-foreground` | `/blogs` の `Blog`、`/press` の `Press` |
| ページ見出し(`<h1>`) | `text-3xl md:text-4xl font-extrabold tracking-tight` | `/blogs` の「記事一覧」、`/press` の「掲載一覧」 |
| 404 見出し | `text-4xl md:text-5xl font-extrabold tracking-tight` | `not-found.tsx` |
| Hero の名前(`<h1>`) | `text-2xl md:text-4xl font-extrabold tracking-tight` | `HeroTile` |
| Hero のモットー | `text-xl md:text-2xl font-bold leading-relaxed` | `Marquee` を包む要素 |
| 大セクション見出し(`<h2>`) | `text-2xl font-extrabold tracking-tight` | Works / Projects / Timeline |
| タイル見出し(`<h2>`) | `text-lg font-bold` | Keywords / Tech Stack / Contact / Press / Latest Blog |
| カードタイトル(`<h3>`) | `text-base font-bold leading-snug` | ProjectCard / WorkCard / Timeline |
| 小カードタイトル(`<h3>`) | `text-sm font-bold leading-snug line-clamp-2` | PressCard / BlogCard |
| 本文 | `text-sm` | カードの summary / excerpt |
| キャプション・メタ | `text-xs text-muted-foreground` | 日付、outlet、件数 |
| 数値の桁揃え | `tabular-nums` | Timeline の年・件数、`{n} commits · YYYY–YYYY` |

見出しは Bento の中でも `<h1>` は Hero の 1 つだけ、各タイルは `<h2>`、カードは `<h3>` という階層を守る。

## Bento レイアウト

### ブレークポイント戦略

- **Mobile**(`< md`): **2 カラム**。ほとんどのタイルは `col-span-2`(=全幅)で縦積みし、小さい写真 2 枚だけ `col-span-1` で横並びにする
- **Desktop**(`md:` 以上): **6 カラム**のグリッド。行数は固定せず `grid-flow-row-dense` で流し込む
- ページ幅は全ページ共通で `mx-auto max-w-6xl px-6 py-16`

モバイルを 1 カラムではなく 2 カラムにしているのは、写真タイルを半幅 2 枚で並べるため。可変高の Contact と写真を同じ行に混ぜると `h-full` で写真が不揃いにクロップされるので、**Contact と大きい写真は全幅、小さい写真 2 枚だけ半幅**という並びに整理している(実装コメントに経緯あり)。

### トップページのタイル配置

`md:` 以上の 6 カラムでの並び。

```
┌──────────────────────────────────────────────────────────┐
│  Hero                                            (6×2)   │
│                                                          │
├────────────────────────────────┬─────────┬───────────────┤
│  Keywords                (4×2) │ TechSt. │ Contact       │
│  (matter-js の物理ピル雲)      │  (2×1)  │  (2×1)        │
│                                ├─────────┼───────────────┤
│                                │ Photo   │ Photo         │
│                                │ 長崎H.  │ タージ・マハル│
├────────────────────────────────┴─────────┼───────────────┤
│  Press (teaser · 最新3件)          (4×1) │ Photo アユタヤ│
│                                          │               │
├──────────────────────────────────────────┼───────────────┤
│                                          │ Blog (teaser) │
│                                          │  最新3件 (2×1)│
├──────────────────────────────────────────┴───────────────┤
│  Works                                           (6×1)   │
├──────────────────────────────────────────────────────────┤
│  Projects                                        (6×1)   │
├──────────────────────────────────────────────────────────┤
│  Timeline                                        (6×1)   │
└──────────────────────────────────────────────────────────┘
```

図は `grid-flow-row-dense` による最終的な見え方の目安。**正しい順序と span は下表**(= [`src/app/page.tsx`](../src/app/page.tsx) の DOM 順)。

| # | タイル | className(実値) | 表示内容 |
|---|---|---|---|
| 1 | **HeroTile** | `col-span-2 md:col-span-6 md:row-span-2` | 顔写真、`Hello 👋`、名前、`#ロールタグ` 4 つ、モットーのマーキー、右サイドバーに所属・研究室・肩書き 5 件 |
| 2 | **KeywordsTile** | `col-span-2 md:col-span-4 md:row-span-2` | キーワード 37 個のピル雲(物理シミュレーション) |
| 3 | **TechStackTile** | `col-span-2 md:col-span-2` | 技術スタック 32 件のバッジ |
| 4 | **ContactTile** | `col-span-2 md:col-span-2` | SNS リンク 7 件 |
| 5 | **PhotoTile**(長崎ハッカソン) | `col-span-2 md:col-span-2` | 写真 + タップでキャプション |
| 6 | **PhotoTile**(タージ・マハル) | `col-span-1 md:col-span-2` | 同上 |
| 7 | **PhotoTile**(アユタヤ) | `col-span-1 md:col-span-2` | 同上 |
| 8 | **PressTeaserTile** | `col-span-2 md:col-span-4` | 掲載記事 最新 3 件 + `/press` への View all |
| 9 | **BlogTeaserTile** | `col-span-2 md:col-span-2` | ブログ 最新 3 件 + `/blogs` への View all |
| 10 | **WorksSection** | `col-span-2 md:col-span-6` | Works カード 3 カラムグリッド |
| 11 | **ProjectsSection** | `col-span-2 md:col-span-6` | Projects カード 3 カラムグリッド |
| 12 | **Timeline カード** | `col-span-2 md:col-span-6` | `<h2>Timeline</h2>` + `{n} commits · YYYY–YYYY` + git-graph 風の年表 |

写真タイル 3 つは `profile.photos` が空なら描画されない(条件付きレンダリング)。Works / Projects は `WorksSection` / `ProjectsSection` 自身が Server Component としてデータを取りに行くため、`page.tsx` は span を与えるだけ。

### グリッド実装

```tsx
<section className="mx-auto max-w-6xl px-6 py-16">
  <BentoMotionContainer className="grid grid-flow-row-dense grid-cols-2 gap-4 md:grid-cols-6">
    <BentoTileMotion className="col-span-2 md:col-span-6 md:row-span-2">
      <HeroTile className="h-full" />
    </BentoTileMotion>
    {/* … 以下同様に BentoTileMotion で包み、中身には必ず h-full を渡す … */}
  </BentoMotionContainer>
</section>
```

- グリッドの直下に置くのは **`BentoTileMotion`(モーションラッパー)**で、span は必ずこのラッパー側に付ける
- 中身のタイルには **例外なく `className="h-full"`** を渡し、同じ行のタイル高さを揃える
- `grid-flow-row-dense` により、高さの違うタイルが生む隙間を後続タイルが埋める
- `md:grid-rows-*` による行数の固定はしない(タイル数が増減しても崩れないようにするため)

### 下層ページのレイアウト

`/blogs` と `/press` は Bento ではなく単純なカードグリッド。どちらも `mx-auto max-w-6xl px-6 py-16` の中に、`<header className="mb-10 flex flex-col gap-2">`(eyebrow ラベル + `<h1>` + 説明文)と `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3` の一覧を置く。ヘッダと一覧はそれぞれ `FadeIn` / `FadeIn delay={0.05}` で包む。`/blogs` はさらに一覧の前にプラットフォームフィルタが入る。

一覧が 0 件のときは必ずプレースホルダ文を出す(「記事はまだありません。」など)。`/blogs` は 0 件時に各プラットフォームのプロフィールへのリンクを添える。

## タイル共通スタイル

Bento タイルは shadcn `<Card>` をベースに、以下を共通クラスとして当てる:

```
rounded-3xl border-border bg-card p-6 md:p-8
```

これを満たすのは Keywords / TechStack / Contact / PressTeaser / BlogTeaser / Works / Projects / Timeline。例外は次の 2 つ:

- **HeroTile**: `rounded-3xl border-border bg-card p-8 md:p-12`(主役なので余白を一段深く)
- **PhotoTile**: `relative aspect-photo overflow-hidden rounded-3xl border-border p-0`(画像フルブリードのため padding なし、`--aspect-photo: 4 / 3` で高さを固定)

要素別の補足:

- **半径**: `rounded-3xl` で Apple 風の深めの角丸(`--radius 0.75rem × 2.2 ≈ 1.65rem`)。**タイルは `rounded-3xl`、タイル内のカード(ProjectCard / WorkCard / PressCard / BlogCard)は `rounded-2xl`** と 1 段階落として入れ子の階層を出す。ティーザータイル内の小さなリスト項目はさらに 1 段階落として `rounded-xl`
- **ボーダー**: `border-border` の極薄 1px。`@layer base` の `* { @apply border-border }` があるので色指定だけで足りる
- **背景**: `bg-card`(light では白、dark では bg より微妙に明るい near-black)
- **パディング**: mobile `p-6`、desktop `p-8`
- **影**: 使わない。Apple 風は影に頼らず、ボーダーと背景差で奥行きを出す
- **内側のギャップ**: 見出し + リストのタイルは `gap-4`、セクション級(Works / Projects / Timeline)は `gap-6`

### フォーカスリング

キーボードフォーカスは必ず可視化する。定型は:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
```

`ring-offset-background` まで書くのは、dark モードでオフセットが白く抜けるのを防ぐため。カード内側にリングを出したい場合(PhotoTile)は `focus-visible:ring-inset` を使う。

## カード共通仕様

一覧に並ぶカードは 4 種類ある。**ProjectCard / WorkCard / PressCard / BlogCard** で、いずれも「フルブリードのサムネイル + 本文ブロック」という同じ骨格を共有する。

### 共通

- ルートは `group` を持ち、`overflow-hidden rounded-2xl` + `flex h-full flex-col`。グリッドの行内で高さが揃う
- **サムネイルはフルブリード**(左右に余白を作らない)。`relative … overflow-hidden` のボックスに敷き、画像は `object-cover`
- ホバー演出は**画像のごく僅かな拡大**のみ:
  ```
  object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105
  ```
  `motion-safe:` が付いているので `prefers-reduced-motion: reduce` では拡大が起きない
- サムネイルが無い場合はプレースホルダを描く。**背景は `bg-gradient-to-br from-accent/10 via-muted to-secondary`、中央に種別アイコン**(唯一の例外は BlogCard で、プラットフォームのブランド色を地色にする)
- 本文ブロックは `flex flex-1 flex-col … p-4`。タイトルとサマリは `line-clamp` で行数を固定する
- 外部リンクは `target="_blank"` + `rel`。現状は `noreferrer`(ProjectCard / WorkCard / PressCard)と `noopener noreferrer`(BlogCard)が混在しているが、**新規追加時は `noopener noreferrer` に寄せる**([architecture.md](./architecture.md) の「アクセシビリティ」規約)

### 種別ごとの差分

| | ProjectCard | WorkCard | PressCard | BlogCard |
|---|---|---|---|---|
| ラッパー | `<div>`(リンクはサムネ上のボタン) | `work.url` があれば `<a>`、無ければ `<div>` | `<a>` | `<a>` |
| 面の実装 | プレーン `div` + `bg-background` | プレーン `div` + `bg-background` | `<Card>` + `bg-card` | `<Card>` + `bg-card` |
| サムネ比 | `aspect-video`(16:9) | `aspect-video`(16:9) | `aspect-[1.91/1]`(OGP 比) | `aspect-[1.91/1]`(OGP 比) |
| 画像 | `next/image` | `next/image` | `next/image` | `<img>`(外部の可変ホストのため) |
| プレースホルダ | `Rocket` | `Sparkles` | `Newspaper` + outlet 名 | ブランド色地 + プラットフォームアイコン |
| ホバー | リンクボタンが `hover:bg-accent` | `hover:border-accent` | `group-hover:border-accent` | `group-hover:border-accent` |
| メタ | タグバッジ | なし | outlet ・ 日付 ・ excerpt | プラットフォーム名 ・ 日付 ・ ♥ ・ タグ |

比率が 2 系統(`aspect-video` / `aspect-[1.91/1]`)に分かれているのは意図的で、**自作コンテンツ(Projects / Works)は 16:9 のスクリーンショット前提、外部記事(Press / Blog)は OGP 画像前提**だから。

`next/image` を使えるのは [`next.config.ts`](../next.config.ts) の `remotePatterns` で許可した `images.microcms-assets.io` だけで、ホストが不定な Zenn / note のサムネは BlogCard だけ素の `<img>` を使う。使い分けの規約そのものは [architecture.md](./architecture.md) の「画像」節が正。

### ProjectCard 固有

- **タグ**: `project.tags` があれば `<ul>` に `<Badge variant="secondary">` で並べる
- **リンク**: `LinkKind` 6 種すべてにアイコンを割り当て、サムネ右上(`absolute right-2 top-2`)に `size-8` の丸ボタンとして重ねる

  | kind | アイコン | 出典 |
  |---|---|---|
  | `github` | `SiGithub` | simple-icons |
  | `demo` | `Link` | lucide |
  | `paper` | `FileText` | lucide |
  | `slide` | `Presentation` | lucide |
  | `article` | `Newspaper` | lucide |
  | `other` | `ExternalLink` | lucide |

- 並び順は `LINK_ORDER`(github → demo → paper → slide → article → other)で固定し、microCMS 側の並びに依存させない
- 各リンクには `aria-label={\`${project.title} の ${link.label}\`}` を付ける

WorkCard はタグもリンク配列も持たない(`Work` 型に無い)。単一の `url` があればカード全体がリンクになる。

## Tailwind クラスの規約

色は必ず `bg-card` / `text-muted-foreground` / `border-border` / `text-accent` / `ring-ring` / `bg-cat-work` などのトークンで指定し、**生の hex / oklch を className に書かない**。className のマージは `cn()`(`twMerge(clsx())`)で行う。

arbitrary value の許容 4 類型と、`style` 属性で色を渡してよい 3 ファイルは、コード規約として [architecture.md](./architecture.md) の「コーディング規約 › スタイリング」に一本化してある(使用箇所の一覧もそちら)。**ここでは繰り返さない。新しいクラスを足す前に必ずそちらを読むこと。**

### レスポンシブ

ブレークポイントは **`md:` を主軸**にし、次の 2 パターンに収束させる。ページ幅は全ページ共通で `mx-auto max-w-6xl px-6 py-16`。

- カード一覧: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`(`/press`・`/blogs`・Works / Projects セクション)
- Bento: `grid grid-flow-row-dense grid-cols-2 gap-4 md:grid-cols-6`(トップのみ)

## モーション

### ライブラリと import

```ts
import { motion, useReducedMotion } from "motion/react";
```

`motion` パッケージ(旧 framer-motion)を `motion/react` から import する。Easing は Apple 的な ease-out `[0.22, 1, 0.36, 1]` を全箇所で共通に使う。

### 実装されている演出

| 演出 | コンポーネント | 内容 |
|---|---|---|
| Bento の stagger 登場 | `motion/bento-tile-motion.tsx` | `BentoMotionContainer` が `staggerChildren: 0.08` / `delayChildren: 0.05`、`BentoTileMotion` が `opacity 0→1` + `y 24→0`、`duration: 0.7` |
| 汎用フェードイン | `motion/fade-in.tsx` | `opacity 0→1` + `y 16→0`、`duration: 0.6`、`delay` を props で受ける。`/blogs` のヘッダと本文で使用 |
| Hero のブロックリビール | `bento/block-reveal.tsx` | テキストと同色のバーが「左→右へ伸びて覆い、左→右へ縮んで抜ける」2 段スイープ。名前は `delay 0.12`、ロールタグは `0.26 + i * 0.08` で順次 |
| Hero のマーキー | `bento/marquee.tsx` | モットー(日 / 英)を左へ無限スクロール。同じ並びを 2 コピーして `x: 0% → -50%`、`ease: "linear"`、既定 18 秒。左右端は mask グラデーションでフェード |
| Hero のフェードイン(CSS) | `globals.css` の `.hero-reveal` | `opacity 0→1` + `translateY(0.5rem)→0` を 0.7s / `cubic-bezier(0.22, 1, 0.36, 1)`。開始を `style={{ animationDelay }}` でずらす(モットー行 600ms、サイドバー 480ms)。JS 不要で必ず表示され切る |
| Keywords の物理シミュレーション | `bento/keywords-tile.tsx` | 下記参照 |
| Timeline の行フェードイン | `home/timeline.tsx` | `whileInView` + `viewport: { once: true, amount: 0.3 }`、`duration: 0.5` |
| カードのサムネ拡大 | 各カード | `motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105` |

### Keywords タイルの物理シミュレーション

Keywords はキーワードのピルを **matter-js** で漂わせる。方針は次の通り:

- **無重力**(`engine.gravity = 0`)。ピルは落ちず、画面内に浮かぶ
- 各ピルには毎フレーム **微風**(`0.00004 * mass` のランダム力)と **中心へのごく弱い引力**(`0.0000006 * mass`)を加える。散らばらず中央にまとまった雲になる
- 衝突ボックスはピルより `SPACE = 18` だけ大きく作り、ピル同士に視覚的な余白を持たせる。`inertia: Infinity` で回転を止め、ピルは常に水平に保つ
- **ドラッグは `pointer: fine`(マウス)のときだけ**有効にする。タッチ環境で `MouseConstraint` を付けるとページスクロールを奪ってしまうため
- `matter-js` はバンドルを膨らませないよう `useEffect` 内の **動的 import**(`import("matter-js")`)で読み込む
- 初期配置はアルキメデス螺旋による貪欲配置([`keywords-layout.ts`](../src/components/bento/keywords-layout.ts))。物理を含まない純粋関数なので Vitest で「重なりゼロ」「枠内に収まる」を検証している
- SSR / マウント前は座標計算をせず、`flex flex-wrap` の素直なピル並びをフォールバックとして描く(ハイドレーション安全)

### reduced-motion

**モーションを持つすべてのコンポーネントが `prefers-reduced-motion` に対応している。** 手段は 3 系統:

1. **JS**: `useReducedMotion()` を見て挙動を分岐 — `BentoMotionContainer`(stagger を外す)、`BentoTileMotion`(`hidden` を可視状態にし `duration: 0`)、`FadeIn`(`initial` を `false`)、`BlockReveal`(素の `<span>` を返しバーも描かない)、`Marquee`(静止した 1 行を表示)、`Timeline`(`whileInView` を外す)
2. **CSS**: `motion-safe:` プレフィクス(カードのサムネ拡大)と `@media (prefers-reduced-motion: no-preference)` ガード(`.hero-reveal`)
3. **matchMedia**: `keywords-tile.tsx` が `window.matchMedia("(prefers-reduced-motion: reduce)")` を直接見て、初速も微風も与えない(レイアウト位置のまま静止)

新しく演出を追加するときは、この 3 系統のいずれかで必ず低減設定を尊重すること。

### 入れないもの

- 派手なパララックス、スクロールハイジャック
- 自動再生動画
- ページ遷移アニメーション(`template.tsx` は置いていない)

## アクセシビリティ

### 必須事項

- **WCAG 2.1 AA** レベルを目標
- コントラスト比: 本文 4.5:1 以上、大きな文字 3:1 以上。ダークモードでも同等
- **キーボードナビゲーション**: 全てのインタラクティブ要素が Tab 移動可能、フォーカスリングが常に可視
- **スキップリンク**: `layout.tsx` の先頭に `#main` へ飛ぶ `sr-only focus:not-sr-only` のリンクを置き、`<main id="main">` を対象にする
- **セマンティック HTML**: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, リストは `<ul>` / `<ol>` を適切に使う
- **見出し階層**: `<h1>` はページに 1 つ、`<h2>` → `<h3>` の順序を守る(Bento では Hero が `<h1>`、各タイルが `<h2>`、カードが `<h3>`)
- **画像の代替テキスト**: 装飾画像・カードのサムネは `alt=""`、意味のある画像(プロフィール、PhotoTile)は内容を説明する `alt`
- **アイコンのみのボタン**: `aria-label` を必ず付ける(MobileNav の「メニューを開く」、ProjectCard の各リンク、PhotoTile のキャプション開閉)
- **装飾要素**: `aria-hidden` を付けて読み上げから外す(Timeline のドット、Marquee の可視レイヤー、箇条書きの丸)
- **`<html lang="ja">`**: 現状は日本語固定。将来の多言語化方針は [architecture.md](./architecture.md) を参照
- **reduced-motion**: [モーション](#reduced-motion)の節の通り、全演出が対応済み

### フィルタ UI の定型

`/blogs` のプラットフォームフィルタと Timeline のカテゴリフィルタは**同じ形**で組む:

```tsx
<fieldset aria-label="…フィルター" className="flex flex-wrap gap-2 border-none p-0">
  <button type="button" aria-pressed={active} onClick={…}>…</button>
</fieldset>

<ul aria-live="polite">…</ul>   {/* 結果リスト。Timeline は <ol> */}
```

- グループには `<fieldset aria-label>`、各ボタンには `aria-pressed`
- 絞り込み結果のリストには `aria-live="polite"` を付け、件数の変化を読み上げさせる
- Timeline のフィルタは 0 件のカテゴリを出さず、件数バッジを併記する

### 音声読み上げ向けの個別対応

- **Marquee**: 正規テキストを `sr-only` に 1 度だけ置き、動く側は `aria-hidden`。同じ文言を 2 度読ませない
- **PhotoTile**: キャプションの開閉ボタンに `aria-expanded`、キャプションが無い写真はボタンを `disabled` にする
- **BlockReveal**: DOM 上にテキストは常に存在するので、クローラ・スクリーンリーダーからは演出前でも読める

### ダークモード時の注意

- light/dark 切替時にチラつかないよう `disableTransitionOnChange`(next-themes)を有効化。既定は `defaultTheme="system"` + `enableSystem`
- `<html suppressHydrationWarning>` を付けて初回 hydration の警告を抑制
- ThemeToggle は `mounted` ステートでガードし、マウント前は `disabled` の `Sun` アイコンを出して SSR と CSR の表示ズレを防ぐ

### 工事中バナー

`site.underConstruction`(現在 `true`)が立っている間、`layout.tsx` はヘッダの上に `<output className="block bg-accent …">` のバナーを表示する。`<output>` を使うのは、ページの状態を伝える動的な告知として支援技術に扱わせるため。公開後にフラグを `false` にすればバナーごと消える。
