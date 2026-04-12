# Design — Portfolio Site

本ドキュメントはポートフォリオサイトのデザイン方針・トークン・レイアウトを定義する。要件は [requirements.md](./requirements.md)、実装上の規約は [architecture.md](./architecture.md) を参照。

## デザイン方向性

- **Bento UI × Apple 風**
- サイズの異なる角丸タイル(Bento)を 1 画面にまとめ、情報の優先度をタイルサイズで表現する
- Apple の製品ページ(AirPods, Apple Watch 等)や Raycast / Linear の Bento セクションを参考
- **モノクロ基調**(オフホワイトと near-black)に **GitHub Green アクセント**を 1 点使い
- 余白は大きめ、ボーダーは極薄、角丸は深め(`rounded-3xl`)、ホバー時の反応は控えめ

### 避けるもの

- 派手なグラデーション、ネオン、発光エフェクト
- 重いパララックス、スクロールジャック
- 過剰なマイクロインタラクション
- 装飾過多のイラスト・3D モデル

## カラートークン

全ての色は **OKLCH** で定義する。Light / Dark の両モードで同じトークン名を使い、値だけを切り替える。ダークモードは純黒(`#000`)ではなく、わずかに青みを帯びた **near-black** を使用する。

### Light モード(`:root`)

| トークン | OKLCH | 用途 |
|---|---|---|
| `--background` | `oklch(1 0 0)` | ページ背景 |
| `--foreground` | `oklch(0.145 0 0)` | 本文テキスト |
| `--muted` | `oklch(0.97 0 0)` | 控えめな背景(副次要素) |
| `--muted-foreground` | `oklch(0.45 0 0)` | 控えめなテキスト(キャプション等) |
| `--border` | `oklch(0.92 0 0)` | ボーダー(極薄) |
| `--card` | `oklch(1 0 0)` | Bento タイル背景 |
| `--card-foreground` | `oklch(0.145 0 0)` | タイル内テキスト |
| `--accent` | `oklch(0.52 0.17 152)` | **GitHub Green アクセント** |
| `--accent-foreground` | `oklch(0.985 0 0)` | アクセント上のテキスト |
| `--ring` | `oklch(0.52 0.17 152)` | フォーカスリング |
| `--radius` | `0.75rem` | 基準半径。shadcn の scale で `--radius-sm/md/lg/xl/2xl/3xl` が `0.6x / 0.8x / 1x / 1.4x / 1.8x / 2.2x` と派生する |

`--primary` は shadcn 規約に従いモノクロ基調(light は near-black、dark は near-white)を維持する。ボタンなどデフォルトの主操作色として機能させ、green は `--accent` と `--ring` だけに留める。

### Dark モード(`.dark`)

| トークン | OKLCH | 備考 |
|---|---|---|
| `--background` | `oklch(0.14 0.008 155)` | near-black（緑味の微かなティント） |
| `--foreground` | `oklch(0.96 0 0)` | ほぼ白 |
| `--muted` | `oklch(0.2 0.008 155)` | 副次背景 |
| `--muted-foreground` | `oklch(0.7 0 0)` | 控えめテキスト |
| `--border` | `oklch(0.25 0.008 155)` | 極薄ボーダー |
| `--card` | `oklch(0.17 0.008 155)` | タイル背景(bg より微妙に明るい) |
| `--card-foreground` | `oklch(0.96 0 0)` | タイル内テキスト |
| `--accent` | `oklch(0.65 0.19 150)` | Green（dark では少し明るく） |
| `--accent-foreground` | `oklch(0.14 0.008 155)` | near-black |
| `--ring` | `oklch(0.65 0.19 150)` | フォーカスリング |

### `globals.css` スケルトン

実際のファイルは [`src/app/globals.css`](../src/app/globals.css) を参照。shadcn init が生成するスケルトンをベースに、本ドキュメントのカラー値と `--radius` を上書きする形で維持する。骨格は以下:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  /* shadcn が使う全セマンティックトークンを --color-* として公開 */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --font-sans: var(--font-sans);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.145 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.45 0 0);
  --accent: oklch(0.52 0.17 152);        /* GitHub green */
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0 0);
  --input: oklch(0.92 0 0);
  --ring: oklch(0.52 0.17 152);
  --radius: 0.75rem;
}

.dark {
  --background: oklch(0.14 0.008 155);    /* near-black with green tint */
  --foreground: oklch(0.96 0 0);
  --card: oklch(0.17 0.008 155);
  --card-foreground: oklch(0.96 0 0);
  --popover: oklch(0.17 0.008 155);
  --popover-foreground: oklch(0.96 0 0);
  --primary: oklch(0.96 0 0);
  --primary-foreground: oklch(0.14 0.008 155);
  --secondary: oklch(0.2 0.008 155);
  --secondary-foreground: oklch(0.96 0 0);
  --muted: oklch(0.2 0.008 155);
  --muted-foreground: oklch(0.7 0 0);
  --accent: oklch(0.65 0.19 150);         /* dark 側は少し明るく */
  --accent-foreground: oklch(0.14 0.008 155);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(0.25 0.008 155);
  --input: oklch(0.28 0.008 155);
  --ring: oklch(0.65 0.19 150);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  html { @apply font-sans antialiased; }
  body { @apply bg-background text-foreground; }
}
```

## タイポグラフィ

### フォントファミリー

- **LINE Seed JP**(Google Fonts 経由、`next/font/google` の `LINE_Seed_JP` 関数で読み込み)
- 英語・日本語とも同じファミリーを使用
- Fallback: `sans-serif`(日本語グリフが正しく出ない場合は `'Hiragino Sans'`, `'Yu Gothic'` を追加検討)

### ウェイト

使用するウェイトは以下 3 段階に絞る:

| ウェイト | 用途 |
|---|---|
| **400** Regular | 本文・説明文 |
| **700** Bold | 見出し・強調 |
| **800** ExtraBold | Hero の大きな名前表示 |

### スケール(Tailwind 標準クラス)

| 用途 | クラス | サイズ |
|---|---|---|
| Hero 名前 | `text-5xl md:text-7xl font-extrabold` | 3rem〜4.5rem |
| セクション見出し | `text-2xl md:text-3xl font-bold` | 1.5〜1.875rem |
| タイル見出し | `text-lg font-bold` | 1.125rem |
| 本文 | `text-base` | 1rem |
| キャプション | `text-sm text-muted-foreground` | 0.875rem |

## Bento レイアウト

### ブレークポイント戦略

- **Mobile**(`< md`): 1 カラムで縦積み
- **Desktop**(`md:` 以上): 6 カラム × 4 行の Bento グリッド

### トップページのタイル配置

```
┌─────────────────────────────────────────────┐
│  Hero                        (6×2)          │
│                                              │
├────────────────────────┬─────────┬──────────┤
│  About          (4×2)  │ Tech    │ Contact  │
│                        │ (2×1)   │ (2×1)    │
│                        ├─────────┴──────────┤
│                        │  (※Tech/Contact    │
│                        │    は縦 1 段)      │
├────────────────────────┴────────────────────┤
│  Featured Works              (6×1)          │
└─────────────────────────────────────────────┘
```

| タイル | Desktop スパン | 表示内容 |
|---|---|---|
| **Hero** | `md:col-span-6 md:row-span-2` | 名前、肩書き、一行紹介 |
| **About** | `md:col-span-4 md:row-span-2` | 自己紹介文、所属、研究領域 |
| **TechStack** | `md:col-span-2 md:row-span-1` | 主要技術のアイコン(lucide-react) |
| **Contact** | `md:col-span-2 md:row-span-1` | SNS リンク群 |
| **Featured** | `md:col-span-6 md:row-span-1` | 代表的な Works 2〜3 件の横並びカード |

### グリッド実装(Tailwind 標準クラスのみ)

```tsx
<section className="mx-auto max-w-6xl px-6 py-16">
  <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-4">
    <HeroTile      className="md:col-span-6 md:row-span-2" />
    <AboutTile     className="md:col-span-4 md:row-span-2" />
    <TechStackTile className="md:col-span-2 md:row-span-1" />
    <ContactTile   className="md:col-span-2 md:row-span-1" />
    <FeaturedTile  className="md:col-span-6 md:row-span-1" />
  </div>
</section>
```

arbitrary value は一切使っていない。全て Tailwind 標準スケール内。

## タイル共通スタイル

全ての Bento タイルは shadcn `<Card>` をベースに、以下の共通クラスを当てる:

```
rounded-3xl border border-border bg-card p-6 md:p-8
```

要素別の補足:

- **半径**: `rounded-3xl` で Apple 風の深めの角丸。shadcn の scale により `--radius(0.75rem) × 2.2 ≈ 1.65rem`
- **ボーダー**: `border border-border` で極薄の 1px
- **背景**: `bg-card`(light では白、dark では bg より微妙に明るい near-black)
- **パディング**: mobile `p-6`、desktop `p-8`
- **影**: 使わない(Apple 風は影に頼らず、ボーダーと背景差で奥行きを出す)
- **ホバー**: Works カードなど操作可能なタイルのみ `transition-colors hover:bg-muted` 程度

### フォーカスリング

キーボードフォーカスは必ず可視化する:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

## モーション

### ライブラリと import

```ts
import { motion } from 'motion/react';
```

### 基本原則

- **Apple 的な ease-out** を基調とする(動きの最後でゆっくり減速)
- 初回ロード時: Bento タイルを **fade-in + 下から軽く上昇**、stagger で順次出現
- ホバー・クリックの反応は最小限(明確なフィードバックが必要な場所のみ)
- **派手なパララックス、スクロールハイジャック、自動再生動画は入れない**

### Easing 値

motion の props で渡す(arbitrary 値の CSS クラスを書かないため):

```ts
const easeOutApple = [0.22, 1, 0.36, 1] as const;
```

### 初回フェードイン(タイル共通)

```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: easeOutApple, delay: index * 0.08 }}
>
```

- `duration: 0.6`、stagger `0.08s` 間隔
- reduced-motion ユーザー向けに `useReducedMotion()` で無効化する

## アクセシビリティ

### 必須事項

- **WCAG 2.1 AA** レベルを目標
- コントラスト比: 本文 4.5:1 以上、大きな文字 3:1 以上。ダークモードでも同等
- **キーボードナビゲーション**: 全てのインタラクティブ要素が Tab 移動可能、フォーカスリングが常に可視
- **セマンティック HTML**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` を適切に使う
- **見出し階層**: `<h1>` はページに 1 つ、`<h2>` → `<h3>` の順序を守る
- **画像の代替テキスト**: 装飾画像は `alt=""`、意味のある画像は日英両方で適切な `alt`
- **アイコンのみのボタン**: `aria-label` を必ず付ける(例: ThemeToggle の Sun/Moon アイコン)
- **`<html lang>` 属性**: 現在の locale に同期
- **reduced-motion**: `prefers-reduced-motion` に従ってアニメーションを無効化

### ダークモード時の注意

- light/dark 切替時にチラつかないよう `disableTransitionOnChange`(next-themes)を有効化
- `<html suppressHydrationWarning>` を付けて初回 hydration の警告を抑制
- ThemeToggle は `mounted` ステートでガードし、SSR と CSR の表示ズレを防ぐ
