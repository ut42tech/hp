# portfolio

情報系の大学院生による個人ポートフォリオサイト。名刺代わり・就活・研究発表・技術コミュニティ向けの発信を 1 つのサイトに集約する。

公開 URL: <https://ut42tech.com>

## 技術スタック

- **Next.js 16** (App Router, Turbopack)
- **React 19** / **TypeScript** (strict)
- **Tailwind CSS v4** (`@theme` によるトークンベース設計)
- **shadcn/ui** + **lucide-react**
- **motion** (旧 framer-motion)
- **next-themes** (light / dark / system)
- **LINE Seed JP** (`next/font/google`)
- **Biome** (lint / format)
- **pnpm**
- デプロイ: **Vercel**

初期実装は **日本語のみ**。多言語対応は将来 **next-intl** を使って別タスクで導入する予定(詳細は [docs/architecture.md](./docs/architecture.md) の「言語と将来の i18n 戦略」を参照)。

## ローカル実行

```bash
pnpm install
pnpm dev
```

<http://localhost:3000> でトップページが表示される。

## スクリプト

| コマンド | 用途 |
|---|---|
| `pnpm dev` | 開発サーバ起動 (Turbopack) |
| `pnpm build` | 本番ビルド |
| `pnpm start` | ビルド済みアプリを起動 |
| `pnpm lint` | Biome でチェック |
| `pnpm format` | Biome でフォーマット |

## ドキュメント

実装方針・要件・デザインの詳細は [`docs/`](./docs/) に集約している。

- [docs/requirements.md](./docs/requirements.md) — 目的・読者像・機能要件・非機能要件・コンタクト・デプロイ
- [docs/architecture.md](./docs/architecture.md) — 技術スタック・Next.js 16 の注意点・i18n 戦略・ディレクトリ構成・コーディング規約
- [docs/design.md](./docs/design.md) — Bento × Apple 風方針・カラートークン・タイポグラフィ・Bento レイアウト・モーション・アクセシビリティ

実装中に判断に迷ったらまず `docs/` を参照する。
