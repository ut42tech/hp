# ポートフォリオ 見た目（Figma）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Figma ファイル `ut42tech — Portfolio` の変数・文字スタイル・部品を本番の値で作り直し、スマホとパソコンの主要画面を本番の見た目で仕上げる。

**Architecture:** 土台から順に積む。

1. 色の変数（Light / Dark）と数値の変数を作る。
2. 文字スタイルを作る。
3. 変数と文字スタイルに結び付けた部品 `UI/*` を作る。
4. 部品を組み合わせて、新しいページ `Visual — Mobile` と `Visual — Desktop` に画面を並べる。

ワイヤーフレームのページと部品（`WF/*`）は残す。

**Tech Stack:** Figma MCP（`use_figma` / `get_screenshot`）、Figma Plugin API、LINE Seed JP、Geist Mono、Lucide（`lucide-static@1.73.0` の SVG）

**Spec:** `docs/superpowers/specs/2026-11-17-portfolio-visual-design.md`（構造は `docs/superpowers/specs/2026-11-16-portfolio-wireframe-design.md`）

## Global Constraints

- `use_figma` の前に毎回 `figma:figma-use` を読み込む。
  - 変数と部品を作るタスクでは、`figma:figma-generate-library` も読み込む。
  - 画面を作るタスクでは、`figma:figma-generate-design` も読み込む。
- ファイルキー: `ZPaC9SNAfMyKTROfRvAJyT`。
- 色は設計書 5 章の表の値だけを使い、すべて変数に結び付ける。直接の値で塗ってよいのは次の2つだけ。
  - 仮の作品画像（色付きのグラデーション）。モノトーンの UI の中で写真に色がある状態を見せるため。
  - すりガラスとシートの影。
- 文字はすべて設計書 6 章の文字スタイルに結び付ける。
- 角丸・余白・幅は、設計書 7 章の数値の変数に結び付ける。
- 部品の高さが中身で決まる箇所（auto layout の主軸）は `AUTO` にする。
  - `resize()` を呼んだ後は、主軸の大きさが固定に戻ってしまう。そのため、必要な箇所では `primaryAxisSizingMode = 'AUTO'` を明示し直す。
  - ワイヤーフレームの段階で、高さが潰れる不具合を2回起こしている。
- カードの題名は最大2行、高さは2行分で固定する（`maxLines = 2`、`textTruncation = 'ENDING'`）。
- 参考にしたサイトやテンプレートの名前は、Figma にもリポジトリにも書かない。OS の部品（SF Symbols、Apple のロゴ）を描き写さない。
- リポジトリで触るのは、この計画のチェックボックスだけ。作業ブランチは `docs/portfolio-figma-design`。

## Review Focus

1. **ダークで色が抜ける・読めない**: 変数に結び付いていない塗りや、`muted` の文字がカードの上で薄すぎる → Task 1 でコントラストを計算する。Task 3〜5 では、変数に結び付いていない塗りが0件であることを確かめ、Dark のスクリーンショットを撮る。
2. **高さが潰れる・はみ出す**: auto layout の主軸が固定のままになる → 各タスクの最後に、子要素が親より高いフレームを探すスクリプトを走らせる（0件）。
3. **長い題名でカードの高さが変わる**: → Task 3 で、60文字の題名を入れたカードと短い題名のカードの高さが同じであることを確かめる。
4. **すりガラスの上の文字が読めない**: 仮の画像のような色の強い背景の上で、タブバーの文字が読めない → Task 4 で、色付きの仮画像の上にタブバーが重なる状態を作って確かめる。
5. **スマホで「Welcome.」がはみ出す**: 幅 390 で文字の幅が画面を超える → Task 4 で、文字の幅が 390 − 32 以下であることを確かめる。

---

### Task 1: 変数

**Interfaces:**
- Produces:
  - 色の変数（コレクション `ut42tech`、モード `Light` / `Dark`）。名前は設計書 5 章の表のとおり。
  - 数値の変数（コレクション `ut42tech/size`）: `radius/card`、`radius/row`、`radius/control`、`radius/segment`、`radius/sheet`、`radius/full`、`space/1`〜`space/14`、`width/content`、`width/reading`。

- [x] **Step 1: 既存の `ut42tech` コレクションを読み、変数を整理する**
  - 設計書の表にある名前は、値を上書きする。
  - 表にない `color/cursor/*`、`color/on-cursor`、`color/grid-dot` は消す。
  - `color/accent` は消さず、`color/fg` を参照する別名にする（コードの `--ut-color-accent` と合わせるため）。
- [x] **Step 2: 表にない新しい変数を作る**
  - 新しく作るのは `color/fill`、`color/placeholder`、`color/glass`、`color/glass-edge`、`color/glass-line`、`color/curtain`、`color/on-curtain`。
  - 不透明度付きの色は、`{ r, g, b, a }` の値で作る。
  - `scopes` も設定する（面は `FRAME_FILL`・`SHAPE_FILL`、文字は `TEXT_FILL`、線は `STROKE_COLOR`）。
- [x] **Step 3: 数値の変数を作る**
  - `ut42tech/size` コレクションに、上の名前と設計書 7 章の値で作る。
  - `scopes` は、角丸が `CORNER_RADIUS`、余白が `GAP`、幅が `WIDTH_HEIGHT`。
- [x] **Step 4: 検証**
  - スクリプトで、両モードの次の組み合わせのコントラスト比を計算する。
    - `fg` / `bg`、`fg` / `surface`: 7 以上。
    - `muted` / `bg`、`muted` / `surface`、`on-curtain` / `curtain`: 4.5 以上。
  - 変数の数と名前を読み返す。

---

### Task 2: 文字スタイル

**Interfaces:**
- Produces: 文字スタイル `Display`、`Title L`、`Title L (mobile)`、`Title M`、`Headline`、`Card Title`、`Body`、`Callout`、`Callout Bold`、`Caption`、`Mono`、`Loader`。値は設計書 6 章のとおり。
  - `Display` は最大の 176px で作る。スマホの画面では、インスタンスの文字の大きさを 64px に変える。
  - `Loader` は 24px で作る。スマホでは 17px にする。

- [x] **Step 1: 12 の文字スタイルを作る**（行間と字間は `{ unit, value }` で指定する）
- [x] **Step 2: 検証**: Foundations の見本は作らない（範囲外）。スタイルの数と、書体・太さを読み返す

---

### Task 3: 部品（Components ページを新設）

**Interfaces:**
- Consumes: Task 1・2 の変数と文字スタイル。
- Produces: 新しいページ `UI — Components` と、次の部品。

| 部品 | バリアント・プロパティ | 見た目 |
| --- | --- | --- |
| `UI/Icon/*` | `chevron-left`、`arrow-up-right`、`arrow-up-down`、`sun`、`moon`、`monitor`、`copy` | Lucide の SVG を 16px で取り込む。線の太さ 1.75、色は `fg` |
| `UI/TabBar` | `active` = none / about / works / press | すりガラス。文字だけの3項目。選択中は `fg` の丸い面に `bg` の文字 |
| `UI/Toolbar` | `active` = none / about / works / press | すりガラス。左は `@ut42tech`、中央は切り替え、右は表示の切り替えボタン（アイコン） |
| `UI/Sheet` | `height` = full / half、テキスト `title` | `surface` の面。上端の角丸は `radius/sheet`。取っ手と `Title L (mobile)` の見出し |
| `UI/Segmented` | `active` = apps / career / awards / events | `fill` の地。選択中は `fg` の面 |
| `UI/SideNav` | `active` = apps / career / awards / events | 縦並び。選択中は `fg` の面。件数は `Caption` |
| `UI/Sort` | `order` = newest / oldest | `arrow-up-down` のアイコンとラベル。枠線は `border` |
| `UI/ThemeSwitch` | `value` = auto / light / dark | 3つの切り替え（`monitor` / `sun` / `moon`）。About の最後に置く |
| `UI/Card` | `media` = image / fallback、テキスト `title`・`meta`・`fallback` | `surface` の面、`border` の線、角丸 `radius/card`。サムネイルは 16:10。題名は `Card Title`（2行で高さ固定）、補足は `Mono` |
| `UI/RowCard` | `layout` = wide / compact、`media` = image / fallback | 左にサムネイル（wide 160×100、compact 96×72）。カードの高さはサムネイルと同じ |
| `UI/Button` | `variant` = primary / secondary | primary は `fg` の面に `bg` の文字、secondary は `border` の線。`arrow-up-right` を右に付ける |

- [x] **Step 1: Lucide の SVG を取得する**
  - `https://unpkg.com/lucide-static@1.73.0/icons/<name>.svg` から、上の7つを取得する。
  - `stroke-width` を 1.75 に、`width`・`height` を 16 にしてから、`figma.createNodeFromSvg` で取り込んで部品にする。
  - 線の色は `fg` に結び付ける。
- [x] **Step 2: `figma:figma-generate-library` を読み込み、上の部品を作る**
  - 色・角丸・余白は変数に、文字は文字スタイルに結び付ける。
- [x] **Step 3: 検証（題名の長さ）**: `UI/Card` のインスタンスを2つ作り、高さが同じであることを確かめたら、インスタンスは消す
  - 1つには、60文字の日本語の題名を入れる。
  - もう1つには、`tangi` と入れる。
- [x] **Step 4: 検証（結び付け・潰れ）**: ページ内について、スクリプトで次を確かめる
  - 変数に結び付いていない塗りと線が0件である。例外は、仮画像のグラデーションと影だけ。
  - 子要素が親より高い auto layout のフレームが0件である。
- [x] **Step 5: 検証（見た目）**: ページを Light と Dark でスクリーンショットする

---

### Task 4: 画面（スマホ）

**Interfaces:**
- Consumes: Task 3 の部品。
- Produces: 新しいページ `Visual — Mobile` と、次のフレーム（すべて 390×844）。
  - `V-M/Loader`、`V-M/Hello`、`V-M/About`、`V-M/Works (Apps)`、`V-M/App detail`、`V-M/Works (Career)`、`V-M/Press`、`V-M/Press (half over detail)`
  - Dark の版: `V-M/Hello (Dark)`、`V-M/Works (Apps) (Dark)`

**画面の中身**（設計書と構造の設計書に沿う）

| フレーム | 中身 |
| --- | --- |
| Loader | `curtain` の面に、`Loader` のスタイルで「Takuya Uehara」を中央に置く |
| Hello | `bg` の地に「Welcome.」（`Display`、64px）と「to ut42tech」（`Callout`、`muted`）。左上に `@ut42tech`、下に `UI/TabBar`（none） |
| About | 全画面のシート。スクロールした先の状態で、写真、名前、所属、自己紹介、技術、これまで、Contact（SNS 7つ・メール）、`UI/ThemeSwitch` の順に並べる |
| Works (Apps) | 全画面のシート。`UI/Segmented`（apps）、件数と `UI/Sort`、`UI/Card` の2列（8枚、うち2枚はフォールバック） |
| App detail | 全画面の層。上に仮画像、`‹ Apps` ボタン、題名（`Title M`）、本文、`UI/Button`（Demo・GitHub）、Stack、Related |
| Works (Career) | `UI/RowCard`（compact）を5枚。うち2枚はフォールバック |
| Press | `UI/Card` の2列（6枚） |
| Press (half over detail) | App detail の上を `#000` 25% で暗くし、Press の半分のシートを重ねる。タブバーは press |

- [x] **Step 1: `figma:figma-generate-design` を読み込み、上の 8 フレームを作る**
  - 仮の作品画像は、作品ごとに違う色のグラデーションにする。
- [x] **Step 2: Dark の版を作る**
  - Hello と Works (Apps) を複製し、`setExplicitVariableModeForCollection` で Dark モードにする。
- [x] **Step 3: 検証**: スクリプトで次を確かめたうえで、ページ全体をスクリーンショットする
  - 「Welcome.」の幅が 358 以下である。
  - 変数に結び付いていない塗りが0件である（仮画像と影は除く）。
  - 潰れたフレームが0件である。
  - 色付きの仮画像の上に重なるタブバーの文字が読めることを、見て確かめる。

---

### Task 5: 画面（パソコン）

**Interfaces:**
- Consumes: Task 3 の部品。
- Produces: 新しいページ `Visual — Desktop` と、次のフレーム（すべて 1440×900、About だけは中身に合わせた高さ）。
  - `V-D/Loader`、`V-D/Hello`、`V-D/About`、`V-D/Works (Apps)`、`V-D/App detail`、`V-D/Works (Career)`、`V-D/Press`
  - Dark の版: `V-D/Hello (Dark)`、`V-D/Works (Apps) (Dark)`

**画面の中身**

| フレーム | 中身 |
| --- | --- |
| Loader | スマホと同じ（文字は 24px） |
| Hello | `UI/Toolbar`（none）。下の領域の中央に「Welcome.」（176px）と「to ut42tech」 |
| About | 幅 720 の1列。スマホと同じ並び。表示の切り替えはツールバーにあるので、ここには置かない |
| Works (Apps) | 左に `UI/SideNav`（サイドバー 280）。右は幅 960 の中央寄せで、`UI/Card` を3列 |
| App detail | 同じサイドバー。右は幅 960 で、仮画像、題名、本文、ボタン、Stack、Related |
| Works (Career) | `UI/RowCard`（wide）を幅 960 で5枚 |
| Press | 幅 960 の中央寄せで、`UI/Card` を3列 |

- [x] **Step 1: 上の 7 フレームを作る**
- [x] **Step 2: Dark の版を作る**
- [x] **Step 3: 検証**: Task 4 Step 3 と同じスクリプトの確認（「Welcome.」の幅は除く）と、ページ全体のスクリーンショット

---

### Task 6: 本人の確認

- [ ] **Step 1: 本人に各ページの URL を渡し、見た目について意見をもらう**
- [ ] **Step 2: 意見を反映する**
- [ ] **Step 3: 本人が見た目を確定したら、計画のチェックボックスを更新してコミットする**

```bash
git add docs/superpowers/plans/2026-11-17-portfolio-visual.md
git commit -m "docs: complete portfolio visual design phase"
```
