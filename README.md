# portfolio

情報系の大学院生による個人ポートフォリオサイト。名刺代わり・就活・研究発表・技術コミュニティ向けの発信を 1 つのサイトに集約する。

公開 URL: <https://ut42tech.com>

## 技術スタック

- **Next.js 16** (App Router, Turbopack)
- **React 19** / **TypeScript** (strict)
- **Tailwind CSS v4** (`@theme` によるトークンベース設計)
- **shadcn/ui** + **lucide-react** + **@icons-pack/react-simple-icons**
- **motion** (旧 framer-motion)
- **next-themes** (light / dark / system)
- **LINE Seed JP** (`next/font/google`)
- **Biome** (lint / format) / **Vitest** (テスト)
- **pnpm**
- デプロイ: **Vercel**

初期実装は **日本語のみ**。多言語対応は将来 **next-intl** を使って別タスクで導入する予定(詳細は [docs/architecture.md](./docs/architecture.md) の「言語と将来の i18n 戦略」を参照)。

## ローカル実行

```bash
pnpm install
pnpm dev
```

<http://localhost:3000> でトップページが表示される。

サイトは 1 カラム縦スクロールのモバイルファースト構成(Intro / Highlights / About / Projects / Skills / Timeline / Writing / Footer)。Blog 一覧は `/blogs`、掲載記事一覧 `/press` は掲載が 1 件以上のときのみ存在する。

## スクリプト

| コマンド | 用途 |
|---|---|
| `pnpm dev` | 開発サーバ起動 (Turbopack) |
| `pnpm build` | 本番ビルド |
| `pnpm start` | ビルド済みアプリを起動 |
| `pnpm lint` | Biome でチェック |
| `pnpm format` | Biome でフォーマット |
| `pnpm test` | Vitest でユニットテストを実行 |
| `node scripts/check-layout.mjs <baseUrl> <outDir>` | Playwright で `/` と `/blogs` を 375px / 1280px × light / dark で撮影し、横スクロールと Intro のファーストビューを検査 |

`check-layout.mjs` は起動済みのサーバ(例: `pnpm build && pnpm start -p 3100`)に対して実行する。Playwright はプロジェクトの依存に含めず、グローバルにインストールされたものを使う。

## ドキュメント

実装方針・要件・デザインの詳細は [`docs/`](./docs/) に集約している。

- [docs/requirements.md](./docs/requirements.md) — 目的・読者像・機能要件・非機能要件・コンタクト・デプロイ
- [docs/architecture.md](./docs/architecture.md) — 技術スタック・Next.js 16 の注意点・i18n 戦略・ディレクトリ構成・データ型と選択関数・コーディング規約
- [docs/design.md](./docs/design.md) — モバイルファースト・低装飾の方針・カラートークン・タイポグラフィ・1 カラムのセクション構成・モーション・アクセシビリティ
- [docs/content-update-checklist.md](./docs/content-update-checklist.md) — 肩書き・Timeline・Projects など文面を更新するときの確認項目
- [docs/superpowers/specs/2026-11-03-mobile-first-renewal-design.md](./docs/superpowers/specs/2026-11-03-mobile-first-renewal-design.md) — モバイルファースト・リニューアルの設計書

実装中に判断に迷ったらまず `docs/` を参照する。
