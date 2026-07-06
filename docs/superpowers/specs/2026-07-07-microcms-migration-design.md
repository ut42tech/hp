# Press / Projects / Timeline の MicroCMS 移行 + Timeline 丸アバター化

日付: 2026-07-07
ステータス: 承認済み

## 目的

ハードコードされている Press / Projects (works) / Timeline のコンテンツを MicroCMS に移行し、
コード変更なしでコンテンツを更新できるようにする。あわせて Timeline を「丸アイコンサムネイル
（画像がなければカテゴリアイコンにフォールバック）」を前提としたデザインに変更する。

## 決定事項（ユーザー承認済み）

1. **MicroCMS を単一ソースとする。** ローカルデータへのフォールバックはしない。
   `content/press.ts` / `content/works.ts` は削除し、env 未設定時はビルドが明示的に失敗する。
2. **素の `fetch` を使う。** `microcms-js-sdk` は追加しない。既存の `lib/blog` と同じ
   `fetch + next: { revalidate }` パターン（このリポジトリは Cache Components 無効のため、
   従来モデルのデータキャッシュが正）。
3. **Timeline はレールのドットを丸アバターに置き換える。** git-graph レールのデザインは維持。

## MicroCMS API スキーマ（リスト型 ×3）

管理画面で以下の 3 つの API を作成する。

### `press`

| fieldId   | 種類                                                          | 必須 |
| --------- | ------------------------------------------------------------- | ---- |
| title     | テキスト                                                      | ✓    |
| outlet    | テキスト（媒体名）                                            | ✓    |
| url       | テキスト                                                      | ✓    |
| date      | 日付                                                          | ✓    |
| type      | セレクト（interview / feature / award / event / media、単一） | ✓    |
| thumbnail | 画像                                                          |      |
| excerpt   | テキストエリア                                                |      |

### `works`

| fieldId   | 種類                                                                | 必須 |
| --------- | ------------------------------------------------------------------- | ---- |
| title     | テキスト                                                            | ✓    |
| category  | セレクト（project / oss / research / experience、単一）             | ✓    |
| summary   | テキストエリア                                                      | ✓    |
| body      | テキストエリア（空行区切りで段落に分割）                            |      |
| date      | 日付                                                                | ✓    |
| tags      | テキスト（カンマ区切り）                                            |      |
| thumbnail | 画像                                                                |      |
| links     | 繰り返しカスタムフィールド `link`（label: テキスト, href: テキスト, kind: セレクト単一 = github / demo / paper / slide / article / other） |      |

- `slug` は microCMS の `contentId` をそのまま使う（シード時に PUT で指定）。

### `timeline`

| fieldId     | 種類                                                       | 必須 |
| ----------- | ----------------------------------------------------------- | ---- |
| title       | テキスト                                                   | ✓    |
| date        | 日付                                                       | ✓    |
| category    | セレクト（life / education / work / event / other、単一） | ✓    |
| description | テキストエリア                                             |      |
| location    | テキスト                                                   |      |
| thumbnail   | 画像（丸アバター用、新規）                                 |      |

## コード構成

### 新規: `src/lib/microcms/`（`lib/blog` と同じ流儀）

- `config.ts` — `MICROCMS_SERVICE_DOMAIN` / `MICROCMS_API_KEY` を読む。未設定なら
  設定方法を含む明確なメッセージで throw（fail fast）。`MICROCMS_REVALIDATE_SECONDS = 3600`。
- `client.ts` — `fetchList<T>(endpoint)`。
  `https://{serviceDomain}.microcms.io/api/v1/{endpoint}?limit=100&orders=-date` を
  `X-MICROCMS-API-KEY` ヘッダ + `next: { revalidate }` で GET。`!res.ok` は endpoint と
  status を含めて throw。`contents` 配列を返す。
- `types.ts` — microCMS raw レスポンス型。ポイント:
  - 日付フィールドは ISO 8601 UTC 文字列（JST の日付選択は前日 15:00Z になる）
  - セレクトフィールドは単一選択でも `string[]`
  - 画像フィールドは `{ url, width, height }`
  - 繰り返しフィールドは `{ fieldId, ... }[]`
- `mappers.ts` — raw → ドメイン型（`PressItem` / `Work` / `TimelineEntry`）の純関数。
  - 日付正規化: UTC ISO → **JST 基準の `YYYY-MM-DD`**（+9h して slice。UTC のまま
    slice(0,10) すると前日になるバグに注意）
  - セレクト: `values[0]` を既知の値と照合し、不正値はフォールバック（category →
    "other"、kind → "other"）
  - tags: カンマ区切り split → trim → 空要素除去
  - body: 空行（`/\n\s*\n/`）split → trim → 空段落除去
  - projects フィルタ: `experience` を除外し日付降順（既存 `getProjects` と同じ契約）
- `index.ts` — 公開 API（全て async）: `getAllPress()` / `getLatestPress(n)` /
  `getProjects()` / `getTimeline()`
- `mappers.test.ts` — マッパー純関数のユニットテスト（`works.test.ts` の契約を継承）

### 型変更: `src/content/types.ts`

- `TimelineEntry` に `thumbnail?: string` を追加
- `Profile` から `timeline: TimelineEntry[]` を削除（`profile.ts` の timeline 配列も削除）

### 削除

- `src/content/press.ts`
- `src/content/works.ts`
- `src/content/works.test.ts`（契約は `lib/microcms/mappers.test.ts` に移植）

### ページ / コンポーネント変更

- `src/app/page.tsx` — `getLatestPress` / `getTimeline` を `lib/microcms` から await。
  timeline が空のときの `Math.min(...[])` → `-Infinity` をガードし、キャプションを非表示に。
- `src/app/press/page.tsx` — async 化して `await getAllPress()`。
- `src/components/projects/projects-section.tsx` — async サーバーコンポーネント化。
  projects が空のときの空状態テキストを追加。
- `src/components/home/timeline.tsx` — 丸アバター化(下記)。
- `src/components/press/press-card.tsx` — thumbnail のホストが microCMS 固定になるため
  生 `img` → `next/image`（fill）に変更。biome-ignore コメントも削除。

### Timeline デザイン変更（丸アバター）

- レール列: `w-5` → `w-10`（40px）
- エントリノード: 小ドット（size-2.5）→ **size-10 の丸アバター**、`ring-4 ring-card` 維持
  - `thumbnail` あり: `next/image`（`fill` + `sizes="40px"`）、`rounded-full` + `object-cover`
  - なし: カテゴリ色の背景（`bg-cat-*/15`）+ カテゴリ色の lucide アイコン（`text-cat-*`）
- カテゴリアイコン: life=Heart / education=GraduationCap / work=Briefcase /
  event=Trophy / other=Sparkles（`categoryConfig` に `icon` を追加）
- 年見出しノード: 現状の size-3.5 マーカーのまま、広くなった列の中央に配置
- 日付・カテゴリバッジ・タイトル・説明・場所のレイアウトは現状維持

### `next.config.ts`

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.microcms-assets.io" },
  ],
},
```

## データ移行: `scripts/seed-microcms.mjs`

- 現在の works 18 件・timeline 32 件のスナップショットをスクリプト内（または隣接 JSON）に同梱
- microCMS 書き込み API に投入するワンショットスクリプト:
  - works: `PUT /api/v1/works/{slug}`（contentId = slug）
  - timeline: `POST /api/v1/timeline`（contentId 不問）
  - press: 現在 0 件のため対象外
- `MICROCMS_SERVICE_DOMAIN` + `MICROCMS_WRITE_API_KEY`（書き込み権限付きキー）を env で渡す
- 書き込みレート制限対策として各リクエスト間に短い delay を入れる
- `YYYY-MM` 形式の日付は `YYYY-MM-01` に変換して送る（表示は `YYYY.MM` なので影響なし）
- **画像は content API から投入できない**ため、timeline のサムネイルは移行後に
  管理画面から手動で設定する（フォールバックのカテゴリアイコンが出るので未設定でも壊れない）

## 環境変数

| 変数                     | 用途                                   |
| ------------------------ | -------------------------------------- |
| `MICROCMS_SERVICE_DOMAIN` | サービスドメイン（`xxxx`.microcms.io） |
| `MICROCMS_API_KEY`        | 読み取り用 API キー（アプリ本体）      |
| `MICROCMS_WRITE_API_KEY`  | 書き込み用（シードスクリプトのみ）     |

- `.env.example` を追加して明文化
- **env 未設定だと `next build` が失敗する**（意図された挙動）。Vercel のプロジェクト設定と
  ローカル `.env.local` の両方に設定が必要

## エラーハンドリング

- env 未設定 → `config.ts` が設定手順つきメッセージで throw（ビルド時に即失敗）
- fetch 失敗（!res.ok）→ throw。ISR 再生成時の失敗は Next.js が直前のキャッシュを維持
- 空リスト → 各所の空状態 UI（press は既存文言、projects / timeline は本変更で追加）

## テスト / 検証

- `pnpm lint` / `pnpm test`（マッパーのユニットテスト含む）
- `pnpm build`（`.env.local` 設定後）
- 開発サーバーでホーム / /press の表示、Timeline のアバター（画像あり / フォールバック）確認
