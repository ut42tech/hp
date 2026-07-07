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

## 決定事項（ユーザー承認済み）

1. **works → projects の移行は一発スクリプトで行う。** ユーザーが管理画面で空の
   `projects` API を作成 → スクリプトが works から 10 件をコピー（サムネイル URL も
   引き継ぎ）→ 確認後にユーザーが `works` API を手動削除。
2. **experience 8 件はどこにも移行しない。** 同等の内容が timeline API に既存のため。
3. **`scripts/seed-microcms.mjs` は削除する。** 役目を終えており、git 履歴に残る。
4. **新 Works セクションは microCMS の新 `works` API で管理する。** 旧 works API
   削除後に同名・新スキーマで作り直す。見た目は Projects と同じカードグリッド。
5. **新 works の初期データ 5 件はシードスクリプトで投入する。**
   ChoTech 設立・運営 / テクノバながさき 学生メンター / N Code Labo 講師 /
   ジュニアドクター育成塾 メンター / 長崎ハッカソン2025 企画運営。

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

microCMS 側（ユーザーが手動）:

- コード反映後、管理画面で press スキーマから `type` フィールドを削除
  （コードが読まなくなるためタイミングは自由）。

## 4. works → projects API 統一

### 新 `projects` API スキーマ（ユーザーが管理画面で作成、リスト型）

works と同一。ただし category の選択肢から experience を除く。

| fieldId   | 種類                                                                | 必須 |
| --------- | ------------------------------------------------------------------- | ---- |
| title     | テキスト                                                            | ✓    |
| category  | セレクト（project / oss / research、単一）                          | ✓    |
| summary   | テキストエリア                                                      | ✓    |
| body      | テキストエリア（空行区切りで段落に分割）                            |      |
| date      | 日付                                                                | ✓    |
| tags      | テキスト（カンマ区切り）                                            |      |
| thumbnail | 画像                                                                |      |
| links     | 繰り返しカスタムフィールド `link`（label / href / kind、works と同じ） |      |

- `slug` は引き続き `contentId`（移行スクリプトが PUT で維持）。

### 型リネーム（`src/content/types.ts`）

- `Work` → `Project`、`WorkCategory` → `ProjectCategory`
  （`"project" | "oss" | "research"` の 3 値）。
- `WorkLink` → `ContentLink`（新 Works でも使うため Project 専用名にしない）。
- `LinkKind` は変更なし。

### `src/lib/microcms/`

- `types.ts` — `RawWork` → `RawProject`、`RawWorkLink` → `RawLink`（新 works と共有）。
- `mappers.ts` — `mapWork` → `mapProject`、`WORK_CATEGORIES` →
  `PROJECT_CATEGORIES`（3 値、フォールバックは `"project"`）。
  `filterProjects` は削除（API が projects のみになり除外不要。ソートは
  `fetchList` の `orders=-date` に任せる）。
- `index.ts` — `getProjects()` が `fetchList<RawProject>("projects")` を呼ぶ。
- `mappers.test.ts` — リネーム追随、`filterProjects` のテスト削除。

### UI

- `src/components/projects/project-card.tsx` — `Work` → `Project` 型に追随。
  category によるフォールバックアイコン出し分け（Rocket / Package / FlaskConical）は維持。

### 移行スクリプト（新規 `scripts/migrate-works-to-projects.mjs`）

- 使い方: `MICROCMS_SERVICE_DOMAIN=xxx MICROCMS_API_KEY=read MICROCMS_WRITE_API_KEY=write node scripts/migrate-works-to-projects.mjs`
- works を GET（`limit=100`）→ category が project / oss / research のもののみ
  `PUT projects/{contentId}` でコピー。
- 画像（thumbnail）は同一サービスのメディアライブラリ URL をそのまま指定して引き継ぐ
  （microCMS の書き込み API はメディア内画像の URL 指定を受け付ける）。
- links / body / tags / date は raw 値をそのまま渡す。レート制限対策で 250ms スリープ。
- `scripts/seed-microcms.mjs` は削除。

## 5. 新 Works セクション（開発以外の取り組み）

### 新 `works` API スキーマ（ユーザーが管理画面で作成、リスト型）

旧 works API 削除後に同名で作り直す。projects と対称のスキーマで、
category の選択肢のみ異なる。

| fieldId   | 種類                                                                | 必須 |
| --------- | ------------------------------------------------------------------- | ---- |
| title     | テキスト                                                            | ✓    |
| category  | セレクト（community / teaching / event / other、単一）              | ✓    |
| summary   | テキストエリア                                                      | ✓    |
| body      | テキストエリア（空行区切りで段落に分割）                            |      |
| date      | 日付                                                                | ✓    |
| tags      | テキスト（カンマ区切り）                                            |      |
| thumbnail | 画像                                                                |      |
| links     | 繰り返しカスタムフィールド `link`（label / href / kind、projects と同じ） |      |

### 型（`src/content/types.ts`）

- 新 `Work` 型（旧 Work とは別物）: `slug` / `category` / `title` / `summary` /
  `body?` / `date` / `tags` / `thumbnail?` / `links`（`ContentLink[]`）。
- `WorkCategory = "community" | "teaching" | "event" | "other"`。

### `src/lib/microcms/`

- `types.ts` — `RawWork`（新スキーマ、`RawProject` と同形で category のみ別）。
- `mappers.ts` — `mapWork`（`WORK_CATEGORIES` 4 値、フォールバックは `"other"`）。
- `index.ts` — `getWorks()` が `fetchList<RawWork>("works")` を呼ぶ。

### UI

- 新規 `src/components/works/works-section.tsx` + `work-card.tsx` —
  ProjectsSection / ProjectCard と同じカードグリッド構成
  （フルブリードサムネイル + ホバーズーム + フォールバックアイコン）。
- フォールバックアイコン（lucide-react）: community=Users / teaching=GraduationCap /
  event=Megaphone / other=Sparkles。
- `src/app/page.tsx` — ProjectsSection タイルの直前に全幅タイル
  （`col-span-2 md:col-span-6`）として `WorksSection` を挿入。
- 0 件時は「取り組みは準備中です。」を表示（Projects と同様）。

### シードスクリプト（新規 `scripts/seed-works.mjs`）

- 使い方: `MICROCMS_SERVICE_DOMAIN=xxx MICROCMS_WRITE_API_KEY=write node scripts/seed-works.mjs`
- 初期データ 5 件を `PUT works/{slug}` で投入（文面は旧 works の experience と
  timeline の記述から流用）:
  1. `chotech`（community, 2025-04）ChoTech 設立・運営
  2. `technova-mentor`（teaching, 2024-06）テクノバながさき 学生メンター
  3. `n-code-labo`（teaching, 2024-05）N Code Labo プログラミング講師
  4. `junior-doctor-mentor`（teaching, 2024-07）長崎大学ジュニアドクター育成塾 メンター
  5. `nagasaki-hackathon-2025`（event, 2025-10）長崎ハッカソン2025 企画・運営
- サムネイルは投入後に管理画面から手動設定。

## 移行手順（ユーザー作業、コード反映前に一気に）

1. 管理画面で `projects` API を作成（上記スキーマ）。
2. `migrate-works-to-projects.mjs` を実行し、projects に 10 件入ったことを確認。
3. 管理画面で旧 `works` API を削除。
4. 管理画面で新 `works` API を作成（新スキーマ）。
5. `seed-works.mjs` を実行し、works に 5 件入ったことを確認。
6. 管理画面で press の `type` フィールドを削除。
7. コードをローカルで確認してデプロイ。

## テスト・検証

- `mappers.test.ts` の更新でユニットテストが通ること。
- ローカルで dev サーバーを起動し、ホーム（Works / Projects / Press タイル）・/press・
  /blogs でサムネイルがカード縁までフィットし、ホバーでズームすることを確認。
- 移行スクリプト実行後、projects 由来の 10 件と works 5 件がホームに表示されることを確認。
