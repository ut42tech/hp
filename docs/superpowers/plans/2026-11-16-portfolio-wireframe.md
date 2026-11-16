# ポートフォリオ ワイヤーフレーム 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Figma ファイル `ut42tech — Portfolio` に、スマホとパソコンのワイヤーフレームを作る。中身は、全画面の構造と、操作による画面の移り変わりの注記。

**Architecture:** 既存の `Direction` ページは `Archive — Canvas` に改名して残す。作業は新しい3ページで行う。

- `Wireframe — Parts`: 繰り返し使う部品（タブバー、シート、一覧の行、ツールバーなど）をローカルコンポーネントとして作る。
- `Wireframe — Mobile` と `Wireframe — Desktop`: 部品を組み合わせて各画面を並べ、画面の横に操作の注記を付ける。

**Tech Stack:** Figma MCP（`use_figma` / `get_screenshot`）、Figma Plugin API

**Spec:** `docs/superpowers/specs/2026-11-16-portfolio-wireframe-design.md`

## Global Constraints

- `use_figma` の前に毎回 `figma:figma-use` を読み込む。部品を作る Task 2 では `figma:figma-generate-library` も、画面を作る Task 3〜5 では `figma:figma-generate-design` も読み込む。
- ファイルキー: `ZPaC9SNAfMyKTROfRvAJyT`。
- **グレースケールのみ。** 色の変数（`ut42tech` コレクション）は使わない。ワイヤー用の灰色は次の6段階だけを使う。
  - `#FFFFFF`（面）、`#F2F2F2`（地）、`#E0E0E0`（仮の画像・枠）、`#BDBDBD`（補助線）、`#757575`（補足の文字）、`#1A1A1A`（文字・タブバー）
  - 注記だけは目立たせるため `#0A6CD6` を使う。
- 書体は `LINE Seed JP`（Regular / Bold / ExtraBold）。注記は `Geist Mono` Regular。
- 画面の基準サイズ: スマホは 390×844、パソコンは 1440×900。シートの「半分」は上端を y=420 に、「全画面」は上端を y=56 に置く。
- 開いた直後（Hello）の画面に置く文字は、`@ut42tech`、あいさつ `hi.`、ナビゲーションの項目名だけ。
- ナビゲーションの項目
  - スマホのタブバー: `About` / `Works` / `Press` / `Contact`
  - パソコンのツールバー: 左が `@ut42tech`、中央の切り替えが `About` / `Works` / `Press`、右が `Contact`
- Works の絞り込み: `All` / `Project` / `Role` / `Award` / `Event`。
- 本名 `Takuya Uehara` は About の画面にだけ出す。
- Contact には SNS 7つ（`packages/profile/src/profile.ts` の `social` の順）と `hello@ut42tech.com` を出す。
- Works の行には、旧サイトの素材（ローカルの `../hp-archive-materials/content/`）の実際の題名と年月を使う。ただし構造の確認用なので、説明文は仮でよい。
- 参考にしたサイト・スライド・テンプレートの名前は、Figma にもリポジトリにも書かない。Apple のロゴや OS の部品を描き写さない。
- リポジトリで触るのは、この計画のチェックボックスだけ。作業ブランチは `docs/portfolio-figma-design`。

## Review Focus

1. **全画面のシートの最後の行がタブバーに隠れる**: シートの下に余白がないと、最後の行がタブバーの裏に入って押せない → Task 3 で、全画面シートの最後の子要素の下端が、タブバーの上端より上にあることをスクリプトで確かめる。
2. **横スクロールが画面の端から始まる**: 絞り込みの行が左端 0 から始まると、Safari の端スワイプとぶつかる → Task 3 で、絞り込みの行の左端の x が 16 以上であることを確かめる。
3. **長い日本語の題名**: `日本教育工学会（JSET）2024年春季全国大会 学生セッション優秀発表賞` のような長い題名で、行が崩れる → Task 2 で、この題名を入れた行が2行に折り返し、日付と種類の目印が崩れないことを確かめる。
4. **開いた直後の文字が増える**: 作業中に説明文などを足してしまい、第一印象がクリーンでなくなる → Task 3・5 で、Hello の画面のテキストノードが上の Global Constraints の文字だけであることを確かめる。
5. **画像のない項目の詳細が空っぽに見える**: 役職などの詳細に、作品用の大きな画像の枠が残る → Task 3・5 で、画像なしの詳細に画像の枠がないことを確かめる。

---

### Task 1: ページの整理

**Interfaces:**
- Produces: ページ `Archive — Canvas`（旧 `Direction`）、`Wireframe — Parts`、`Wireframe — Mobile`、`Wireframe — Desktop`。

- [x] **Step 1: `Direction` を `Archive — Canvas` に改名し、新しいページを3つ作る。ページの並び順は Parts → Mobile → Desktop → Archive にする**
- [x] **Step 2: 検証**: ページ名と順番を読み返し、上のとおりであることを確かめる

---

### Task 2: 部品（Wireframe — Parts）

**Interfaces:**
- Produces: 次のローカルコンポーネント。Task 3〜5 はこの名前でインスタンスを置く。

| 部品 | プロパティ |
| --- | --- |
| `WF/TabBar` | `active` = none / about / works / press / contact |
| `WF/Sheet` | `height` = half / full、テキスト `title`。中身を入れるスロット（auto layout の縦並び） |
| `WF/Filter` | `active` = all / project / role / award / event |
| `WF/Row` | `kind` = project / role / award / event、テキスト `date`・`title`・`summary`。project のときだけ左にサムネイルの枠 |
| `WF/PressRow` | `kind` = article / video / talk / media、テキスト `date`・`title`・`source` |
| `WF/Toolbar` | `active` = none / about / works / press |
| `WF/Note` | 注記（青い文字の吹き出し）、テキスト `text` |
| `WF/Arrow` | 画面と画面をつなぐ矢印（青） |

- [x] **Step 1: `figma:figma-generate-library` を読み込み、上の部品を auto layout で作る。色・書体は Global Constraints のとおり**
- [x] **Step 2: 検証（長い題名）**: `WF/Row` のインスタンスに `日本教育工学会（JSET）2024年春季全国大会 学生セッション優秀発表賞` を入れ、幅 358 で2行に折り返すこと、日付と目印が先頭行の位置に揃うことをスクリーンショットで確かめる。確かめたらインスタンスは消す
- [x] **Step 3: 検証（見た目）**: Parts ページ全体のスクリーンショットを撮り、すべてのバリアントが並んでいることを確かめる

---

### Task 3: スマホのワイヤーフレーム

**Interfaces:**
- Consumes: Task 2 の部品。
- Produces: `Wireframe — Mobile` ページ上の次のフレーム（すべて 390×844）。

`M/Hello`、`M/About (half)`、`M/About (full)`、`M/Works (half)`、`M/Works (full)`、`M/Works detail (project)`、`M/Works detail (role)`、`M/Press (half)`、`M/Press (full)`、`M/Contact (half)`

**並べ方**
- 流れの順に横一列に並べる。
- 各フレームの下に `WF/Note` で、次の画面へ移る操作を書く。
- 移る先へ `WF/Arrow` を引く。

**画面の中身**（設計書 5〜6 章に沿う）

| フレーム | 中身 |
| --- | --- |
| M/Hello | 中央に `@ut42tech` と `hi.`。`WF/TabBar` active=none。注記: 「ハンドルに触れるとわずかに反応」「タブを押すとシートが半分の高さでせり上がる」 |
| M/About (half / full) | 上に小さくなった `@ut42tech`（half のみ見える）。シートの中: 写真の枠（円）、`Takuya Uehara`、所属、自己紹介（仮）、モットー、活動・役職、技術のタグ |
| M/Works (half / full) | シートの中: `WF/Filter`（左端 x=16）、`WF/Row` を新しい順に（full は8行以上）。project・role・award・event がすべて含まれるように並べる |
| M/Works detail (project) | シートの上に重なる全画面の層。上半分に画像の枠、題名、日付、説明、使った技術、リンク。注記: 「一覧のサムネイルが広がる」「中身が一番上のときだけ下に払って閉じる」「画像を強く投げると画面外へ」「Safari の端スワイプ・戻るボタンでも閉じる（URL: /works/slug）」 |
| M/Works detail (role) | 画像の枠なし。題名、期間、説明 |
| M/Press (half / full) | `WF/PressRow` を4種類が含まれるように並べる |
| M/Contact (half) | SNS 7つを大きめのボタンで2列、その下に `hello@ut42tech.com` |

**注記を足すフレーム**
- `M/Works (half)` の横: 「シートを開いたまま別のタブを押すと、その場で中身が入れ替わる」
- `M/Works (full)` の横: 「取っ手と見出しだけが引き下ろしを受ける。一覧はシートの中だけでスクロール」

- [x] **Step 1: `figma:figma-generate-design` を読み込み、上の10フレームを作る**
- [x] **Step 2: 検証（構造）**: スクリプトで次を確かめる
  - 10フレームの名前とサイズが上のとおりである。
  - Contact 以外のすべてのフレームに `WF/TabBar` のインスタンスがある。
  - `M/Hello` のテキストが、`@ut42tech`・`hi.`・タブの4項目だけである。
  - 全画面のシートで、最後の行の下端がタブバーの上端より上にある。
  - `WF/Filter` の左端の x が 16 以上である。
  - `M/Works detail (role)` に画像の枠がない。
- [x] **Step 3: 検証（見た目）**: ページ全体のスクリーンショットを撮り、流れと注記が左から右へ読めることを確かめる

---

### Task 4: パソコンのワイヤーフレーム

**Interfaces:**
- Consumes: Task 2 の部品。
- Produces: `Wireframe — Desktop` ページ上の次のフレーム（すべて 1440×900）。

`D/Hello`、`D/About`、`D/Works (project)`、`D/Works (role)`、`D/Press`、`D/Contact (popover)`

| フレーム | 中身 |
| --- | --- |
| D/Hello | `WF/Toolbar` active=none。その下の領域の中央に `@ut42tech` と `hi.` |
| D/About | 読みやすい幅（720 前後）の1列を中央に。中身はスマホの About と同じ |
| D/Works (project) | 左に一覧（幅 400 前後、上に `WF/Filter`）、右に詳細の分割ビュー。いちばん新しい作品が選ばれた状態。注記: 「Works を開いた直後は先頭を選択」「項目を選ぶと右がその場で切り替わる」 |
| D/Works (role) | 同じ分割ビューで、役職を選んだ状態。右の詳細に画像の枠なし |
| D/Press | 1列 |
| D/Contact (popover) | D/Hello の上に、ツールバー右の Contact ボタンから出る吹き出し。中身は SNS 7つとメール |

- [x] **Step 1: 上の6フレームを作り、`WF/Note` と `WF/Arrow` で、ツールバーの切り替えとポップオーバーの開閉を注記する**
- [x] **Step 2: 検証**: スクリプトで次を確かめる
  - 6フレームの名前とサイズが上のとおりである。
  - `D/Hello` のテキストが、`@ut42tech`・`hi.`・ツールバーの項目だけである。
  - `D/Works (role)` の詳細に画像の枠がない。

  そのうえで、ページ全体のスクリーンショットを撮る。

---

### Task 5: 本人の確認

- [ ] **Step 1: 本人に Figma の各ページの URL と、スマホ・パソコンのスクリーンショットを渡し、構造と流れについて意見をもらう**
- [ ] **Step 2: 意見を反映する（構造の修正だけ。見た目の作り込みはしない）**
- [ ] **Step 3: 本人が構造を確定したら、計画のチェックボックスを更新してコミットする**

```bash
git add docs/superpowers/plans/2026-11-16-portfolio-wireframe.md
git commit -m "docs: complete portfolio wireframe phase"
```
