# portfolio

情報系の大学院生による個人ポートフォリオサイト。名刺代わり・就活・研究発表・技術コミュニティ向けの発信を 1 つのサイトに集約する。

公開 URL: <https://ut42tech.com>

## 技術スタック

- **Next.js 16** (App Router, Turbopack)
- **React 19** / **TypeScript** (strict)
- **Tailwind CSS v4** (`@theme` によるトークンベース設計)
- **shadcn/ui** (`base-nova` preset = [@base-ui/react](https://base-ui.com)) + **lucide-react** + **@icons-pack/react-simple-icons**
- **motion** (旧 framer-motion) / **matter-js** (Keywords タイルの物理演算)
- **vaul** (モバイルナビの Drawer)
- **next-themes** (light / dark / system)
- **LINE Seed JP** (`next/font/google`)
- **microCMS** (projects / works / press / timeline の 4 API)
- **fast-xml-parser** (Zenn / note の RSS 解析)
- **Biome** (lint / format) / **Vitest** (テスト)
- **pnpm**
- デプロイ: **Vercel**

初期実装は **日本語のみ**。多言語対応は将来 **next-intl** を使って別タスクで導入する予定(詳細は [docs/architecture.md](./docs/architecture.md) の「言語と将来の i18n 戦略」を参照)。

## セットアップ

### 1. 環境変数

microCMS は本サイトの**単一データソース**で、未設定だとビルド・開発サーバともに即失敗する（フォールバックしない設計）。
[`.env.example`](./.env.example) をコピーして値を入れる。

```bash
cp .env.example .env.local
```

| 変数 | 用途 |
|---|---|
| `MICROCMS_SERVICE_DOMAIN` | microCMS のサービスドメイン（`https://<これ>.microcms.io`） |
| `MICROCMS_API_KEY` | 読み取り用 API キー |

本番は Vercel のプロジェクト設定に同じ 2 つを登録する。

### 2. 起動

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
| `pnpm typecheck` | `tsc --noEmit` で型チェック |
| `pnpm test` | Vitest でユニットテスト実行 |

## コンテンツの追加

Projects / Works / Press / Timeline はすべて **microCMS の管理画面**から追加する。リポジトリ側の作業は不要。

| API | 中身 |
|---|---|
| `projects` | 開発プロジェクト（`tags` / `links` あり） |
| `works` | 開発以外の取り組み（講師・メンター・コミュニティ運営など） |
| `press` | メディア掲載記事 |
| `timeline` | 経歴タイムライン |

自己紹介・キーワード・SNS リンクなど人物そのものの情報だけが `src/content/` に静的 TS として置かれている。
ブログ記事は Qiita / Zenn / note からビルド時に取得するため、どこにも登録しない。

## ドキュメント

実装方針・要件・デザインの詳細は [`docs/`](./docs/) に集約している。

- [docs/requirements.md](./docs/requirements.md) — 目的・読者像・機能要件・非機能要件・コンタクト・デプロイ
- [docs/architecture.md](./docs/architecture.md) — 技術スタック・Next.js 16 の注意点・i18n 戦略・ディレクトリ構成・コーディング規約
- [docs/design.md](./docs/design.md) — Bento × Apple 風方針・カラートークン・タイポグラフィ・Bento レイアウト・モーション・アクセシビリティ

実装中に判断に迷ったらまず `docs/` を参照する。
