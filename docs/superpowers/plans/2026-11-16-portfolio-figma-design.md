# ポートフォリオ Figma デザイン 第1段階（方向性の確認）実装計画

> **中止（2026-11-16）**: Task 1〜3 まで実施したところで方針を転換した。後継は [`../specs/2026-11-16-portfolio-wireframe-design.md`](../specs/2026-11-16-portfolio-wireframe-design.md)。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 本人が全体の方向性を判断できる最小限のものを Figma に作る。中身は、トップページの大まかな画面（PC・スマホ）と、Hello が組み上がる動き。

**Architecture:** 新しい Figma Design ファイルに、最小限の色変数（ライト／ダーク）と2つの画面を作る。Hello の組み立ては Motion のタイムラインで作る。部品化、下層ページ、プロトタイプのつなぎ込みは第2段階に回す（設計書 6.2）。

**Tech Stack:** Figma MCP（`create_new_file` / `create_session` / `use_figma` / `get_screenshot` / `export_video`）、Figma Plugin API と Motion API、LINE Seed JP

**Spec:** `docs/superpowers/specs/2026-11-16-portfolio-figma-design.md`

## Global Constraints

- `use_figma` を呼ぶ前に毎回 `figma:figma-use` スキルを読み込む。画面を作るときは `figma:figma-generate-design`、動きを作るときは `figma:figma-use-motion` も読み込む。
- **作り込まない。** 部品（コンポーネント）、バリアント、下層ページ、プロトタイプの反応、文字スタイルの体系、余白や角丸の変数は作らない。画面は「方向性が伝わる程度」まで。迷ったら手を止めて本人に見せる。
- ファイルの置き場所はチーム「ut42tech」（plan key `team::1615024938307644185`）。ファイル名は `ut42tech — Portfolio`。
- 書体は **LINE Seed JP**（和文・欧文とも）。Figma で使えない場合は、別の書体に差し替えずに止まって本人に報告する。
- 色は変数経由で塗る（第2段階でそのまま育てるため）。変数は次の11個だけ: `color/bg`、`color/surface`、`color/fg`、`color/muted`、`color/border`、`color/grid-dot`、`color/accent`、`color/cursor/design`、`color/cursor/frontend`、`color/cursor/3d`、`color/cursor/you`。コレクション名は `ut42tech`、モードは `Light` と `Dark`。
- 名前・モットー（日英）・役割タグ・所属・SNS 7つは `packages/profile/src/profile.ts` の実データを使う。ほかは仮の文章でよい。
- セクションは上から **Hello / About me / Works / Press**。連絡先はフッター（SNS 7つと連絡先）と、ヘッダーの「Contact」リンク。
- 鮮やかな色を使うのは、カーソルの名札、3D の枠、アクセント色（選択枠・リンク）だけ。
- 参考にしたサイトやテンプレートの名前・URL は、Figma にもリポジトリにも書かない。Figma のロゴや UI をそのまま描かない。
- 3D は造形しない。点線の枠だけを置く。
- リポジトリで触るのは、README への Figma リンクの追記と、この計画のチェックボックスだけ。作業ブランチは `docs/portfolio-figma-design`。

## Review Focus

1. **Motion が使えない**: このアカウントで Motion の API が有効でないと、すべての Motion のプロパティが `"<name>" is not a supported API` で失敗する → Task 3 の最初に有効かどうかを確かめる。無効なら同じ呼び出しを繰り返さず、組み立てを3〜4枚の静止画のコマに切り替えて本人に伝える。
2. **LINE Seed JP に無い太さを指定する**: 存在しないウェイトを指定すると読み込みに失敗する → Task 1 で使えるウェイトを列挙し、それ以外は使わない。
3. **ダークで色が抜ける**: 変数に結び付いていない塗りがあると、ダークに切り替えたときに浮く → Task 2 で、すべての塗りと線が変数に結び付いていることを確かめ、ダークのスクリーンショットを撮る。
4. **スマホ幅のヘッダーがはみ出す**: ナビ4項目とテーマ切り替えが 390 幅に収まらない → Task 2 でメニューボタンに畳む。
5. **動きを確かめられない**: `get_screenshot` は静止状態しか写さない。また、この環境には `ffmpeg` がないので、書き出した動画からコマを切り出せない → Task 3 では書き出した動画のリンクを本人に渡して見てもらう。こちらでの確認は、キーフレームの時刻と値を読み返して行う。

---

### Task 1: ファイルの作成と書体の確認

**Interfaces:**

- Produces: `fileKey`、`sessionId`、ページ `Direction`、LINE Seed JP の使えるウェイト一覧。

- [x] **Step 1: `figma:figma-create-new-file` スキルを読み込む。`create_new_file` でチーム「ut42tech」にファイルを作り、`create_session` を呼ぶ**
- [x] **Step 2: 最初のページを `Direction` に改名する（ページはこの1つだけ）**
- [x] **Step 3: `figma.listAvailableFontsAsync()` で `LINE Seed JP` のスタイル一覧を取り、この計画の Task 1 の下に書き残す**

期待: 1件以上ある。無ければ止まって本人に報告する。

結果: `LINE Seed JP` — Thin / Regular / Bold / ExtraBold。等幅は `Geist Mono`（Regular / Medium ほか）を使う。

- [x] **Step 4: 色変数11個を `Light` / `Dark` の両方に値を入れて作る（値は設計書 7章のとおり実装者が決める）**

コントラストの確認: 次の組み合わせが両モードで 4.5 以上であることを、スクリプトで計算して確かめる。

- `fg` / `surface`、`muted` / `surface`、`accent` / `surface`
- 白文字 / 4つのカーソル色

- [x] **Step 5: README の「デザインへの引き継ぎ」節に Figma の URL を追記してコミット**

```bash
git add README.md docs/superpowers/plans/2026-11-16-portfolio-figma-design.md
git commit -m "docs: link portfolio Figma file"
```

---

### Task 2: トップページの大まかな画面（PC・スマホ）

**Interfaces:**

- Consumes: Task 1 の変数とウェイト一覧。
- Produces: `Direction` ページ上のトップレベルフレーム `Top / Desktop`（幅 1440）と `Top / Mobile`（幅 390）。Hello フレーム内の要素のレイヤー名は、Task 3 が動かす対象になる: `Hello/frame`、`Hello/label`、`Hello/name`、`Hello/motto`、`Hello/motto-en`、`Hello/tags`、`Hello/affiliation`、`Hello/3d`、`Cursor/design`、`Cursor/frontend`、`Cursor/3d`、`Cursor/you`、`Status`。

- [x] **Step 1: `figma:figma-generate-design` スキルを読み込む**
- [x] **Step 2: `Top / Desktop` を作る**

キャンバス:

- 背景は `color/bg` にし、`color/grid-dot` のドット方眼を敷く。

上から次の順に並べる。

- **ヘッダー**: `ut42tech`、About me・Works・Press・Contact、テーマ切り替え。
- **4つのフレーム**: 白い面（`color/surface`）で、左上に小さなフレーム名を付ける。
  - **Hello**: 名前、モットー（日英）、役割タグ、所属。右に点線の 3D 枠。周りにカーソル3つ（名札付き）と `you`。右下に `Status`（`ready — say hi 👋`）。
  - **About me**: 自己紹介の要約（仮の文章）と、技術の一覧。
  - **Works**: 年表を5行。作品と経歴が混ざるように並べ、目印で区別する。
  - **Press**: 4行。記事、動画、登壇、掲載を1つずつ。
- **フッター**: SNS 7つとメールアドレス。

- [x] **Step 3: `Top / Mobile` を作る**

- 同じ並びを1列で作る。左右の余白は 16 以上。
- ヘッダーのナビはメニューボタンに畳む。
- Hello の 3D 枠は縦に積む。
- 右下に「スキップ」ボタンを置く。

- [x] **Step 4: 検証**

- すべての塗りと線のうち、変数に結び付いていないものが 0 件であることをスクリプトで確かめる。透明な塗りとテキスト内の範囲指定の色は除く。
- 名前・モットー・SNS 7つが `profile.ts` と一致していることを、テキストノードを読んで確かめる。
- `get_screenshot` で両フレームを Light と Dark の両方で撮る。

---

### Task 3: Hello が組み上がる動き

**Interfaces:**

- Consumes: Task 2 の `Top / Desktop` 内のレイヤー（名前は Task 2 の Interfaces のとおり）。
- Produces: `Direction` ページ上のトップレベルフレーム `Build / Hello / Desktop`。`Top / Desktop` の上部（ヘッダーと Hello）を複製したもので、約8秒のタイムラインを持つ。

タイムライン（設計書 5.1 に沿う。秒は目安で、気持ちよさを優先して調整してよい）:

| 時刻     | 動き                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 0.0–0.8s | カーソル3つが画面の外から入ってくる。`Hello/frame` 以下はすべて見えない                                                      |
| 0.8–2.0s | design のカーソルが左上から右下へ動き、それに合わせて `Hello/frame` が大きさ0から広がる。`Status`: `Design framing "Hello"…` |
| 2.0–3.0s | 点線の箱が3つ現れる（ワイヤー）。`Status`: `Design wireframing…`                                                             |
| 3.0–4.6s | frontend のカーソルに合わせて、`Hello/name` が1文字ずつ打ち込まれる（TextStagger）。`Status`: `Frontend typing…`             |
| 4.6–5.6s | 点線の箱が消え、`Hello/motto`・`Hello/motto-en`・`Hello/tags`・`Hello/affiliation` が順に現れる                              |
| 5.6–6.6s | 3d のカーソルが `Hello/3d` を上から置く。`Status`: `ready — say hi 👋`                                                       |
| 6.6–8.0s | `Cursor/you` が現れ、3つのカーソルがそのそばへ集まる                                                                         |

- [x] **Step 1: `figma:figma-use-motion` スキルを読み込み、Motion が使えるかを読み取りだけのスクリプトで確かめる（`node.timelines` を読む）**

`not a supported API` が出たら、Motion は使わない。代わりに上の表の 0.8s・3.0s・4.6s・8.0s 時点の状態を静止画の4コマで作り、本人に「Motion が有効でなかった」と伝える。

- [x] **Step 2: `Top / Desktop` のヘッダーと Hello を複製して `Build / Hello / Desktop` を作り、上の表のとおりキーフレームを付ける。`Hello/name` の打ち込みには `figma.motion.figmaAnimationStyles()` で見つけた `TextStagger` を使う。タイムラインの長さを `setTimelineDuration` で 8 秒にする**
- [x] **Step 3: 検証**

- 各レイヤーの `manualKeyframeTracks` と `animationStyles` を読み返し、上の表の時刻どおりにキーフレームがあることを確かめる。
- `export_video`（幅 768、`quality: "low"`、`fps: 5`）で書き出し、動画のリンクを本人に渡す。

---

### Task 4: 本人の確認

- [ ] **Step 1: 本人に次の3つを渡し、方向性について意見をもらう**

- Figma ファイルの URL
- `Top / Desktop` と `Top / Mobile` の Light / Dark のスクリーンショット
- 組み立ての動画

聞くこと: 全体の雰囲気、色、書体の使い方、組み立ての動きの速さと気持ちよさ、セクションの見せ方。

- [ ] **Step 2: もらった意見を `Direction` ページの画面に反映する（作り込みではなく方向性の修正だけ）**
- [ ] **Step 3: 本人が方向性を確定したら、計画のチェックボックスを更新してコミットする。第2段階（作り込み）の計画は、改めて書く**

```bash
git add docs/superpowers/plans/2026-11-16-portfolio-figma-design.md
git commit -m "docs: complete portfolio Figma direction phase"
```
