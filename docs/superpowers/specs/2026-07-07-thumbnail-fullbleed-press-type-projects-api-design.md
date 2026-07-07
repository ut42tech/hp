# サムネイルのフルブリード化 + ホバーズーム / Press 種別削除 / works → projects API 統一 / 新 Works セクション

日付: 2026-07-07
ステータス: 承認済み

## 目的

1. Projects / Press / Blog のカードサムネイルを「枠をフルに使う」表示にする
   （比率に関係なく拡大トリミングし、カード縁との余白をなくす）。
2. サムネイルにホバー時のズームアニメーションを追加する。
3. Press スキーマから種別（type）を削除する（バッジ表示ごと廃止）。
4. `works` API を廃止し `projects` API に統一する。experience は timeline と重複する
   ため移行せず、project / oss / research の 10 件のみ移行する。
5. ホームの Projects の上に「Works」セクション（開発以外の取り組み）を新規追加する。
   コンテンツは microCMS の新 `works` API（新スキーマ）で管理する。

## 決定事項（ユーザー承認済み。2026-07-07 に microCMS 実態へ合わせて改訂）

1. **works → projects の移行は完了済み。** ユーザーが管理画面で旧 works API を
   `projects` にリネームして移行した（contentId は維持、18 件全件が入っている）。
   その際 **category / body フィールドは削除された**。コードも category / body
   なしに追随する（フォールバックアイコンは全件 Rocket）。
2. **projects に残った旧 experience 8 件はスクリプトで削除する。** 同等の内容が
   timeline API に既存のため（うち 5 件相当は新 works にシードする）。
3. **`scripts/seed-microcms.mjs` は削除する。** 役目を終えており、git 履歴に残る。
4. **新 Works セクションは microCMS の新 `works` API（作成済み）で管理する。**
   スキーマは title / summary / date / url / thumbnail のシンプル構成
   （category / tags / links / body なし）。見た目は Projects と同じカードグリッド。
5. **新 works の初期データ 5 件はシードスクリプトで投入する。**
   ChoTech 設立・運営 / テクノバながさき 学生メンター / N Code Labo 講師 /
   ジュニアドクター育成塾 メンター / 長崎ハッカソン2025 企画運営。
6. **press の type フィールドは microCMS 側で削除済み。** コード側の削除のみ残作業。

## 1. サムネイルのフルブリード化

原因: shadcn の `Card` 基底（`src/components/ui/card.tsx`）がデフォルトで
`py-4` / `gap-4` を持つため、`Card` 内に置いたサムネイルが縁から浮く。

- `PressCard` / `BlogCard` の `Card` に `gap-0 py-0` を追加。テキスト部は自前の
  `p-4` を持つためレイアウトは維持される。
- 画像は 3 カードとも既に `fill` + `object-cover`（BlogCard は `<img>` +
  `size-full object-cover`）のため、トリミング拡大は現状挙動のまま。
- `ProjectCard` は素の div 構成で既にフルブリードのため変更不要。
- `Card` 基底コンポーネント自体は変更しない（他タイルへの影響を避ける）。

## 2. ホバーズーム

- 3 カード（ProjectCard / PressCard / BlogCard）の画像要素に
  `motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105`
  を付与。画像ラッパーは `overflow-hidden` 済みなのでズームはカード内にクリップされる。
- `ProjectCard` はリンクラッパーがないためルート div に `group` を追加する。
- ホバーは CSS トランジションで実装し、motion ライブラリは使わない。

## 3. Press 種別（type）の削除

コード側:

- `src/content/types.ts` — `PressType` 型と `PressItem.type` を削除。
- `src/lib/microcms/types.ts` — `RawPress.type` を削除。
- `src/lib/microcms/mappers.ts` — `PRESS_TYPES` と `mapPress` の type 照合を削除。
- `src/components/press/press-meta.tsx` — `pressTypeLabel` を削除（`formatPressDate` は残す）。
- `src/components/press/press-card.tsx` — 種別バッジを削除。
- `src/components/bento/press-teaser-tile.tsx` — 「・ Interview」等の種別表記を削除。
- `src/lib/microcms/mappers.test.ts` — type 関連のテストを削除・更新。

microCMS 側:

- 管理画面での `type` フィールド削除は**実施済み**（それまでの間、既存コードは
  フォールバックで全件「Media」バッジ表示になる）。

## 4. works → projects API 統一

### `projects` API スキーマ（旧 works のリネームにより移行済み、リスト型）

| fieldId   | 種類                                                     | 必須 |
| --------- | -------------------------------------------------------- | ---- |
| title     | テキスト                                                 | ✓    |
| summary   | テキストエリア                                           | ✓    |
| date      | 日付                                                     | ✓    |
| tags      | テキスト（カンマ区切り）                                 |      |
| thumbnail | 画像                                                     |      |
| links     | 繰り返しカスタムフィールド `link`（label / href / kind） |      |

- **category / body はリネーム時に削除された。** コードも追随して削除する。
- `slug` は microCMS の `contentId`（リネームで維持済み）。

### 型リネーム（`src/content/types.ts`）

- `Work` → `Project`（category / body なし）。
- `WorkCategory` は削除（カテゴリ概念自体を廃止）。
- `WorkLink` → `ContentLink`。
- `LinkKind` は変更なし。

### `src/lib/microcms/`

- `types.ts` — `RawWork` → `RawProject`（category / body なし）、
  `RawWorkLink` → `RawLink`。
- `mappers.ts` — `mapWork` → `mapProject`（category / body の処理なし）。
  `filterProjects` は削除（除外不要。ソートは `fetchList` の `orders=-date` に
  任せる）。`parseBody` は使い手がなくなるため削除。
- `index.ts` — `getProjects()` が `fetchList<RawProject>("projects")` を呼ぶ。
- `mappers.test.ts` — リネーム追随、`filterProjects` / `parseBody` のテスト削除。

### UI

- `src/components/projects/project-card.tsx` — `Project` 型に追随。
  サムネイルなしのフォールバックアイコンは全件 Rocket（category 廃止のため
  出し分けなし）。

### クリーンアップスクリプト（新規 `scripts/cleanup-microcms.mjs`）

- 使い方: `MICROCMS_SERVICE_DOMAIN=xxx MICROCMS_WRITE_API_KEY=write node scripts/cleanup-microcms.mjs`
- projects に残る旧 experience 8 件（chotech / n-code-labo / zenrin-internship /
  brightj-internship / iiit-delhi-exchange / tni-summer-school / jset-2024 /
  nagasaki-univ-award）を DELETE する。
- works のテスト用アイテム（id: `o9e0-5d2v`、title「tesuto」）も DELETE する。
- レート制限対策で 250ms スリープ。
- `scripts/seed-microcms.mjs` は削除。

## 5. 新 Works セクション（開発以外の取り組み）

### 新 `works` API スキーマ（ユーザーが作成済み、リスト型）

| fieldId   | 種類           | 必須 |
| --------- | -------------- | ---- |
| title     | テキスト       | ✓    |
| summary   | テキストエリア | ✓    |
| date      | 日付           | ✓    |
| url       | テキスト       |      |
| thumbnail | 画像           |      |

### 型（`src/content/types.ts`）

- 新 `Work` 型（旧 Work とは別物）: `slug` / `title` / `summary` / `date` /
  `url?` / `thumbnail?`。カテゴリ・タグ・リンク集はなし。

### `src/lib/microcms/`

- `types.ts` — `RawWork`（title / summary / date / url? / thumbnail?）。
- `mappers.ts` — `mapWork`。
- `index.ts` — `getWorks()` が `fetchList<RawWork>("works")` を呼ぶ。

### UI

- 新規 `src/components/works/works-section.tsx` + `work-card.tsx` —
  ProjectsSection / ProjectCard と同じカードグリッド構成
  （フルブリードサムネイル + ホバーズーム）。
- `url` があればカード全体を外部リンク（`target="_blank"` + フォーカスリング）に
  する。なければ非リンクの div。
- サムネイルなしのフォールバックアイコンは Sparkles（lucide-react）で統一。
- `src/app/page.tsx` — ProjectsSection タイルの直前に全幅タイル
  （`col-span-2 md:col-span-6`）として `WorksSection` を挿入。
- 0 件時は「取り組みは準備中です。」を表示（Projects と同様）。

### シードスクリプト（新規 `scripts/seed-works.mjs`）

- 使い方: `MICROCMS_SERVICE_DOMAIN=xxx MICROCMS_WRITE_API_KEY=write node scripts/seed-works.mjs`
- 初期データ 5 件を `PUT works/{slug}` で投入（title / summary / date のみ。
  url・サムネイルはあとから管理画面で設定可能。文面は旧 works の experience と
  timeline の記述から流用）:
  1. `chotech`（2025-04）ChoTech 設立・運営
  2. `technova-mentor`（2024-06）テクノバながさき 学生メンター
  3. `n-code-labo`（2024-05）N Code Labo プログラミング講師
  4. `junior-doctor-mentor`（2024-07）長崎大学ジュニアドクター育成塾 メンター
  5. `nagasaki-hackathon-2025`（2025-10）長崎ハッカソン2025 企画・運営

## 残作業手順

microCMS 側の press type 削除・projects へのリネーム・新 works API 作成は
**完了済み**。残りは以下（コード実装と並行可、スクリプト実行はコード実装後）:

1. `cleanup-microcms.mjs` を実行（projects の旧 experience 8 件と works の
   テストアイテムを削除）。
2. `seed-works.mjs` を実行し、works に 5 件入ったことを確認。
3. 管理画面で projects / works のサムネイルを設定（任意・随時）。
4. コードをローカルで確認してデプロイ。

## テスト・検証

- `mappers.test.ts` の更新でユニットテストが通ること。
- ローカルで dev サーバーを起動し、ホーム（Works / Projects / Press タイル）・/press・
  /blogs でサムネイルがカード縁までフィットし、ホバーでズームすることを確認。
- クリーンアップ・シード実行後、Projects に 10 件・Works に 5 件が表示されることを確認。
