# Design — Portfolio Site

本ドキュメントはポートフォリオサイトのデザイン方針・トークン・レイアウトを定義する。要件は [requirements.md](./requirements.md)、実装上の規約は [architecture.md](./architecture.md) を参照。

## デザイン方向性

- **モバイルファースト × 低装飾のモノクロ**(詳細は [モバイルファースト・リニューアル設計書](./superpowers/specs/2026-11-03-mobile-first-renewal-design.md) §2)
- 1 カラムの縦スクロール。幅 375px のスマホで開く「名刺代わり」の読者を最優先し、数秒で誰かが伝わることを重視する
- **カード(枠・背景付きの箱)を原則使わない。** 情報の優先度は文字サイズ・太さ・余白・色の濃淡で表す。例外は Highlights の横スワイプカードのみ
- **モノクロ基調**(オフホワイトと near-black)に **GitHub Green アクセント**を 1 点だけ使う
- 余白は大きめ、区切りは細い罫線、ホバー時の反応は控えめ

### 避けるもの

- カードやタイルの多用(Bento 型の箱組みレイアウトは廃止済み)
- 派手なグラデーション、ネオン、発光エフェクト
- 重いパララックス、スクロールジャック
- 過剰なマイクロインタラクション
- 装飾過多のイラスト・3D モデル、物理演算などの重い演出

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
| `--card` | `oklch(1 0 0)` | shadcn の Card 背景(Press カードなど限られた箇所のみ) |
| `--card-foreground` | `oklch(0.145 0 0)` | Card 内テキスト |
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
| `--card` | `oklch(0.17 0.008 155)` | Card 背景(bg より微妙に明るい) |
| `--card-foreground` | `oklch(0.96 0 0)` | Card 内テキスト |
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

使用するウェイトは以下に絞る:

| ウェイト | 用途 |
|---|---|
| **400** Regular | 本文・説明文 |
| **500** Medium | 小見出し・カードタイトル |
| **700** Bold | 名前・強調 |

### スケール(Tailwind 標準クラス)

| 用途 | クラス | サイズ |
|---|---|---|
| Intro の名前 | `text-3xl md:text-4xl font-bold tracking-tight` | 1.875〜2.25rem |
| 本文・headline | `text-base` | 1rem |
| 補足・所属・モットー | `text-sm text-muted-foreground` | 0.875rem |
| セクション見出しラベル | `text-xs font-medium uppercase tracking-widest text-muted-foreground` | 0.75rem |
| 日付・キャプション | `text-xs tabular-nums text-muted-foreground` | 0.75rem |

## レイアウト

### 本文幅・余白

- ホームは 1 カラム。本文幅はモバイルで全幅(左右 `px-5`)、`md` 以上では `max-w-2xl` で中央寄せ。ヘッダー・フッターも同じ幅に揃える
- セクション間の縦余白は `py-12 md:py-16`(共通コンポーネント `Section` で一元管理)
- 横スクロールは発生させない。意図した横スワイプ領域は Highlights と About の写真帯のみ

### セクション構成(上から順)

| # | セクション | 表現 |
|---|---|---|
| 1 | **Intro** | アバター、名前(日本語 + 英語)、headline、所属、モットー、主要 SNS ボタン。ファーストビューに収める |
| 2 | **Highlights** | 最大 3 件。`snap-x` の横スワイプカード(ホームで唯一のカード UI)。0 件なら非表示 |
| 3 | **About** | `summary` の短文、`<details>` で `bio` を展開、役職の箇条書き、写真帯 |
| 4 | **Projects** | 1 作品 1 行のリスト(作品名・summary・タグ・リンク) |
| 5 | **Skills** | カテゴリ別の小チップ |
| 6 | **Timeline** | 主要項目のみ → 「すべて見る」で全件(`aria-expanded` 付きトグル) |
| 7 | **Writing** | Blog 最新 3 件。Press は 1 件以上あるときのみ併記 |
| 8 | **Footer** | 全 SNS リンク、© 表記 |

### セクション見出し

小さな英字ラベル(例: `Projects`)＋細い区切り線を共通コンポーネント(`src/components/home/section.tsx`)で統一する。

```tsx
<div className="mx-auto max-w-2xl px-5">
  <Intro />
  <FadeIn><Highlights items={getHighlights()} /></FadeIn>
  <FadeIn><About /></FadeIn>
  {/* ... */}
</div>
```

### ヘッダー

名前(ホームへのリンク)、`Blog` リンク、テーマ切替のみ。ハンバーガーメニューは持たない。

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
- 動きは各セクション入場時の軽いフェード(`components/motion/fade-in.tsx`、下から 16px の slide-up + fade、一度だけ再生)のみ
- SSR・JS 無効・印刷では常に表示する(`FadeIn` はマウント後に初期状態を切り替える)
- ホバー・クリックの反応は最小限
- **派手なパララックス、スクロールハイジャック、自動再生動画は入れない**

### Easing 値

motion の props で渡す(arbitrary 値の CSS クラスを書かないため):

```ts
const easeOutApple = [0.22, 1, 0.36, 1] as const;
```

- `duration: 0.6`
- `prefers-reduced-motion` のユーザーには `useReducedMotion()` でアニメーションを無効化する

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
