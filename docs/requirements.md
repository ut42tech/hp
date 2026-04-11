# Requirements — Portfolio Site

本ドキュメントは個人ポートフォリオサイトの要件を定義する。実装中に判断に迷った際の「単一の真実の情報源」として機能する。

## 目的と想定読者

情報系の大学院生が自身を発信するためのポートフォリオサイト。以下 4 つの読者像に同時に応える。

| 読者像 | 何を見たい |
|---|---|
| **名刺代わり** — SNS や名刺からアクセスする人 | 誰か、何をしている人かが一目で分かる簡潔な自己紹介 |
| **就活・インターン** — 採用担当・エンジニア | 技術スタック、制作物、研究・学習の実績、連絡先(SNS) |
| **研究・学術** — 研究室・共同研究者・学会関係者 | 研究テーマ、論文、学会発表、ポスターなどのアウトプット |
| **技術コミュニティ** — OSS / 勉強会参加者 | OSS 活動、個人開発、登壇・ブログ等の対外発信 |

## 機能要件(スコープ内)

### ページ構成

| パス | 役割 |
|---|---|
| `/` | トップページ。Bento UI で About・技術スタック・代表作・SNS を一望 |
| `/works` | Works 一覧。カテゴリチップでフィルタ |
| `/works/[slug]` | Work 詳細 |

### セクション

- **About** — 独立ページは設けず、トップの Bento タイルに埋め込む
- **Works** — 以下 4 カテゴリを 1 つのリストで扱い、タグでフィルタ
  - `project` — 個人開発のアプリ / Web サービス
  - `oss` — OSS 活動 / ライブラリ
  - `research` — 研究テーマ / 論文 / 発表
  - `experience` — ハッカソン・インターン・登壇経験

### 言語

- 初期実装は **日本語のみ**(`<html lang="ja">` 固定)
- 多言語対応は後続タスクで **next-intl** を使って導入予定(詳細はスコープ外セクション参照)

### その他の機能

- **ダークモード切替** — `light` / `dark` / `system` の 3 モード、`next-themes` で永続化
- **SEO・OGP** — `generateMetadata` による per-page メタ、OG 画像動的生成、`sitemap.xml`、`robots.txt`
- **コンタクト** — SNS リンクのみ(GitHub / X / LinkedIn 等)

## 非機能要件 / スコープ外

以下は **今回のフェーズでは実装しない**。将来拡張する場合でも現状の構成を壊さない範囲で追加できるよう設計する。

- **多言語対応(i18n)** — 初期実装は日本語のみ。将来 **next-intl** ライブラリを使って導入予定。next-intl を選ぶ理由は ICU メッセージフォーマット、型安全な翻訳キー、App Router への公式対応が揃っており、自前の proxy + dictionaries より堅牢なため。導入時に `[locale]` セグメント化とメッセージ抽出を別タスクとして実施する
- CMS 連携(microCMS / Contentful / Sanity 等)
- コンタクトフォーム・メール送信
- mailto リンク(スパム回避のため意図的に除外)
- ブログ機能 / MDX / 記事詳細ページ
- コメント・リアクション機能
- 検索機能
- アクセス解析(Vercel Analytics / Google Analytics)
- 認証・ログイン機能
- RSS フィード

## コンテンツ管理方針

- **コード直書き** — `src/content/profile.ts` と `src/content/works.ts` に TypeScript 型付きデータとして格納
- **文言はプレーンな string** — 初期実装は日本語のみのため、ロケールキー付きオブジェクト(`{ ja, en }`)は使わず普通の `string` で書く。next-intl 導入時に UI 文言は `messages/ja.json` 等に機械的に移植
- **Works 本文(body)** — プレーンテキスト段落の配列(`string[]`)。Markdown パーサは導入しない
- 更新頻度は低い想定(月単位〜四半期単位)のため、git push → Vercel 自動デプロイで十分

## コンタクト手段

- SNS リンクのみ
- 想定するアイコン種別: `github`, `x`, `linkedin`, `mail`(※ mail アイコンは表示するが href は SNS の DM/外部サービスを指す。`mailto:` は使用しない), `other`
- コンタクトフォームは設けない

## デプロイ

| 項目 | 値 |
|---|---|
| ホスティング | Vercel |
| 公開 URL | `https://ut42tech.com` |
| ビルド方式 | 標準 Next.js ビルド(`output: 'export'` は使わない — Proxy 機能を使うため) |
| 環境変数 | 初期フェーズでは不要 |

## 対応ブラウザ

- Chromium 系(Chrome / Edge)最新 2 世代
- Safari 最新 2 世代(iOS/macOS)
- Firefox 最新 2 世代
- IE11、旧 Edge、古い Android ブラウザは対象外

## 完了の定義(Definition of Done)

本要件の完了は以下を全て満たすことを指す:

- `pnpm build` が警告・エラーなく成功する
- `pnpm lint` がクリーンに通る
- `/`, `/works`, `/works/<任意の slug>` が全て静的生成される
- ダークモード切替が動作し、リロード後も設定が保持される
- Lighthouse(Chrome DevTools): Performance ≥ 95 / Accessibility = 100 / SEO = 100
- `/sitemap.xml`, `/robots.txt`, `/opengraph-image` が正しいレスポンスを返す
- `<html lang="ja">` が正しく出力される
