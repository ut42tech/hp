# ポートフォリオ 動きの段階2（登場演出、あいさつ、ポインター）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 最初の訪問で幕と名前が上がる登場演出、Hello の「Welcome.」がポインターに寄って押すと弾むあいさつ、パソコンで押せる要素に吸い付くポインターを入れる。

**Architecture:**

- 動きの中身は `apps/web/app/motion/` の素の TS（`motion` だけを使う）に置き、Vue の部品とプラグインは要素を渡してつなぐだけにする。
- 演出を見せるかどうかは、最初の描画の前に `<head>` のインラインのスクリプトで決める（`html[data-intro]`）。
- ポインターは、細かく指せる端末で、動きを減らす設定でないときだけ、プラグインから遅れて読み込む。

**Tech Stack:** Nuxt 4.6.4、Vue 3.5、`motion` 14.11.1、Tailwind 4、Vite+（`vp test`、`vp check`）、`node-html-parser`

**Spec:** `docs/superpowers/specs/2026-11-18-portfolio-motion-design.md` の 8.7・8.8。数値は `docs/superpowers/specs/2026-11-17-portfolio-visual-design.md` の 9.1〜9.3（ipad-cursor の設定は、自分たちで書くポインターの振る舞いの基準として使う）。

## Global Constraints

- 段階1の決まりをそのまま守る:
  - `import` は明示する。
  - `app/motion/` は `vue`、`nuxt`、`#…`、`motion-v` を import しない（`test/layers.test.ts`）。
  - 色・文言・SVG を部品に書かない（`test/no-hardcode.test.ts`）。色は `packages/tokens/tokens.css` に足す。
- 数値は設計書のとおりにし、`packages/tokens/motion.ts` に置く。
  - 登場演出: 名前 80ms〜600ms・`ease-out`、名前が抜ける 780ms〜500ms（不透明度は 350ms）・`ease-in-out`・上へ 24px、帯 5本・780ms から 60ms ずつ遅らせて各 820ms・`ease-curtain`、「Welcome.」1060ms から 1文字 45ms ずつ・各 900ms・`ease-rise`・0.35em 下から、「to ut42tech」1660ms から 600ms、幕を取り除くのは 1930ms。
  - 書体の読み込みは最大 1500ms 待つ。
  - 減らす設定では、幕は 400ms で消すだけで、あいさつは最初から出しておく。
  - あいさつ: 420px 以内で寄る、横に最大 14px・縦に最大 10px、ばね（硬さ 160、減衰 20）、ポインターが 2500ms 止まると戻る、押すと上向きの初速 260〜320px/s。
  - ポインター: ふだんは 20px の丸（`rgba(127,127,127,.28)` 相当）、要素の上では要素の形に広がる（`rgba(127,127,127,.14)` 相当、移動 200ms）、文字のポインターは使わない、押すと縮む、光が追う。
- 演出を見せるのは、そのタブで最初の読み込みだけ（`sessionStorage` の `ut42tech:intro`）。キー、ホイール、タップでその場で完成させる。「Welcome.」の演出は Hello でだけ起こす。
- コミットの最後に `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` を付ける。PR を作る前に、すべてのコミットが push 済みか（`git log origin/<branch>..<branch>`）を確かめる。
- 検査: `vp run check`、`pnpm --filter @ut42tech/web build` のあと `vp test`。

## Review Focus

1. **JavaScript が途中で止まった・遅い**（インラインのスクリプトは動いたが、本体の読み込みに失敗した）: 幕が残り続けない。3 秒で CSS だけで消える。→ Task 1 のテスト。
2. **共有リンクで Hello 以外を開いた**（`/ja/works/apps/<slug>`）: 幕と名前は同じように出て、上がった先はそのページ。「Welcome.」の演出は起きない。シートの動きとぶつからない。→ Task 2 のテスト。
3. **演出の途中で操作した**（タップ、キー、ホイール）: その場で完成し、何も押し損ねない（幕が操作を飲み込まない）。→ Task 2 のテスト。
4. **ポインターを使わない人**（タッチ端末、動きを減らす設定、キーボードだけの操作）: 自前のポインターは読み込まれず、OS のポインターとフォーカスの輪がそのまま見える。→ Task 4 のテスト。
5. **あいさつと登場演出が同じ文字を動かす**: 文字が上がりきる前にポインターを寄せても、位置が跳ばない（演出は `transform`、寄る動きは `translate` と、別の性質を使う）。→ Task 3 のテスト。

---

## ファイルの構成

```
packages/tokens/motion.ts          INTRO（時刻と長さ）、GREETING、POINTER を足す
packages/tokens/tokens.css         ポインターの色（--ut-color-pointer、--ut-color-pointer-block、--ut-color-pointer-light）
apps/web/app/
  motion/intro-gate.ts             見せるかどうかを決める（インラインのスクリプトにもそのまま埋める）
  motion/intro.ts                  幕と名前と「Welcome.」の時間割と、それを動かす
  motion/greeting.ts               文字が寄る量と、寄る・弾む・戻る
  motion/pointer.ts                吸い付くポインター
  components/IntroCurtain.vue      幕（帯 5本）と名前
  components/SiteShell.vue         幕を置き、インラインのスクリプトを足す
  components/HelloStage.vue        あいさつをつなぐ
  plugins/intro.client.ts          演出を始める
  plugins/pointer.client.ts        ポインターを条件付きで読み込む
  assets/css/global.css            演出前の隠し方、幕の非常口、ポインターがあるときの OS のポインター
```

---

### Task 1: 見せるかどうかの判定と、幕（動きなし）

**Files:**

- Create: `apps/web/app/motion/intro-gate.ts`、`apps/web/app/motion/intro-gate.test.ts`、`apps/web/app/components/IntroCurtain.vue`、`apps/web/test/intro.test.ts`
- Modify: `apps/web/app/components/SiteShell.vue`、`apps/web/app/assets/css/global.css`、`packages/tokens/motion.ts`

**Interfaces:**

- Produces:
  - `type IntroMode = "play" | "fade" | "none"`
  - `introGate(storage: Pick<Storage, "getItem" | "setItem"> | undefined, reduced: boolean): IntroMode`（`intro-gate.ts`。`ut42tech:intro` が無ければ印を付けて `reduced ? "fade" : "play"`、あれば `"none"`。読み書きが投げたら `"none"`。**関数の外の名前を使わない**: インラインのスクリプトに `introGate.toString()` で埋めるため）
  - `INTRO_STORAGE_KEY = "ut42tech:intro"` は関数の中の文字列として書き、`intro-gate.ts` からも export する（テスト用）
  - `html[data-intro="play" | "fade"]`: インラインのスクリプトが付ける。`none` のときは付けない
  - `IntroCurtain.vue`: `<div class="intro-curtain" aria-hidden="true">` の中に `[data-intro-band]` の帯 5本と、`[data-intro-name]`（`profile.name`、`text-loader`、`text-on-curtain`）。名前は文字の高さ分の窓（`overflow: hidden` の囲み）の中に置き、下からせり上がって見えるようにする（見た目の設計書 9.1）。帯の色は `bg-curtain`
  - `INTRO` 定数（`packages/tokens/motion.ts`）: 下の値をすべて持つ

```ts
export const INTRO = {
  nameIn: { at: 80, duration: 600 },
  nameOut: { at: 780, duration: 500, opacityDuration: 350, liftPx: 24 },
  bands: { count: 5, at: 780, staggerMs: 60, duration: 820 },
  letters: { at: 1060, staggerMs: 45, duration: 900, fromEm: 0.35 },
  sub: { at: 1660, duration: 600 },
  removeAt: 1930,
  fontWaitMs: 1500,
  reducedFadeMs: 400,
  failsafeMs: 3000,
} as const;
```

- [ ] **Step 1: 失敗するテストを書く**

`intro-gate.test.ts`:

```ts
test("the first load in a tab plays and remembers it", () => {
  /* storage empty → "play", then key set */
});
test("later loads in the same tab show nothing", () => {
  /* key present → "none" */
});
test("reduced motion only fades the curtain", () => {
  /* empty → "fade" */
});
test("blocked storage shows nothing rather than risk replaying", () => {
  /* getItem throws → "none" */
});
test("the gate is self-contained, so it can be inlined", () => {
  // Runs from its own source text, with no access to this module's scope.
  const inlined = new Function(`return (${introGate.toString()})`)();
  expect(inlined(fakeStorage(), false)).toBe("play");
});
```

`test/intro.test.ts`（書き出した HTML）:

```ts
test("every page carries the curtain with five bands and the name", () => {
  /* /ja/ and /ja/about: .intro-curtain, 5 × [data-intro-band], [data-intro-name] text === profile.name, aria-hidden */
});
test("the gate runs in <head> before first paint", () => {
  /* a head script containing "ut42tech:intro" and "data-intro"/"dataset.intro" */
});
test("the curtain shows only while an intro plays and has a CSS failsafe", () => {
  /* global.css: `.intro-curtain` is hidden by default; shown under html[data-intro]; and a 3000ms animation hides it (failsafe) */
});
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `pnpm --filter @ut42tech/web build && vp test apps/web/app/motion/intro-gate.test.ts apps/web/test/intro.test.ts`
Expected: FAIL

- [ ] **Step 3: 書く**

- `SiteShell.vue`:
  - `useHead` の `script` に、テーマの次へ `(${introGate})(sessionStorage を try で読むもの, matchMedia("(prefers-reduced-motion: reduce)").matches)` の結果を `document.documentElement.dataset.intro` に置く1行を足す（`none` なら置かない）。`sessionStorage` へ触れるだけで投げるブラウザがあるので、取得も `try` の中で行う。
  - `<IntroCurtain />` を `MotionConfig` の中の最後に置く。
- `global.css`:
  - `.intro-curtain` は既定で `display: none`。`html[data-intro] .intro-curtain` で、画面全体を覆う固定の層（`z-index` はナビより上、`position: fixed; inset: 0`）にする。
  - 帯は横に 5 等分する。
  - 非常口: `html[data-intro] .intro-curtain { animation: intro-failsafe 0s ${INTRO.failsafeMs}ms forwards; }`。`@keyframes intro-failsafe { to { visibility: hidden; } }`。演出が動けば、その前に `data-intro` を外すので効かない。
  - 演出の前は「Welcome.」の文字と「to ut42tech」を隠しておく: `html[data-intro="play"] .hello-stage:not(.is-decorative) .letter { opacity: 0; transform: translateY(0.35em) }`、同じく `.hello-sub { opacity: 0 }`（`HelloStage.vue` の下の行に `hello-sub` のクラスを足す）。

- [ ] **Step 4: 通ることを確かめる**

Run: `pnpm --filter @ut42tech/web build && vp test apps/web`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add -A packages/tokens apps/web
git commit -m "feat(web): decide the intro before first paint and lay out the curtain"
```

---

### Task 2: 登場演出を動かす

**Files:**

- Create: `apps/web/app/motion/intro.ts`、`apps/web/app/motion/intro.test.ts`、`apps/web/app/plugins/intro.client.ts`

**Interfaces:**

- Consumes: `INTRO`（Task 1）、`IntroMode`、`html[data-intro]`、`[data-intro-band]`、`[data-intro-name]`、Hello の `.letter` と `.hello-sub`
- Produces:
  - `type IntroStep = { target: "name" | "band" | "letter" | "sub"; index: number; at: number; duration: number; keyframes: Record<string, (string | number)[]>; ease: "ease-out" | "ease-in-out" | "ease-curtain" | "ease-rise" | "linear" }`
  - `introSteps(options: { mode: "play" | "fade"; bands: number; letters: number }): IntroStep[]`（純粋な関数。`letters` は Hello でだけ 0 より大きい）
  - `playIntro(elements: { curtain: HTMLElement; bands: HTMLElement[]; name: HTMLElement; letters: HTMLElement[]; sub?: HTMLElement }, mode: "play" | "fade"): { finished: Promise<void>; skip: () => void }`（`motion` の `animate` で各手順を動かす。`skip` はすべての動きを最後の状態にして終える）
  - イージングの名前は、`--ut-ease-*` と同じ `cubic-bezier` の値に置き換える（`ease-out: [0.2,0.8,0.2,1]`、`ease-rise: [0.2,1,0.3,1]`、`ease-curtain: [0.76,0,0.24,1]`、`ease-in-out: [0.7,0,0.3,1]`）。値は `packages/tokens/motion.ts` に `EASE` として置く

- [ ] **Step 1: 失敗するテストを書く**

```ts
test("the name rises at 80ms for 600ms and leaves 24px up at 780ms", () => {
  /* steps for "name": in at 80/600 ease-out y [100%,0]; out at 780/500 ease-in-out y [0,-24]; opacity [1,0] over 350 */
});
test("five bands lift left to right, 60ms apart, 820ms each", () => {
  /* band i at 780 + 60*i, duration 820, ease-curtain, y to "-100%" */
});
test("Welcome. rises letter by letter from 0.35em below", () => {
  /* letter i at 1060 + 45*i, 900, ease-rise, y ["0.35em", 0], opacity [0,1] */
});
test("the sub line fades in at 1660 for 600ms", () => {
  /* sub */
});
test("outside Hello there are no letter steps", () => {
  /* letters: 0 → no "letter" or "sub" steps */
});
test("reduced motion only fades the curtain over 400ms", () => {
  /* mode "fade" → one step: curtain opacity [1,0], 400, linear; no name/band/letter steps */
});
test("every step ends by removeAt", () => {
  /* max(at + duration) ≤ 1930 for play */
});
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `vp test apps/web/app/motion/intro.test.ts`
Expected: FAIL

- [ ] **Step 3: `introSteps` と `playIntro` を書く**

- [ ] **Step 4: プラグインを書く（`intro.client.ts`）**

- `document.documentElement.dataset.intro` が無ければ何もしない。
- 書体の読み込み（`document.fonts.ready`）を最大 `INTRO.fontWaitMs` 待つ（`Promise.race`）。
- Hello の文字は、今の経路が Hello で、飾りでない `.hello-stage` があるときだけ渡す。
- 始まったら、`keydown`・`wheel`・`pointerdown` で `skip()` する（`{ once: true, capture: true }`）。`pointerdown` を止めずに通すので、押したものはそのまま押せる。
- 終わったら（`finished`）、`data-intro` を外す（幕が消える）。演出で付けたインラインの `transform`・`opacity` を文字から外して、CSS の最終状態に戻す。

- [ ] **Step 5: 通ることを確かめる**

Run: `vp test apps/web && pnpm --filter @ut42tech/web build && vp test apps/web`
Expected: PASS

- [ ] **Step 6: ブラウザで確かめる**

静的に配った書き出しを、`sessionStorage` を空にした新しいタブで開く。

- 390×844 の `/ja/`: 帯の `transform` を `requestAnimationFrame` ごとに読み、左の帯から 60ms ずつ遅れて上がることを確かめる。1930ms 前後で `data-intro` が外れる。
- `/ja/works/apps/coto2-ba`: 幕が上がった先が詳細のシートであること。文字の手順が無いこと。
- 演出の途中にカードを押す: すぐに完成し、押したカードが開くこと。
- 同じタブで再読み込みする: 幕が一度も描かれないこと。

- [ ] **Step 7: コミット**

```bash
git add -A packages/tokens apps/web
git commit -m "feat(web): play the curtain and the Welcome. entrance once per tab"
```

---

### Task 3: あいさつ（寄る、弾む、戻る）

**Files:**

- Create: `apps/web/app/motion/greeting.ts`、`apps/web/app/motion/greeting.test.ts`
- Modify: `apps/web/app/components/HelloStage.vue`、`packages/tokens/motion.ts`

**Interfaces:**

- Produces:
  - `GREETING = { reachPx: 420, maxX: 14, maxY: 10, spring: { type: "spring", stiffness: 160, damping: 20 }, idleMs: 2500, bounce: { minSpeed: 260, maxSpeed: 320 } } as const`（`packages/tokens/motion.ts`）
  - `pull(letter: { x: number; y: number }, pointer: { x: number; y: number }): { x: number; y: number }`（`greeting.ts`。距離 `d`、`f = max(0, 1 - d / reachPx)`、`x = dx / d * maxX * f`、`y = dy / d * maxY * f`。`d = 0` なら `{ x: 0, y: 0 }`）
  - `bounceSpeed(random: () => number): number`（`minSpeed`〜`maxSpeed` の上向きの速さ。px/s、負の値で返す）
  - `attachGreeting(letters: HTMLElement[], options: { finePointer: boolean }): () => void`（文字ごとに `motionValue` を2つ持ち、`style.translate` に書く。`finePointer` のときだけ `pointermove` で寄せる。止まって `idleMs` たつと 0 へ戻す。文字の行を押すと全部を弾ませる。返り値で後片付け）

- [ ] **Step 1: 失敗するテストを書く**

```ts
test("letters ignore a pointer farther than 420px", () =>
  expect(pull({ x: 0, y: 0 }, { x: 500, y: 0 })).toEqual({ x: 0, y: 0 }));
test("a pointer right next to a letter pulls it almost the full 14px across", () => {
  /* pull({0,0},{1,0}).x ≈ 14 * (1 - 1/420) */
});
test("vertical pull tops out at 10px", () => {
  /* pointer straight below at 1px → y ≈ 10 */
});
test("halfway out pulls half as far", () => {
  /* pointer at 210px → x = 7 */
});
test("a pointer exactly on the letter does not move it", () =>
  expect(pull({ x: 5, y: 5 }, { x: 5, y: 5 })).toEqual({ x: 0, y: 0 }));
test("a press throws each letter up at 260–320px/s", () => {
  /* bounceSpeed(() => 0) === -260; bounceSpeed(() => 1) === -320 */
});
test("the greeting moves `translate`, never `transform` (the entrance owns transform)", () => {
  // Source check: greeting.ts writes style.translate and does not touch style.transform.
});
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `vp test apps/web/app/motion/greeting.test.ts`
Expected: FAIL

- [ ] **Step 3: `pull`、`bounceSpeed`、`attachGreeting` を書く。`HelloStage.vue` でつなぐ**

`HelloStage.vue`: 飾りでないときだけ、`onMounted` で `.letter` の要素を集め、`attachGreeting(letters, { finePointer: matchMedia("(pointer: fine)").matches })` を呼ぶ。動きを減らす設定（`useReducedMotion()`）なら呼ばない。`onBeforeUnmount` で後片付けを呼ぶ。

- [ ] **Step 4: 通ることを確かめる**

Run: `vp test apps/web/app/motion && pnpm --filter @ut42tech/web build && vp test apps/web`
Expected: PASS

- [ ] **Step 5: ブラウザで確かめる**

1280×800 の `/ja/` で次を確かめる。

- 「Welcome.」の左から 100px にポインターを置くと、いちばん左の文字の `translate` の x が 0 より大きく、14 以下で止まる。
- 3 秒動かさないと 0 に戻る。
- 文字を押すと、各文字の y がいったん負になってから 0 に戻る。

- [ ] **Step 6: コミット**

```bash
git add -A packages/tokens apps/web
git commit -m "feat(web): let Welcome. lean toward the pointer and bounce when pressed"
```

---

### Task 4: 吸い付くポインター（パソコン）

**Files:**

- Create: `apps/web/app/motion/pointer.ts`、`apps/web/app/motion/pointer.test.ts`、`apps/web/app/plugins/pointer.client.ts`
- Modify: `packages/tokens/tokens.css`（ライト・ダークの3か所にポインターの色）、`packages/tokens/motion.ts`、`packages/tokens/tokens.test.ts`、`apps/web/app/assets/css/global.css`

**Interfaces:**

- Produces:
  - `POINTER = { sizePx: 20, blockPaddingPx: 6, moveMs: 200, pressScale: 0.9 } as const`（`packages/tokens/motion.ts`。20px は ipad-cursor の既定の大きさ。要素の外側に 6px の余白をとる）
  - 色: `--ut-color-pointer`（`rgb(127 127 127 / 28%)`）、`--ut-color-pointer-block`（`rgb(127 127 127 / 14%)`）、`--ut-color-pointer-light`（光。ライトは `rgb(255 255 255 / 50%)`、ダークは `rgb(255 255 255 / 12%)`）。ライト・ダークの両方に書く（今の tokens のテストが、ライトとダークの組がそろっているかを見る）
  - `blockFrame(rect: { left: number; top: number; width: number; height: number }, radius: string): { x: number; y: number; width: number; height: number; radius: string }`（`pointer.ts`。外側に `blockPaddingPx` 広げる。角の丸みは要素の値に余白を足す。`999px` など大きい値はそのまま）
  - `startPointer(doc: Document): () => void`（ポインターの層を `body` に足し、`html` に `has-pointer` を付ける。`pointerover` と `pointerout` で `closest('[data-cursor="block"]')` を見て、ふだんの丸と要素の形を行き来する。形と位置は `motion` の `animate` で `moveMs` かけて移す。ふだんは指の位置へそのまま置く。`pointermove` ごとに、吸い付いている要素の位置を測り直す（中身が入れ替わっても追いかける）。押している間は `pressScale`。光は `--pointer-light-x`、`--pointer-light-y` を CSS 変数で渡す。返り値で層を外して元に戻す）
  - `pointer.client.ts`: `matchMedia("(pointer: fine)")` が真で、`prefers-reduced-motion: reduce` でないときだけ、`import("~/motion/pointer")` で読み込んで `startPointer(document)` を呼ぶ

- [ ] **Step 1: 失敗するテストを書く**

```ts
test("a block grows the pointer around the element with 6px to spare", () => {
  expect(blockFrame({ left: 100, top: 50, width: 84, height: 40 }, "999px")).toEqual({
    x: 94,
    y: 44,
    width: 96,
    height: 52,
    radius: "999px",
  });
});
test("a squared element keeps its corners, grown by the same 6px", () => {
  expect(blockFrame({ left: 0, top: 0, width: 216, height: 44 }, "12px").radius).toBe("18px");
});
test("the pointer colours come from the tokens in both themes", () => {
  /* tokens.test: --ut-color-pointer, -block, -light present in :root, dark media and [data-theme=dark] */
});
test("touch screens and reduced motion never load the pointer", () => {
  // pointer.client.ts source: dynamic import guarded by (pointer: fine) and not reduced motion
});
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `vp test apps/web/app/motion/pointer.test.ts packages/tokens`
Expected: FAIL

- [ ] **Step 3: 書く**

`global.css`:

- `html.has-pointer, html.has-pointer * { cursor: none; }`
- ポインターの層は `position: fixed; pointer-events: none; z-index` を最前面にする。
- 背景はトークンの色。吸い付いたときは `--ut-color-pointer-block` に、光の `radial-gradient(circle at var(--pointer-light-x) var(--pointer-light-y), var(--ut-color-pointer-light), transparent 60%)` を重ねる。
- キーボードの `:focus-visible` の輪は今のまま（ポインターとは別）。

- [ ] **Step 4: 通ることを確かめる**

Run: `vp test && pnpm --filter @ut42tech/web build && vp test`
Expected: PASS

- [ ] **Step 5: ブラウザで確かめる**

- 1280×800（マウス）: ナビの項目に重ねると、ポインターの層の幅が項目の幅 +12px になり、200ms で移る。外すと 20px の丸に戻る。
- Works の分類を押して中身が入れ替わっても、吸い付き先を見失わない。
- タッチの 390×844 と、動きを減らす設定: `html.has-pointer` が付かず、層も無い。

- [ ] **Step 6: コミット**

```bash
git add -A packages/tokens apps/web
git commit -m "feat(web): add a pointer that settles onto pressable elements on desktop"
```

---

### Task 5: 仕上げ（資料、全体の確認、重さ）

**Files:**

- Modify: `README.md`（「次に足すもの」の節を、できたことの説明に置き換える）、`docs/handoff.md`（段階2の完了、残り）

- [ ] **Step 1: 全体の検査**

Run: `vp run check && pnpm --filter @ut42tech/web build && vp test`
Expected: エラーなし、すべて PASS

- [ ] **Step 2: ページの重さを測る（本人の決定で最後に回したもの）**

`apps/web/.output/public/_nuxt/*.js` と CSS の合計（そのままと gzip 後）、`/ja/` が最初に読み込む JavaScript の合計を測り、`docs/handoff.md` に数値を書く。ポインターがタッチ端末で読み込まれていないことも確かめる。

- [ ] **Step 3: 資料を直してコミット**

```bash
git add -A README.md docs/handoff.md
git commit -m "docs: record motion phase 2 and the page weight"
```
