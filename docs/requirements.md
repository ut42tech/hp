# Requirements — Portfolio Site

本ドキュメントは個人ポートフォリオサイトの要件を定義する。実装中に判断に迷った際の「単一の真実の情報源」として機能する。技術構成は [architecture.md](./architecture.md)、デザイン方針は [design.md](./design.md) を参照。

## 目的と想定読者

情報系の大学院生が自身を発信するためのポートフォリオサイト。以下 4 つの読者像に同時に応える。

| 読者像 | 何を見たい |
|---|---|
| **名刺代わり** — SNS や名刺からアクセスする人 | 誰か、何をしている人かが一目で分かる簡潔な自己紹介 |
| **就活・インターン** — 採用担当・エンジニア | 技術スタック、制作物、研究・学習の実績、連絡先(SNS) |
| **研究・学術** — 研究室・共同研究者・学会関係者 | 研究テーマ、論文、学会発表、ポスターなどのアウトプット |
| **技術コミュニティ** — OSS / 勉強会参加者 | OSS 活動、個人開発、登壇・ブログ等の対外発信 |

## 用語定義: Project と Work

サイト上には **Projects** と **Works** という似た名前のセクションが並ぶ。両者は扱う対象が異なる。**この定義が正であり、他のドキュメントはここを参照する。**

| | **Project(開発プロジェクト)** | **Work(開発以外の取り組み)** |
|---|---|---|
| 対象 | 自分が作ったソフトウェア・プロダクト。個人開発アプリ、Web サービス、OSS、研究成果物など | 講師・メンター・コミュニティ運営など、**作ったモノではなく担った役割・活動** |
| 例 | ハッカソンで作った Web アプリ、公開している OSS、研究のデモ | プログラミング講師、学生コミュニティの代表、メンター、イベント運営 |
| データソース | microCMS `projects` API | microCMS `works` API |
| 型 | `Project`(`src/content/types.ts`) | `Work`(`src/content/types.ts`) |
| 固有フィールド | `tags: string[]`(技術タグ)、`links: ContentLink[]`(github / demo / paper / slide / article / other の複数リンク) | `url?: string`(紹介先の外部リンク 1 本のみ。あればカード全体がリンクになる) |
| 表示 | トップページの Projects セクション(カードグリッド) | トップページの Works セクション(カードグリッド) |

判断に迷ったときの基準: **「成果物(モノ)」なら Project、「活動・役割(コト)」なら Work。**

いずれも **個別の詳細ページは持たない**。カードには `title` / `summary` / `date` / `thumbnail` のみを表示し、詳しい情報は外部リンク(GitHub、デモ、記事など)へ誘導する。本文フィールド(`body`)、注目フラグ(`featured`)、`project` / `oss` / `research` / `experience` といったカテゴリ分類は持たない。

## 機能要件(スコープ内)

### ページ構成

実在するルートは以下の 3 ページのみ。**動的ルート(`[slug]`)は 1 つも存在しない。**

| パス | 実装 | 役割 |
|---|---|---|
| `/` | `src/app/page.tsx` | トップページ。Bento UI で Hero(自己紹介)・キーワード・技術スタック・Works・Projects・Press・Blog・Timeline を一望 |
| `/blogs` | `src/app/blogs/page.tsx` | 外部ブログ記事の一覧。プラットフォームでフィルタ |
| `/press` | `src/app/press/page.tsx` | メディア掲載記事の一覧 |

グローバルナビ(`src/lib/navigation.ts`)に載るのも Home / Blog / Press の 3 つで、サイトマップの列挙とも一致する。

メタデータ用のルートは以下の 3 つ。

| パス | 実装 | 内容 |
|---|---|---|
| `/sitemap.xml` | `src/app/sitemap.ts` | 上記 3 ルートを固定で列挙 |
| `/robots.txt` | `src/app/robots.ts` | 全許可 + sitemap / host |
| `/opengraph-image` | `src/app/opengraph-image.tsx` | 1200×630 の OG 画像を `next/og` で動的生成 |

このほか `src/app/not-found.tsx` が 404 ページを提供する。

### トップページのセクション

独立した About ページは設けず、全てトップの Bento タイルに収める。タイルは上から順に以下を並べる。

| # | タイル | 内容 |
|---|---|---|
| 1 | Hero | 名前・肩書きタグ・所属 / 研究室 / 役職一覧・モットー(日英のマーキー) |
| 2 | Keywords | 人物像キーワードを物理演算で漂わせるタイル |
| 3 | Tech Stack | 使用技術のバッジ一覧 |
| 4 | Contact | SNS リンク |
| 5–7 | Photo × 3 | 写真 + タップでキャプション表示 |
| 8 | Press(teaser) | 最新 3 件 + `/press` への導線 |
| 9 | Blog(teaser) | 最新 3 件 + `/blogs` への導線 |
| 10 | Works | 開発以外の取り組み(全件) |
| 11 | Projects | 開発プロジェクト(全件) |
| 12 | Timeline | 経歴。カテゴリでフィルタできる git graph 風の縦レール |

Timeline のカテゴリは `life` / `education` / `work` / `event` / `other` の 5 種。件数と年の範囲を「N commits · YYYY–YYYY」の形で見出しに添える。

### Blog(`/blogs`)

- Qiita / Zenn / note の 3 プラットフォームから記事を集約して 1 つの一覧に統合する
- 記事本文はサイト内に持たない。カードは各プラットフォームの元記事へ外部リンクする
- プラットフォーム(all / qiita / zenn / note)でクライアントサイドフィルタできる
- 取得元は Qiita API(v2)と Zenn / note の RSS。**一部が失敗しても成功した分だけを表示する**(全滅時は「記事はまだありません」+ 各プラットフォームのプロフィールへの導線)

### Press(`/press`)

- メディア掲載記事(インタビュー・受賞・イベント紹介など)の一覧
- 媒体名・タイトル・日付・サムネイル・抜粋を表示し、掲載元へ外部リンクする

### 言語

- **日本語のみ**(`<html lang="ja">` 固定)
- 多言語対応は後続タスクで **next-intl** を使って導入予定(戦略の詳細は [architecture.md](./architecture.md) を参照)

### その他の機能

- **ダークモード切替** — `light` / `dark` / `system` の 3 モード、`next-themes` で永続化。ヘッダーとモバイルメニューの両方にトグルを置く
- **モバイルナビ** — `md` 未満ではドロワー(右からスライド)でナビゲーションを提供
- **SEO・OGP** — ページごとの `metadata`(`title` / `description` / `alternates.canonical`)、OG 画像の動的生成、`sitemap.xml`、`robots.txt`
- **工事中バナー** — `site.underConstruction`(`src/lib/site.ts`)が `true` の間、全ページ上部に告知バナーを表示する。**現在は `true`**。公開準備が整った時点で `false` にする
- **アクセシビリティ** — スキップリンク、フィルタ UI の `aria-pressed` / `aria-live`、`prefers-reduced-motion` の尊重(CSS の `motion-safe:` と JS の `useReducedMotion()` の両方)
- **コンタクト** — SNS リンクのみ(下記「コンタクト手段」参照)

## 非機能要件 / スコープ外

以下は **現時点では実装しない**。将来拡張する場合でも現状の構成を壊さない範囲で追加できるよう設計する。

- **多言語対応(i18n)** — 現状は日本語のみ。将来 **next-intl** で導入予定。ICU メッセージフォーマット、型安全な翻訳キー、App Router への公式対応が揃っており、自前の proxy + dictionaries より堅牢なため。導入時に `[locale]` セグメント化とメッセージ抽出を別タスクとして実施する
- **コンテンツの個別詳細ページ** — Project / Work / Press / Blog のいずれも詳細ページを持たず、外部リンクへ誘導する。動的ルートは実装しない
- **サイト内で記事を書く機能** — MDX / Markdown 本文・記事詳細ページは持たない。執筆は Qiita / Zenn / note で行い、当サイトは集約に徹する
- **RSS フィードの配信** — 外部フィードの取得はするが、当サイト自身は RSS を配信しない
- コンタクトフォーム・メール送信
- mailto リンク(スパム回避のため意図的に除外)
- コメント・リアクション機能
- 検索機能
- アクセス解析(Vercel Analytics / Google Analytics)
- 認証・ログイン機能

## コンテンツ管理方針

コンテンツは **microCMS(頻繁に増えるもの)** と **コード直書き(ほぼ変わらないもの)** の 2 系統に分ける。実装の詳細は [architecture.md](./architecture.md) を参照。

### microCMS(単一の CMS データソース)

更新頻度が高く、CMS の管理画面から追加したいものは全て microCMS で管理する。使用する API は以下の 4 つ(いずれもリスト型)。

| API | 型 | 内容 |
|---|---|---|
| `projects` | `Project` | 開発プロジェクト |
| `works` | `Work` | 開発以外の取り組み |
| `press` | `PressItem` | メディア掲載記事 |
| `timeline` | `TimelineEntry` | 経歴タイムライン |

- 取得は全て Server Component 側で行い、日付降順・最大 100 件を前提とする
- 再生成間隔は **3600 秒(1 時間)** の ISR。CMS 側の更新は最大 1 時間で反映される
- API キーが未設定の場合は**フォールバックせずビルドを失敗させる**。「データが無い」と「設定を忘れている」を取り違えないため

### コード直書き(`src/content/`)

自分自身に関する情報で、CMS 化するほど更新されないものはリポジトリ内に型付き TypeScript として置く。

| ファイル | 内容 |
|---|---|
| `src/content/profile.ts` | 名前・肩書きタグ・所属 / 研究室・役職一覧・モットー・SNS・技術スタック・写真 |
| `src/content/keywords.ts` | Keywords タイルに表示する人物像キーワードと重要度 |
| `src/content/types.ts` | 上記およびデータ層が共有するドメイン型 |

- **文言はプレーンな string** — 現状は日本語のみのため、ロケールキー付きオブジェクト(`{ ja, en }`)は使わない。next-intl 導入時に UI 文言は `messages/ja.json` 等へ機械的に移植する
- 写真は `public/photos/` 以下に置き、`profile.photos` から相対パスで参照する
- 更新は git push → Vercel 自動デプロイで反映する

### 外部プラットフォーム(ブログ)

ブログ記事は CMS にもコードにも持たず、Qiita API と Zenn / note の RSS から実行時に取得する。こちらも ISR 3600 秒。

## コンタクト手段

- **SNS リンクのみ。** コンタクトフォームは設けない
- `mailto:` は使用しない(スパム回避)
- 表示するアイコン種別: `github`, `x`, `youtube`, `wantedly`, `qiita`, `zenn`, `note`, `other`(`SocialIcon` 型)
- 現在の掲載先は X / GitHub / Qiita / Zenn / note / YouTube / Wantedly の 7 つ(`profile.social`)
- Contact タイル(トップ)とフッターの 2 箇所に同じリンク群を出す

## デプロイ

| 項目 | 値 |
|---|---|
| ホスティング | Vercel |
| 公開 URL | `https://ut42tech.com` |
| ビルド方式 | 標準 Next.js ビルド(`output: 'export'` は使わない — ISR と外部データ取得を使うため) |
| レンダリング | 全ページ Server Component + ISR(`revalidate = 3600`)。動的レンダリング(`export const dynamic`)は使用しない |
| 外部画像ホスト | `images.microcms-assets.io` のみ `next/image` に許可。それ以外(Zenn / note のサムネイル)は `<img>` で表示する |

### 環境変数

`.env.example` に定義されている以下の 2 つのみ。`NEXT_PUBLIC_*` は使用しない。

| 変数 | 必須 | 用途 |
|---|---|---|
| `MICROCMS_SERVICE_DOMAIN` | ✅ | microCMS のサービスドメイン |
| `MICROCMS_API_KEY` | ✅ | microCMS の API キー |

ローカルは `.env` / `.env.local`、本番は Vercel の環境変数に設定する。**どちらか欠けるとビルドが失敗する。**

## 対応ブラウザ

- Chromium 系(Chrome / Edge)最新 2 世代
- Safari 最新 2 世代(iOS/macOS)
- Firefox 最新 2 世代
- IE11、旧 Edge、古い Android ブラウザは対象外

## 完了の定義(Definition of Done)

本要件の完了は以下を全て満たすことを指す:

- `pnpm build` が警告・エラーなく成功する
- `pnpm lint`(Biome)がクリーンに通る
- `pnpm typecheck`(`tsc --noEmit`)がエラーなく通る
- `pnpm test`(Vitest)が全て通る
- `/`, `/blogs`, `/press` の 3 ページがプリレンダリングされ、ISR で更新される
- ダークモード切替が動作し、リロード後も設定が保持される
- Lighthouse(Chrome DevTools): Performance ≥ 95 / Accessibility = 100 / SEO = 100
- `/sitemap.xml`, `/robots.txt`, `/opengraph-image` が正しいレスポンスを返す
- `<html lang="ja">` が正しく出力される
- microCMS の 4 API が 0 件でも各セクションがフォールバック文を出してクラッシュしない(トップの各セクション / ティーザーは「〜は準備中です。」、`/press` は「記事はまだありません。」)
- ブログ取得が一部失敗しても、成功したプラットフォームの記事だけで一覧が成立する
