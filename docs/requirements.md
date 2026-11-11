# Requirements — Portfolio Site

本ドキュメントは個人ポートフォリオサイトの要件を定義する。実装中に判断に迷った際の「単一の真実の情報源」として機能する。

## 目的と想定読者

情報系の大学院生が自身を発信するためのポートフォリオサイト。以下 4 つの読者像に同時に応える。

**優先順位は「名刺代わり」が最優先**。スマホで開く人が数秒で「誰で、何をしている人か」を掴み、そこから SNS へ飛べることを最重要とする。就活・研究・技術コミュニティ向けの情報は、同じページの下方で深掘りできれば良い。設計の詳細は [モバイルファースト・リニューアル設計書](./superpowers/specs/2026-11-03-mobile-first-renewal-design.md) を参照。

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
| `/` | トップページ。1 カラム縦スクロールで Intro / Highlights / About / Projects / Skills / Timeline / Writing / Footer を並べる |
| `/blogs` | Blog 一覧(Zenn / Qiita / note 等の外部記事を集約。プラットフォームでフィルタ) |
| `/press` | 掲載記事一覧。**掲載が 1 件以上のときのみ存在**し、0 件のときは 404。サイトマップにも 1 件以上のときのみ載る |

`/works` および `/works/[slug]` は設けない(制作物はトップの Projects セクションに 1 作品 1 行で全件掲載する)。

### セクション(トップページ)

- **Intro** — アバター、名前(日本語 + 英語)、`headline`、所属(M1 / 長崎大学 / 研究室リンク)、モットー、主要 SNS ボタン。375px でスクロールせずに見えること
- **Highlights** — 受賞・代表作を最大 3 件、横スワイプで表示。0 件なら非表示
- **About** — 短い自己紹介(`summary`)、「続きを読む」で `bio` を展開、活動・役職、写真帯
- **Projects** — 制作物の 1 行リスト(作品名・summary・タグ・リンク)
- **Skills** — 技術スタックをカテゴリ別(Languages / Web / Infra / Creative / Academic)に列挙
- **Timeline** — 主要項目のみ表示し、「すべて見る」で全件に展開
- **Writing** — Blog 最新 3 件。Press が 1 件以上あるときのみ Press 最新 3 件も併記
- **Footer** — 全 SNS リンク、© 表記

Works のカテゴリ(`project` / `oss` / `research` / `experience`)はデータ上の分類として残るが、一覧のフィルタ UI は持たない。Projects セクションには `getProjects()` の結果が表示される。

### 言語

- 初期実装は **日本語のみ**(`<html lang="ja">` 固定)
- 多言語対応は後続タスクで **next-intl** を使って導入予定(詳細はスコープ外セクション参照)

### その他の機能

- **ダークモード切替** — `light` / `dark` / `system` の 3 モード、`next-themes` で永続化
- **SEO・OGP** — `generateMetadata` による per-page メタ、OG 画像動的生成、`sitemap.xml`、`robots.txt`
- **コンタクト** — SNS リンクのみ(Intro の主要 SNS ボタンと Footer の全 SNS リンク)
- **工事中バナー** — `src/lib/site.ts` の `underConstruction` で表示を切り替える
- **モバイルファースト** — 幅 375px を基準とし、どの幅でも横スクロールを発生させない(意図した横スワイプ領域を除く)

## 非機能要件 / スコープ外

以下は **今回のフェーズでは実装しない**。将来拡張する場合でも現状の構成を壊さない範囲で追加できるよう設計する。

- **多言語対応(i18n)** — 初期実装は日本語のみ。将来 **next-intl** ライブラリを使って導入予定。next-intl を選ぶ理由は ICU メッセージフォーマット、型安全な翻訳キー、App Router への公式対応が揃っており、自前の proxy + dictionaries より堅牢なため。導入時に `[locale]` セグメント化とメッセージ抽出を別タスクとして実施する
- CMS 連携(microCMS / Contentful / Sanity 等)
- コンタクトフォーム・メール送信
- mailto リンク(スパム回避のため意図的に除外)
- 自サイト内の記事執筆 / MDX / 記事詳細ページ(Blog は外部プラットフォームの記事を一覧するのみ)
- コメント・リアクション機能
- 検索機能
- アクセス解析(Vercel Analytics / Google Analytics)
- 認証・ログイン機能
- RSS フィードの配信
- `/works` 系ページ、Projects 専用ページ

## コンテンツ管理方針

- **コード直書き** — `src/content/` 配下(`profile.ts` / `works.ts` / `press.ts` ほか)に TypeScript 型付きデータとして格納
- **表示の出し分けはデータのフラグで行う** — `Work.highlight` / `TimelineEntry.highlight`(Highlights に載せる)、`TimelineEntry.featured`(Timeline の折りたたみ時にも表示)、`SocialLink.primary`(Intro に表示)
- **文面の更新手順** — [content-update-checklist.md](./content-update-checklist.md) に沿って確認する
- **文言はプレーンな string** — 初期実装は日本語のみのため、ロケールキー付きオブジェクト(`{ ja, en }`)は使わず普通の `string` で書く。next-intl 導入時に UI 文言は `messages/ja.json` 等に機械的に移植
- **Works 本文(body)** — プレーンテキスト段落の配列(`string[]`)。Markdown パーサは導入しない
- 更新頻度は低い想定(月単位〜四半期単位)のため、git push → Vercel 自動デプロイで十分

## コンタクト手段

- SNS リンクのみ
- 想定するアイコン種別: `github`, `x`, `youtube`, `wantedly`, `qiita`, `zenn`, `note`, `other`(`mailto:` は使用しない)
- Intro には `primary: true` の SNS(4 個程度)のみ、Footer には全件を表示する
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
- `/`, `/blogs` が生成され、Press が 0 件のとき `/press` が 404 になる
- `pnpm test`(Vitest)が通る
- 幅 375px でファーストビューに名前・headline・所属・主要 SNS が収まり、どの幅でも横スクロールが発生しない(`node scripts/check-layout.mjs` で確認)
- ダークモード切替が動作し、リロード後も設定が保持される
- Lighthouse(Chrome DevTools): Performance ≥ 95 / Accessibility = 100 / SEO = 100
- `/sitemap.xml`, `/robots.txt`, `/opengraph-image` が正しいレスポンスを返す
- `<html lang="ja">` が正しく出力される
