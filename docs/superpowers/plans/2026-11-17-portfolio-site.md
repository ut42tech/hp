# ポートフォリオ サイト（静的な画面）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/web` を、Figma で確定した見た目のとおりに作り直す。対象は、全ページ（Hello / About / Works の4分類 / Apps の詳細 / Press）、ライト／ダーク、スマホのシート表示とパソコンのツールバー表示。

**Architecture:**

- Astro の静的サイト（MPA）にする。URL ごとに1ページを書き出す。
- スマホとパソコンは同じ HTML を CSS で出し分ける。境目は 1024px。
  - 1024px 未満: Hello を地に、中身を「シート」として重ねる。
  - 1024px 以上: 上にツールバー、中身をページに直接置く。
- ページ間のつながりは、ブラウザ標準の画面遷移（`@view-transition { navigation: auto; }`）で取る。JavaScript のルーターは使わない。
- 動き（登場演出、文字の吸い付き、ポインター、シートを払う操作、詳細へ広がる遷移）は**この計画に含めない**。この計画が終わった後に、別の計画「動き」で足す。この計画では、その土台（要素の名前、`data-cursor`、`view-transition-name`）だけを置く。

**Tech Stack:** Astro 7、Vue 3（表示の切り替えだけ）、Tailwind CSS v4、TypeScript 6、Vite+（`vp`）、`vite-plus/test`、`@fontsource/line-seed-jp@5.3.2`、`@fontsource/geist-mono@5.3.0`、`lucide-static@1.73.0`、`simple-icons@16.38.0`、`node-html-parser`（テスト用）

**Spec:**

- 見た目: `docs/superpowers/specs/2026-11-17-portfolio-visual-design.md`
- 構造: `docs/superpowers/specs/2026-11-16-portfolio-wireframe-design.md`
- Figma: ファイル `ZPaC9SNAfMyKTROfRvAJyT`
  - スマホ: Hello `43:435`、About `43:458`、Works（Apps）`43:602`、Apps の詳細 `43:691`、Works（Career）`43:766`、Press `43:845`
  - パソコン: Hello `44:496`、About `44:523`、Works（Apps）`44:669`、Apps の詳細 `44:770`、Works（Career）`44:862`、Press `44:949`
  - 部品: `32:2`

## Global Constraints

- **値の出どころ**: 色・書体・角丸・余白・高さ・影は、見た目の設計書 5〜7.1 章の値だけを使う。ページの中で直接の色を書かない。色は `--ut-*` を通す。
- **境目**: 1024px（Tailwind の `lg`）。これは Claude の判断で、設計書は実装に任せている。
  - 1024px 未満はスマホの形。
  - 1024px 以上はパソコンの形。
  - Works の中身は、サイドバーの右端（248px）から画面の右端までの中央に置き、最大 840px。幅が足りないときは、左右に 32px を残して縮める。
- **安全な領域**:
  - viewport に `viewport-fit=cover` を指定する。
  - スマホの上の段の上端は `max(env(safe-area-inset-top), 12px)`、下は `max(env(safe-area-inset-bottom), 12px)`。
  - 横の余白は `20px + env(safe-area-inset-left/right)`。
- **ナビゲーションバー**: 項目は About / Works / Press の3つ。Hello では、どれも選ばない。今いる項目に `aria-current="page"` を付ける。
- **押せる要素**: すべてに `data-cursor="block"` を付ける（「動き」の計画で ipad-cursor が使う）。
- **アイコン**:
  - 操作のアイコンは Lucide（`lucide-static@1.73.0`）。線の太さは 1.75。
  - ブランドのアイコンは `simple-icons@16.38.0`。
  - LinkedIn だけは simple-icons 11.0.0 の形を、出典を書いてソースに写す。形は次のとおり。
    `M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z`
  - 飾りのアイコンには `aria-hidden="true"` を付ける。アイコンだけのボタンには `aria-label` を付ける。
- **書体**: LINE Seed JP（400 / 700 / 800）と Geist Mono（400）を `@fontsource` から読み込む。Geist Mono は英数字だけの箇所に使う。日本語を含む補足には `Caption` を使う。
- **文言は日本語**: 文言は Figma のとおりにする。「（仮）」の文章は、そのまま残してよい。公開前に本人が書き換える（Task 12 の README に一覧を書く）。
- **中身の素材**: `../hp-archive-materials/content` と `images` から移す。`../hp-archive-materials/private/` は開かない。複製もしない。
- **リポジトリに書かないもの**: 参考にしたサイトやテンプレートの名前を、コード・コメント・文書に書かない。
- **テスト**:
  - `vite-plus/test` から import する。
  - 実行はルートで `vp run @ut42tech/web#build && vp test` の順。`apps/web/test` はビルド結果を検査するので、先にビルドする。
- **仕上げの確認**: 各タスクの最後に `vp run check`（整形・Lint・型）を通す。
- **作業の単位**: 1タスクごとにコミットする。メッセージの最後に `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` を付ける。

## Review Focus

1. **ページを移ると、ライト／ダークが元に戻る、または一瞬光る**。保存値が `auto` や壊れた値のときも同じ。
   - Task 4 で、`readPreference` が壊れた値と例外のときに `auto` を返すことを確かめる。
   - 同じく Task 4 で、ビルド結果の全ページの `<head>` に、最初の描画より前に動くテーマのスクリプトがあることを確かめる。
2. **共有された `/works/apps/<slug>` を直接開く**。そのページから一覧へ戻れること、JavaScript が無くても読めることが必要。
   - Task 8 で、ビルド結果に `<dialog open` と一覧へ戻るリンク `href="/works/apps"` があることを確かめる。
3. **長い題名・画像が無い・Demo や GitHub が無い作品**で、カードの高さがそろい、無いボタンは出さないこと。
   - Task 5 で、`initialOf` と書式化の関数を確かめる。
   - Task 8 で、Demo の無い作品のページに Demo のリンクが無いことを確かめる。
4. **アイコンだけのボタンとリンクに名前が無い**（スクリーンリーダーで読めない）。
   - Task 11 で、全ページの `a` と `button` のうち、文字も `aria-label` も無いものが0件であることを確かめる。
5. **iPhone の切り欠きとホームインジケーターに部品が重なる**。
   - Task 4 で、viewport の `viewport-fit=cover` を確かめる。
   - Task 11 で、iPhone の画面（390×844、上 47 / 下 34 の安全な領域）を再現したスクリーンショットで確かめる。

---

### Task 1: デザイントークン

**Files:**

- Modify: `packages/tokens/tokens.css`
- Modify: `packages/tokens/theme.css`
- Test: `packages/tokens/tokens.test.ts`

**Interfaces:**

- Produces:
  - CSS 変数（見た目の設計書 5 章と 7 章の `--ut-*` すべて）。加えて `--ut-font-sans: "LINE Seed JP", system-ui, sans-serif` と `--ut-font-mono: "Geist Mono", ui-monospace, monospace`。
  - Tailwind のユーティリティ:
    - 色: `bg-surface`、`text-muted`、`bg-bar`、`bg-bar-active`、`text-on-bar`、`text-on-bar-muted`、`bg-fill`、`bg-placeholder`、`bg-scrim`、`bg-curtain`、`text-on-curtain`、`border-border`、`text-fg`、`bg-bg`。
    - 角丸: `rounded-card`（16）、`rounded-row`（12）、`rounded-sheet`（28）、`rounded-control`（999）。
    - 影: `shadow-float`、`shadow-sheet`。
    - 文字（`@utility`）: `text-display`、`text-title-l`（30、`lg` で 40）、`text-title-m`、`text-headline`、`text-card-title`、`text-body`、`text-callout`、`text-caption`、`text-mono`。
    - 書体は、`text-mono` だけが `--ut-font-mono`、ほかは `--ut-font-sans`。

- [ ] **Step 1: 失敗するテストを書く**

```ts
describe("contrast (WCAG AA)", () => {
  const pairs: [fg: string, bg: string, min: number][] = [
    ["--ut-color-fg", "--ut-color-bg", 16],
    ["--ut-color-muted", "--ut-color-bg", 4.5],
    ["--ut-color-muted", "--ut-color-surface", 4.5],
    ["--ut-color-on-bar", "--ut-color-bar-active", 4.5],
    ["--ut-color-on-bar-muted", "--ut-color-bar", 4.5],
    ["--ut-color-on-curtain", "--ut-color-curtain", 4.5],
  ];
  test.each(["light", "dark"] as const)("%s mode meets the minimums", (mode) => {
    for (const [fg, bg, min] of pairs) expect(contrast(color(mode, fg), color(mode, bg))).toBeGreaterThanOrEqual(min);
  });
});
test("theme.css maps radius, shadow and type tokens", () => {
  const theme = read("./theme.css");
  for (const name of ["--radius-card", "--radius-row", "--radius-sheet", "--radius-control", "--shadow-float", "--shadow-sheet"])
    expect(theme).toContain(name);
  for (const u of ["text-display", "text-title-l", "text-card-title", "text-mono"]) expect(theme).toContain(`@utility ${u}`);
});
```

テストの中にも、関数を2つ書く。

- `color(mode, name)`: `tokens.css` の `:root {` の塊（light）と `:root[data-theme="dark"]` の塊（dark）から `#RRGGBB` を読む。
- `contrast(a, b)`: WCAG の相対輝度から比を出す。

既存の「dark mode defines every light color token」と「theme.css maps every color token」のテストは、そのまま残す。

- [ ] **Step 2: 失敗を確かめる**

Run: `vp test packages/tokens`
Expected: FAIL（`--ut-color-surface` が無い）

- [ ] **Step 3: `tokens.css` と `theme.css` を設計書の値に置き換える**

- **値**: 5 章の表の Light / Dark と、7 章の表（角丸、余白、幅、イージング、時間、影）。
- **透明度のある色**（`fill`、`scrim`）: `rgb(0 0 0 / 7%)` のように書く。
- **ダークの値の置き場所**: 今の3つの塊に揃えて書く。
  - `:root`
  - `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`
  - `:root[data-theme="dark"]`
- **`--ut-radius`**: `var(--ut-radius-row)` の別名として残す（7 章）。
- **`--ut-color-accent`**: `var(--ut-color-fg)`（5 章）。
- **`@utility text-title-l`**: `@media (width >= 64rem)` を中に入れて、40px に切り替える。

- [ ] **Step 4: 通ることを確かめる**

Run: `vp test packages/tokens`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add packages/tokens
git commit -m "feat(tokens): apply portfolio visual design tokens"
```

---

### Task 2: プロフィール（メールと LinkedIn）

**Files:**

- Modify: `packages/profile/src/types.ts`
- Modify: `packages/profile/src/profile.ts`
- Test: `packages/profile/src/profile.test.ts`

**Interfaces:**

- Produces:
  - `SocialIcon`: `"x" | "github" | "linkedin" | "qiita" | "zenn" | "note" | "youtube" | "wantedly"`
  - `Profile.email: string`
  - `profile.social` の順: X、GitHub、LinkedIn、Qiita、Zenn、note、YouTube、Wantedly

- [ ] **Step 1: 本人に LinkedIn のプロフィール URL を聞く**

推測で書かない。返事が来るまで、このタスクは止める。

- [ ] **Step 2: 失敗するテストを書く**

```ts
test("contact", () => {
  expect(profile.email).toBe("hello@ut42tech.com");
  expect(profile.social.map((l) => l.icon)).toEqual(["x", "github", "linkedin", "qiita", "zenn", "note", "youtube", "wantedly"]);
});
```

既存の `expect(profile.social.length).toBe(7)` は 8 に変える。

- [ ] **Step 3: 失敗を確かめる** — Run: `vp test packages/profile` / Expected: FAIL

- [ ] **Step 4: 型と値を足す**

- [ ] **Step 5: 通ることを確かめる** — Run: `vp test packages/profile` / Expected: PASS

- [ ] **Step 6: コミット**

```bash
git commit -am "feat(profile): add email and LinkedIn"
```

---

### Task 3: アイコン

**Files:**

- Modify: `apps/web/package.json`（`lucide-static@1.73.0`、`simple-icons@16.38.0` を dependencies に足す）
- Create: `apps/web/src/lib/icons.ts`
- Create: `apps/web/src/components/Icon.astro`
- Test: `apps/web/src/lib/icons.test.ts`

**Interfaces:**

- Consumes: `SocialIcon`（Task 2）
- Produces:

```ts
export type UiIconName = "chevron-left" | "x" | "arrow-up-right" | "arrow-up-down" | "sun" | "moon" | "monitor" | "copy" | "mail";
export type SkillIcon = "typescript" | "python" | "swift" | "react" | "nextdotjs" | "vuedotjs" | "astro" | "threedotjs" | "unity" | "blender" | "figma";
export type BrandIconName = SocialIcon | SkillIcon | "speakerdeck";
export function uiIcon(name: UiIconName, size: number): string;   // <svg> markup
export function brandIcon(name: BrandIconName, size: number): string;
export const brandLabel: Record<BrandIconName, string>; // 例: nextdotjs → "Next.js", speakerdeck → "Speaker Deck"
```

`Icon.astro` は `{ ui?: UiIconName; brand?: BrandIconName; size: number; class?: string }` を受け取り、`set:html` で描く。

- [ ] **Step 1: 失敗するテストを書く**

```ts
test("ui icons are lucide outlines at stroke 1.75", () => {
  const svg = uiIcon("x", 16);
  expect(svg).toMatch(/^<svg/);
  expect(svg).toContain('width="16"');
  expect(svg).toContain('stroke-width="1.75"');
  expect(svg).toContain('stroke="currentColor"');
  expect(svg).toContain('aria-hidden="true"');
  expect(svg).not.toContain("<!--");
});
test("brand icons are filled single-color paths", () => {
  const svg = brandIcon("github", 18);
  expect(svg).toContain('fill="currentColor"');
  expect(svg).toContain('viewBox="0 0 24 24"');
});
test("every brand has an icon and a label", () => {
  for (const name of Object.keys(brandLabel) as BrandIconName[]) expect(brandIcon(name, 24)).toContain("<path");
});
test("linkedin uses the simple-icons 11.0.0 path", () => {
  expect(brandIcon("linkedin", 18)).toContain("M20.447 20.452h-3.554");
});
```

- [ ] **Step 2: 失敗を確かめる** — Run: `vp test apps/web/src/lib/icons` / Expected: FAIL

- [ ] **Step 3: 実装する**

- **Lucide**: `lucide-static` の名前付き export（`ChevronLeft` などの SVG 文字列）を元にする。
  - 先頭のライセンスのコメントと `class` を外す。
  - `width` / `height` / `stroke-width` を書き換え、`aria-hidden="true" focusable="false"` を足す。
  - 書き換えは、モジュールを読み込んだときに1度だけ行う。
- **ブランド**: `simple-icons` の `si*`（`siGithub` など）の `path` を使う。
  - LinkedIn は Global Constraints の形を使う。
  - 出典のコメント（`simple-icons 11.0.0, CC0`）を書く。

- [ ] **Step 4: 通ることを確かめる** — Run: `vp test apps/web/src/lib/icons` / Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add apps/web/package.json pnpm-lock.yaml apps/web/src/lib/icons.ts apps/web/src/lib/icons.test.ts apps/web/src/components/Icon.astro
git commit -m "feat(web): add icon helpers"
```

---

### Task 4: 土台のレイアウトと表示の切り替え

**Files:**

- Modify: `apps/web/package.json`（`@fontsource/line-seed-jp@5.3.2`、`@fontsource/geist-mono@5.3.0` と、devDependencies に `node-html-parser` を足す）
- Modify: `apps/web/src/lib/theme.ts`
- Modify: `apps/web/src/lib/theme.test.ts`
- Rewrite: `apps/web/src/components/ThemeToggle.vue`
- Create: `apps/web/src/layouts/Site.astro`（`Base.astro` を置き換えて削除する）
- Create: `apps/web/src/components/SiteHeader.astro`
- Create: `apps/web/src/components/NavBar.astro`
- Create: `apps/web/src/components/HelloStage.astro`
- Modify: `apps/web/src/styles/global.css`
- Rewrite: `apps/web/src/pages/index.astro`
- Create: `apps/web/test/html.ts`
- Rewrite: `apps/web/test/build-output.test.ts`

**Interfaces:**

- Consumes: トークン（Task 1）、`uiIcon`（Task 3）、`profile`（Task 2）
- Produces:

```ts
// lib/theme.ts
export type Theme = "light" | "dark";
export type ThemePreference = "auto" | "light" | "dark";
export const THEME_STORAGE_KEY = "ut42tech:theme";
export function readPreference(storage: Pick<Storage, "getItem"> | undefined): ThemePreference; // 無い・壊れた値・例外 → "auto"
export function storePreference(storage: Pick<Storage, "setItem" | "removeItem"> | undefined, pref: ThemePreference): void; // "auto" は removeItem
export function resolveTheme(pref: ThemePreference, prefersDark: boolean): Theme;
export function nextPreference(pref: ThemePreference): ThemePreference; // auto → light → dark → auto
```

```ts
// Site.astro props
type Section = "hello" | "about" | "works" | "press";
interface Props {
  title?: string;        // 省略時 "ut42tech"。指定時は `${title} — ut42tech`
  description?: string;  // 省略時 profile.mottoEn
  section: Section;
}
```

- **`Site.astro` の中身**: `SiteHeader`、`HelloStage`、`<main id="content" data-section={section}>`（中身は slot）、`NavBar current={section}` の順に描く。
- **テスト用の関数**: `test/html.ts` に `loadPage(route: string): HTMLElement` を置く。`dist/<route>/index.html` を `node-html-parser` で読み込む。

- [ ] **Step 1: 失敗するテストを書く**

`theme.test.ts` を、次の内容で書き直す。

```ts
test("readPreference falls back to auto", () => {
  expect(readPreference(undefined)).toBe("auto");
  expect(readPreference({ getItem: () => "sepia" })).toBe("auto");
  expect(readPreference(throwing)).toBe("auto");
  expect(readPreference({ getItem: () => "dark" })).toBe("dark");
});
test("auto follows the OS", () => {
  expect(resolveTheme("auto", true)).toBe("dark");
  expect(resolveTheme("light", true)).toBe("light");
});
test("nextPreference cycles auto → light → dark → auto", () => {
  expect(["auto", "light", "dark"].map((p) => nextPreference(p as ThemePreference))).toEqual(["light", "dark", "auto"]);
});
test("storing auto removes the key", () => {
  const calls: string[] = [];
  storePreference({ setItem: () => calls.push("set"), removeItem: () => calls.push("remove") }, "auto");
  expect(calls).toEqual(["remove"]);
});
test("storePreference swallows storage errors", () => expect(() => storePreference(throwing, "dark")).not.toThrow());
```

`build-output.test.ts` を、次の内容で書き直す。

```ts
const hello = loadPage("/");
test("is Japanese with a safe-area viewport", () => {
  expect(hello.querySelector("html")!.getAttribute("lang")).toBe("ja");
  expect(hello.querySelector('meta[name="viewport"]')!.getAttribute("content")).toContain("viewport-fit=cover");
});
test("sets the theme before first paint", () =>
  expect(hello.querySelectorAll("head script").some((s) => s.textContent.includes("ut42tech:theme"))).toBe(true));
test("hello greets without selecting a nav item", () => {
  expect(hello.querySelector('[aria-label="Welcome."]')).not.toBeNull();
  expect(hello.querySelector('nav [aria-current="page"]')).toBeNull();
  expect(hello.querySelectorAll("nav a").map((a) => a.getAttribute("href"))).toEqual(["/about", "/works/apps", "/press"]);
});
test("handle links home", () => expect(hello.querySelector('header a[href="/"]')!.textContent).toContain("@ut42tech"));
test("has a favicon", () => expect(hello.querySelector('link[rel="icon"]')).not.toBeNull());
```

- [ ] **Step 2: 失敗を確かめる** — Run: `vp run @ut42tech/web#build && vp test apps/web` / Expected: FAIL

- [ ] **Step 3: 実装する**

**テーマ**

- **最初の描画より前に動くスクリプト**（`Site.astro` の `<head>`、`is:inline`）:
  - 保存値が `light` / `dark` ならそれを使う。それ以外は OS の設定に従う。
  - `prefers-color-scheme` の変化も受け取る。ただし、保存値が無いときだけ従う。
- **`ThemeToggle.vue`**:
  - 押すたびに `nextPreference` で次の設定に進む。
  - アイコンは設定に合わせる。auto は `monitor`、light は `sun`、dark は `moon`（20px、`uiIcon` を `v-html`）。
  - `aria-label` は `表示: 自動` / `表示: ライト` / `表示: ダーク`。
  - 押せる範囲は 44×44。面と影は付けない。
  - 島は `client:load`。

**ヘッダー**（`SiteHeader.astro`）

- 左: ハンドルのリンク `@ut42tech`（`href="/"`、`text-headline`）。
- 右: `ThemeToggle`。
- スマホ:
  - 上の段に置く。上端は `max(env(safe-area-inset-top), 12px)`、高さは 44。
  - 横の余白は 20。表示の切り替えは、アイコンの右端を余白にそろえる。
- パソコン:
  - `position: fixed`、高さ 76。
  - 横の余白は、左 32 / 右 20（アイコンの右端が 32 にそろう）。

**ナビゲーションバー**（`NavBar.astro`）

- `<nav aria-label="メイン">`。
- 形と色:
  - `bg-bar`、高さ 48、中の余白 4。
  - 項目は 84×40 のカプセル。今いる項目は `bg-bar-active` と `text-on-bar`、ほかは `text-on-bar-muted`。
  - 影は `shadow-float`。
- 置き場所:
  - スマホ: 下の中央。下端は `max(env(safe-area-inset-bottom), 12px) + 8px`。
  - パソコン: 上の中央、上から 14px。
- `view-transition-name: nav` を付ける。

**Hello**（`HelloStage.astro`）

- 「Welcome.」を `h1` にして `aria-label="Welcome."`、文字ごとの `span` は `aria-hidden="true"`。下に「to ut42tech」を置く。
- 書体: `text-display`、`text-callout text-muted`。
- 置き場所: 画面の中央。
- 見せる場面:
  - スマホ: いつも地として見せる。
  - パソコン: `section="hello"` のときだけ見せる。

**`global.css`**

- フォントの CSS を読み込む。
  - `@fontsource/line-seed-jp/400.css`、`700.css`、`800.css`
  - `@fontsource/geist-mono/400.css`
- `@view-transition { navigation: auto; }`。
- フォーカスの枠（`fg` の 2px の線を 2px 離す）。
- `prefers-reduced-motion` のときは、画面遷移を止める。

**`index.astro`**

- `<Site section="hello" />` だけにする。

- [ ] **Step 4: 通ることを確かめる** — Run: `vp run @ut42tech/web#build && vp test apps/web` / Expected: PASS

- [ ] **Step 5: 見た目を確かめる**

- `vp run dev` で開発サーバーを立てる。
- Chrome DevTools で `/` を開き、390×844 と 1440×900 のスクリーンショットを撮る。ライトとダークの両方を撮る。
- Figma の `43:435` / `43:1023` / `44:496` / `44:1020` と比べる。
- 次を確かめる。
  - ナビゲーションバーの高さと位置。
  - ハンドルとアイコンの位置。
  - 「Welcome.」の大きさと位置。

- [ ] **Step 6: `vp run check` を通してコミット**

```bash
git add -A apps/web pnpm-lock.yaml
git commit -m "feat(web): add site shell, nav bar and theme preference"
```

---

### Task 5: 中身の型と素材

**Files:**

- Create: `apps/web/src/content.config.ts`
- Create: `apps/web/src/content/{apps,career,events,awards,press}/*.md`
- Create: `apps/web/src/assets/works/**`（素材の画像を写す）
- Create: `apps/web/src/lib/works.ts`
- Test: `apps/web/src/lib/works.test.ts`

**Interfaces:**

- Produces:
  - コレクション（`glob` loader、Markdown の frontmatter）。日付は `YYYY-MM-DD` か `YYYY-MM` の文字列。
    - `apps`: `title`、`date`、`thumbnail?: image()`、`initial?`、`demo?: url`、`github?: url`、`stack: SkillIcon[]`。本文が説明になる。
    - `career`: `title`、`start`、`end?`、`summary`、`thumbnail?`、`initial?`
    - `events`: `title`、`date`、`thumbnail?`、`initial?`、`url?`
    - `awards`: `title`、`date`、`initial?`
    - `press`: `title`、`date`、`url`、`source: "note" | "youtube" | "zenn" | "qiita" | "speakerdeck" | "other"`、`outlet: string`（媒体名として出す文字）、`thumbnail?`
  - 関数:

```ts
export type SortOrder = "newest" | "oldest";
export type Category = "apps" | "career" | "awards" | "events";
export const categories: readonly Category[]; // ["apps", "career", "awards", "events"]
export const categoryLabel: Record<Category, string>; // Apps / Career / Awards / Events
export function formatMonth(date: string): string;              // "2026-03-15" → "2026.03"
export function formatPeriod(start: string, end?: string): string; // end なし → "2025.04 –"、同じ月 → "2024.08"、それ以外 → "2024.05 – 2024.08"
export function sortByDate<T>(items: T[], key: (item: T) => string, order: SortOrder): T[]; // 同じ日付は元の順を保つ
export function nextOrder(order: SortOrder): SortOrder;
export const orderLabel: Record<SortOrder, string>; // newest → "新しい順"、oldest → "古い順"
export function initialOf(title: string, override?: string): string; // override 優先。無ければ最初の1文字（英字は大文字）
```

- [ ] **Step 1: 失敗するテストを書く**

```ts
test("formatMonth", () => { expect(formatMonth("2026-03-15")).toBe("2026.03"); expect(formatMonth("2024-08")).toBe("2024.08"); });
test("formatPeriod", () => {
  expect(formatPeriod("2025-04")).toBe("2025.04 –");
  expect(formatPeriod("2024-08", "2024-08")).toBe("2024.08");
  expect(formatPeriod("2024-05", "2024-08")).toBe("2024.05 – 2024.08");
});
test("sortByDate is newest-first and stable", () => {
  const items = [{ d: "2024-01", n: "a" }, { d: "2026-03", n: "b" }, { d: "2024-01", n: "c" }];
  expect(sortByDate(items, (i) => i.d, "newest").map((i) => i.n)).toEqual(["b", "a", "c"]);
  expect(sortByDate(items, (i) => i.d, "oldest").map((i) => i.n)).toEqual(["a", "c", "b"]);
});
test("initialOf", () => {
  expect(initialOf("tangi")).toBe("T");
  expect(initialOf("道路標識 OCR")).toBe("道");
  expect(initialOf("ゼンリン R&D部門", "Z")).toBe("Z");
});
test("orders toggle", () => expect(nextOrder(nextOrder("newest"))).toBe("newest"));
```

- [ ] **Step 2: 失敗を確かめる** — Run: `vp test apps/web/src/lib/works` / Expected: FAIL

- [ ] **Step 3: `works.ts` と `content.config.ts` を書く**

- `z` は `astro/zod` から、loader は `astro/loaders` の `glob` を使う。
- `stack` の要素は `SkillIcon` の値だけを許す。

- [ ] **Step 4: 素材を移す**

| 移し先 | 元 | 書き方 |
| --- | --- | --- |
| `apps` | `content/projects/*.md`（10件） | `links` の `kind` が demo / github のものを `demo` / `github` に入れる。`summary` と本文を合わせて本文にする。`stack` は空でよい。 |
| `career` | `content/works/*.md` | 構造の設計書 5 章の Career の表に当たるものだけを入れる。 |
| `events` / `awards` | `content/works` と `content/timeline` | 構造の設計書 5 章の表に挙がっている項目だけを入れる。 |
| `press` | `content/press/*.md` | `outlet` を媒体名にする。`source: "other"` にする。 |

- 画像: `images/` から `src/assets/works/<collection>/` に写し、`thumbnail` に相対パスで書く。
- 開始と終了の月: 素材に無ければ、`date` の月を開始にする。終了は空にする。
- 素材に無い Press（note、Zenn などの記事）は作らない。

- [ ] **Step 5: 通ることを確かめる**

Run: `vp test apps/web/src/lib/works && vp run @ut42tech/web#build`
Expected: PASS。ビルドが frontmatter の型で落ちない。

- [ ] **Step 6: コミット**

```bash
git add apps/web/src/content.config.ts apps/web/src/content apps/web/src/assets apps/web/src/lib/works.ts apps/web/src/lib/works.test.ts
git commit -m "feat(web): add works and press content"
```

---

### Task 6: カード・横長カード・並び替え

**Files:**

- Create: `apps/web/src/components/Thumb.astro`
- Create: `apps/web/src/components/Card.astro`
- Create: `apps/web/src/components/RowCard.astro`
- Create: `apps/web/src/components/SortButton.astro`
- Create: `apps/web/src/scripts/sort.ts`

**Interfaces:**

- Consumes: `brandIcon`（Task 3）、`formatMonth` / `initialOf` / `orderLabel` / `nextOrder`（Task 5）
- Produces:

```ts
// Thumb.astro
interface Props { image?: ImageMetadata; alt: string; initial: string; brand?: BrandIconName; widths: number[]; sizes: string }
// Card.astro
interface Props { href?: string; external?: boolean; title: string; meta: string; image?: ImageMetadata; initial: string; brand?: BrandIconName } // href が無いときは div
// RowCard.astro
interface Props { href?: string; title: string; period: string; summary: string; image?: ImageMetadata; initial: string }
// SortButton.astro
interface Props { list: string } // 並べ替える一覧の id
```

**`Thumb.astro`**

- 比率は 16:10。`object-fit: cover`。
- 画像が無いときは `bg-placeholder` の面に、次のどちらかを出す。
  - `brand` があればブランドのアイコン（32、`text-muted`）。
  - 無ければ頭文字（`text-title-m text-muted`）。

**`Card.astro`**

- 構成: `a` 全体が1枚のカード（`bg-surface`、`border-border` の 1px 内側、`rounded-card`、`overflow: hidden`）。
- 題名: `text-card-title`、`line-clamp: 2`、`min-height: 40px`。
- 補足: `class="meta"`、`text-mono text-muted`、1行で「…」。
- 本文の余白: 上 12 / 横 12 / 下 12。
- 外部へのリンク: `target="_blank" rel="noopener"`。

**`RowCard.astro`**

- 高さは 100。
- 画像の幅: スマホ 96、`lg` で 160。
- 本文は縦の中央にそろえる。
  - 期間: `text-mono`
  - 題名: `text-card-title`。`lg` では `text-headline`。最大2行。
  - 説明: `text-callout text-muted`、1行。

**`SortButton.astro`**

- 形: 高さ 36、カプセル、`border-border` の 1px 内側。
- アイコン `arrow-up-down`（14）と文字の間は 8。
- 動き（`scripts/sort.ts`）: 押すと、`#list` の子要素の順を逆にし、文字を `orderLabel[nextOrder]` に変える。
- JavaScript が無いときは、新しい順のまま。

- [ ] **Step 1: 一覧の試しのページを作る**

ビルドの検査は、次のタスクの Works のページで行う。ここでは見た目だけを確かめる。

- `src/pages/_dev/cards.astro` を作る。`_` で始まるので、書き出されない。
- 載せるカード:
  - 長い題名（60文字）
  - 画像なし
  - ブランドのフォールバック

- [ ] **Step 2: 見た目を確かめる**

- 390 と 1440 で、Figma の部品 `33:126`（Card）と `33:153`（RowCard）に合うことを確かめる。
- 題名の長さによらず、カードの高さが同じであることも確かめる。

- [ ] **Step 3: `_dev/cards.astro` を消し、`vp run check` を通してコミット**

```bash
git add apps/web/src/components apps/web/src/scripts
git commit -m "feat(web): add card, row card and sort button"
```

---

### Task 7: Works の一覧（4分類）

**Files:**

- Create: `apps/web/src/components/WorksNav.astro`（スマホの切り替えと、パソコンのサイドバー）
- Create: `apps/web/src/components/WorksList.astro`
- Create: `apps/web/src/components/Sheet.astro`
- Create: `apps/web/src/components/PageHead.astro`
- Create: `apps/web/src/pages/works/[category].astro`
- Modify: `apps/web/astro.config.mjs`（`redirects: { "/works": "/works/apps" }`）
- Test: `apps/web/test/works.test.ts`

**Interfaces:**

- Consumes: `Site`（Task 4）、`Card` / `RowCard` / `SortButton`（Task 6）、コレクションと `categories`（Task 5）
- Produces:
  - `Sheet.astro`: `{ receded?: boolean }`。スマホのシートの外形を描く。中身は slot。
    - 外形: 取っ手（36×5、`border` の色、カプセル）。見出しは持たない（`PageHead` が持つ）。
    - 位置: 上端は上の段の下 8px。
    - 形: `rounded-sheet` の上だけ、`shadow-sheet`、`bg-surface`。
    - スクロール: 中だけでスクロールし、`overscroll-behavior: contain`。下にはナビゲーションバーの分の余白を取る。
    - `lg` では外形を消し、ただの領域になる。
  - `PageHead.astro`: `{ title: string; as?: "h1" | "h2"; show?: "both" | "mobile" | "desktop"; count?: number; sortList?: string }`。ページの見出しの行。
    - 見出し: `text-title-l`。`show` に合わない幅では、見えなくするだけで読み上げには残す（`sr-only`）。
    - スマホ: 見出しの下に、件数「n 件」（`text-caption`）と `SortButton` の行。
    - パソコン: 見出しの右に件数、行の右端に `SortButton`。
    - `count` と `sortList` が無ければ、見出しだけ。
  - `WorksList.astro`: `{ category: Category; heading?: "h1" | "h2" }`。
    - 先頭に `PageHead`（分類名、`show="desktop"`、件数、`sortList="works-list"`）。
    - 一覧の id は `works-list`。
  - `WorksNav.astro`: `{ current: Category }`。2つを描く。
    - スマホの切り替え: 高さ 40、中の項目 32、カプセル。
    - パソコンのサイドバー: `bg-surface` の線付きカード、角丸 16、内側の余白 4、項目の高さ 44・角丸 12、画面の上下の中央に `position: fixed`、左 32、幅 216。
    - 今いる項目は `fg` の面と `bg` の文字、`aria-current="page"`。

- [ ] **Step 1: 失敗するテストを書く**

```ts
test.each(["apps", "career", "awards", "events"])("/works/%s lists its items", (c) => {
  const page = loadPage(`/works/${c}`);
  expect(page.querySelector('nav[aria-label="メイン"] [aria-current="page"]')!.getAttribute("href")).toBe("/works/apps");
  expect(page.querySelectorAll(`a[href="/works/${c}"][aria-current="page"]`).length).toBe(2); // 切り替えとサイドバー
  expect(page.querySelector("#works-list")!.childNodes.length).toBeGreaterThan(0);
});
test("apps cards link to their detail pages", () => {
  const hrefs = loadPage("/works/apps").querySelectorAll("#works-list a").map((a) => a.getAttribute("href"));
  expect(hrefs.every((h) => /^\/works\/apps\/[\w-]+$/.test(h!))).toBe(true);
});
test("/works redirects to apps", () => expect(readDist("works/index.html")).toContain("/works/apps"));
test("default order is newest first", () => {
  const dates = loadPage("/works/apps").querySelectorAll("#works-list .meta").map((m) => m.textContent);
  expect(dates).toEqual([...dates].sort().reverse());
});
```

`readDist(path)` は、`test/html.ts` に足す。

- [ ] **Step 2: 失敗を確かめる** — Run: `vp run @ut42tech/web#build && vp test apps/web/test/works` / Expected: FAIL

- [ ] **Step 3: 実装する**

- `getStaticPaths` で、4分類のページを書き出す。
- ページの見出し: `PageHead title="Works" show="mobile"`（`h1`）→ `WorksNav` → `WorksList`（分類名は `h2`）。1ページに `h1` は1つ。
- 中身の並べ方:
  - Apps / Awards / Events: `Card`。
    - スマホ: 2列、間 16。
    - パソコン: 3列、間 24、カードの幅 264。
  - Career: `RowCard` を縦1列、間 12。
- 中身の幅: パソコンでは、`main` の左に 248px を空け、残りの中央に最大 840px で置く。
- Awards のカードの補足は日付だけ。リンク先は無いので `href` を渡さない。
- Events は `url` があれば外へ開くリンク、無ければ `href` を渡さない。

- [ ] **Step 4: 通ることを確かめる** — Run: `vp run @ut42tech/web#build && vp test apps/web/test/works` / Expected: PASS

- [ ] **Step 5: 見た目を確かめる**

- 390 と 1440、ライトとダークで撮る。
- Figma の `43:602` / `43:766` / `43:1043` / `44:669` / `44:862` / `44:1047` と比べる。
- 次を確かめる。
  - サイドバーが上下の中央にあり、中身が領域の中央にある。
  - スマホでシートが上の段の下から始まり、最後のカードがナビゲーションバーに隠れない。

- [ ] **Step 6: `vp run check` を通してコミット**

```bash
git add apps/web
git commit -m "feat(web): add works category pages"
```

---

### Task 8: Apps の詳細

**Files:**

- Create: `apps/web/src/pages/works/apps/[slug].astro`
- Create: `apps/web/src/components/AppDetail.astro`
- Create: `apps/web/src/scripts/detail-sheet.ts`
- Test: `apps/web/test/app-detail.test.ts`

**Interfaces:**

- Consumes: `Sheet` / `WorksList` / `WorksNav`（Task 7）、`Thumb`（Task 6）、`brandIcon` / `brandLabel`（Task 3）
- Produces:
  - `AppDetail.astro`: `{ entry: CollectionEntry<"apps"> }`。
  - `<dialog open class="app-detail" data-close-href="/works/apps">` で描く。中の順:
    1. 閉じる（スマホ: ×、32px の `fill` の丸、`aria-label="閉じる"`）
    2. 戻る（パソコン: `‹ Apps` の `fill` のカプセル、高さ 36）
    3. 画像（16:10）
    4. 補足「YYYY.MM · Apps」
    5. `h1` の題名（`text-title-l`）
    6. 本文（`text-body`）
    7. ボタン（Demo は `fg` の面、GitHub は線。高さ 40。外部の印 `arrow-up-right` 14。`data-link="demo"` / `data-link="github"`。無いものは出さない）
    8. Stack のタイル（48、角丸 12、アイコン 22、`title` にブランド名）
  - 閉じると戻るは、どちらも `href="/works/apps"` のリンクにする。

- [ ] **Step 1: 失敗するテストを書く**

```ts
const slugs = readdirSync(new URL("../src/content/apps/", import.meta.url)).map((f) => f.replace(/\.md$/, ""));
test.each(slugs)("/works/apps/%s renders a readable detail without JS", (slug) => {
  const page = loadPage(`/works/apps/${slug}`);
  const dialog = page.querySelector("dialog.app-detail")!;
  expect(dialog.hasAttribute("open")).toBe(true);
  expect(dialog.querySelector("h1")!.textContent.trim().length).toBeGreaterThan(0);
  expect(dialog.querySelectorAll('a[href="/works/apps"]').length).toBe(2); // 閉じる・戻る
});
test("missing links are not rendered", () => {
  for (const slug of slugs) {
    const page = loadPage(`/works/apps/${slug}`);
    const fm = readFrontmatter(`apps/${slug}.md`);
    expect(page.querySelector('dialog a[data-link="demo"]') !== null).toBe(Boolean(fm.demo));
    expect(page.querySelector('dialog a[data-link="github"]') !== null).toBe(Boolean(fm.github));
  }
});
```

`readFrontmatter` は `test/html.ts` に足す。中身は、YAML の先頭の塊から `key: value` を読むだけの小さな関数でよい。

- [ ] **Step 2: 失敗を確かめる** — Run: `vp run @ut42tech/web#build && vp test apps/web/test/app-detail` / Expected: FAIL

- [ ] **Step 3: 実装する**

**ページの構成**

- `[slug].astro` は、`Site section="works"` の中に次の3つを置く。
  - `WorksNav current="apps"`
  - `Sheet receded`（中に `PageHead title="Works" as="h2" show="mobile"` と `WorksList category="apps"`。題名の `h1` は詳細だけが持つ）
  - `AppDetail`

**スマホ（1024px 未満）**

- 詳細のシート:
  - `position: fixed`。上端は Works のシートと同じ。ナビゲーションバーより手前に出す。
  - 外形はシートと同じ。取っ手と閉じるの行は高さ 40。
- 下の Works のシート（`receded`）: 左右を 12px 狭め、上端を 10px 上げる。
- 暗くする層: `dialog::backdrop` に `--ut-color-scrim`。

**パソコン（1024px 以上）**

- 一覧を隠す（`receded` の Sheet を `display: none`）。
- `dialog` を普通の流れに置く。`position: static`、ブラウザ標準の余白と枠を外す。
- 幅は 720。サイドバーの右の領域の中央に置く。

**`scripts/detail-sheet.ts`**

- 1024px 未満のときだけ、`open` を外して `showModal()` を呼ぶ。後ろを操作できない状態にするため。
- `cancel`（Esc）を受けたら、既定の動きを止めて `location.href = data-close-href` へ移る。

- [ ] **Step 4: 通ることを確かめる** — Run: `vp run @ut42tech/web#build && vp test apps/web/test/app-detail` / Expected: PASS

- [ ] **Step 5: 見た目と操作を確かめる**

- Figma の `43:691`（スマホ）と `44:770`（パソコン）と比べる。
- スマホの幅で次を確かめる。
  - Tab キーが詳細の外へ出ない。
  - Esc で一覧に戻る。
  - JavaScript を切っても読める。

- [ ] **Step 6: `vp run check` を通してコミット**

```bash
git add apps/web
git commit -m "feat(web): add app detail sheet"
```

---

### Task 9: About

**Files:**

- Create: `apps/web/src/data/about.ts`
- Create: `apps/web/src/pages/about.astro`
- Create: `apps/web/src/scripts/copy-email.ts`
- Test: `apps/web/test/about.test.ts`

**Interfaces:**

- Consumes: `profile`（Task 2）、`brandIcon` / `brandLabel` / `uiIcon`（Task 3）、`Sheet`（Task 7）
- Produces:

```ts
// data/about.ts
export const about: {
  affiliation: [string, string];
  intro: string;
  history: string;
  notes: { sns: string; email: string };
};
export const skills: readonly SkillIcon[];
```

**値**（Figma のとおり）

- `affiliation`: `["長崎大学大学院 総合生産科学研究科", "瀬戸崎研究室"]`。パソコンは ` · ` でつなぎ、スマホは改行する。
- `intro`: 「（仮）長崎大学大学院の修士学生。デザインとエンジニアリングの両方から、触って気持ちのいい体験をつくっています。画面の設計から実装、動きの調整まで、ひとりで通して作るのが好きです。」
- `history`: 「（仮）長崎県で生まれ、横浜で育つ。長崎大学 情報データ科学部を卒業し、大学院へ。インドとタイへの短期留学も経験。」
- `notes.sns`: 「気軽なご連絡は、SNS へどうぞ。」
- `notes.email`: 「お仕事のご依頼など、正式なご連絡はメールでお願いします。」
- `skills`: `["typescript", "python", "swift", "react", "nextdotjs", "vuedotjs", "astro", "threedotjs", "unity", "blender", "figma"]`

**ページの構成**（上から）

| 部分 | 中身 |
| --- | --- |
| 見出し | `PageHead title="About"`（`h1`） |
| 本人 | 写真（`@ut42tech/assets/profile.jpg` を `astro:assets` の `Image` で。スマホ 96 / パソコン 144 の丸。2倍の解像度を用意）、本名（スマホ `text-headline`、パソコン `text-title-m`）、所属（`text-caption` / `text-callout`、`text-muted`） |
| 自己紹介 | `intro`（`text-body`） |
| モットー | `profile.motto`（`text-headline`） |
| Skills | 見出し（`text-mono text-muted`）と 48 のタイル（角丸 12、アイコン 22、`data-skill`、`role="img"` と `aria-label` にブランド名）。間 12 |
| これまで | 見出しと `history` |
| Contact | 下の表 |

`id="contact"` は、Contact の見出しを含む `section` に付ける。

**Contact の中身**

- **SNS のボタン**: `notes.sns` に続けて置く。
  - 形: 高さ 44、カプセル、`bg-fill`、左の余白 16、アイコン（18）と文字の間 8。
  - 並び: スマホ 2列、パソコン 4列。間 8。
  - リンク: `rel="me noopener"`。
- **メール欄**: `notes.email` に続けて置く。
  - 形: 高さ 48、角丸 12、線、左右の余白 16。
  - 中身: `mail`（16）と `mailto:` のリンク、コピーのボタン（`copy` 16、`aria-label="メールアドレスをコピー"`）。
  - コピーすると、`aria-live="polite"` の領域に「コピーしました」と出す。

**幅と置き方**

- スマホ: `Sheet` の中に置く。
- パソコン: 幅 720 で、画面の中央に置く。

- [ ] **Step 1: 失敗するテストを書く**

```ts
const about = loadPage("/about");
test("renders identity and contact without JavaScript", () => {
  expect(about.textContent).toContain(profile.name);
  expect(about.textContent).toContain(profile.motto);
  expect(about.querySelector('nav[aria-label="メイン"] [aria-current="page"]')!.getAttribute("href")).toBe("/about");
  const contact = about.querySelector("#contact")!;
  for (const link of profile.social) expect(contact.querySelector(`a[href="${link.href}"]`)).not.toBeNull();
  expect(contact.querySelector(`a[href="mailto:${profile.email}"]`)).not.toBeNull();
});
test("skills are labelled icons", () => {
  expect(about.querySelectorAll('[data-skill][aria-label]').length).toBe(11);
});
test("no research link yet", () => expect(about.textContent).not.toContain("研究について"));
```

- [ ] **Step 2: 失敗を確かめる** — Run: `vp run @ut42tech/web#build && vp test apps/web/test/about` / Expected: FAIL

- [ ] **Step 3: 実装する**

- [ ] **Step 4: 通ることを確かめる** — Run: `vp run @ut42tech/web#build && vp test apps/web/test/about` / Expected: PASS

- [ ] **Step 5: 見た目を確かめる**

Figma の `43:458` / `44:523` と比べる。ライトとダークの両方を確かめる。

- [ ] **Step 6: `vp run check` を通してコミット**

```bash
git add apps/web
git commit -m "feat(web): add about page with contact"
```

---

### Task 10: Press

**Files:**

- Create: `apps/web/src/pages/press.astro`
- Test: `apps/web/test/press.test.ts`

**Interfaces:**

- Consumes: `Card` / `SortButton`（Task 6）、`Sheet`（Task 7）、`press` コレクション（Task 5）

**カードの中身**

- 補足は `「YYYY.MM · 媒体名」`（媒体名は `outlet`）。1行で「…」。
- 画像が無いときは、`source` がブランドのアイコンを持っていればそのアイコン、`other` なら頭文字。
- リンクは外へ開く。

**一覧の置き方**

- 見出しの行は `PageHead title="Press" count={n} sortList="press-list"`（`h1`）。
- 一覧の id は `press-list`。
- スマホ: `Sheet` の中に、カード2列。
- パソコン: カード3列。幅 840 で、画面の中央に置く。

- [ ] **Step 1: 失敗するテストを書く**

```ts
const press = loadPage("/press");
test("press cards open outside", () => {
  const links = press.querySelectorAll("#press-list a");
  expect(links.length).toBeGreaterThan(0);
  for (const a of links) {
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
  }
});
test("nav marks press", () => expect(press.querySelector('nav[aria-label="メイン"] [aria-current="page"]')!.getAttribute("href")).toBe("/press"));
```

- [ ] **Step 2: 失敗を確かめる** — Run: `vp run @ut42tech/web#build && vp test apps/web/test/press` / Expected: FAIL

- [ ] **Step 3: 実装する**

- [ ] **Step 4: 通ることを確かめる** — Run: `vp run @ut42tech/web#build && vp test apps/web/test/press` / Expected: PASS

- [ ] **Step 5: 見た目を確かめる**

Figma の `43:845` / `44:949` と比べる。

- [ ] **Step 6: `vp run check` を通してコミット**

```bash
git add apps/web
git commit -m "feat(web): add press page"
```

---

### Task 11: 全ページの点検

**Files:**

- Create: `apps/web/test/a11y.test.ts`
- Modify: 点検で見つかった箇所

- [ ] **Step 1: 失敗するテストを書く**

```ts
const routes = ["/", "/about", "/works/apps", "/works/career", "/works/awards", "/works/events", "/press", ...appRoutes()];
test.each(routes)("%s: every link and button has a name", (route) => {
  const page = loadPage(route);
  for (const el of page.querySelectorAll("a, button")) {
    const name = el.getAttribute("aria-label") ?? el.textContent.trim();
    expect(name.length, el.outerHTML.slice(0, 120)).toBeGreaterThan(0);
  }
});
test.each(routes)("%s: interactive elements opt into the pointer", (route) => {
  for (const el of loadPage(route).querySelectorAll("a, button")) expect(el.hasAttribute("data-cursor"), el.outerHTML.slice(0, 120)).toBe(true);
});
test.each(routes)("%s: one h1", (route) => expect(loadPage(route).querySelectorAll("h1").length).toBe(1));
```

- `appRoutes()` は `test/html.ts` に足す。`/works/apps/<slug>` の一覧を返す。

- [ ] **Step 2: 失敗を確かめ、直し、通す**

Run: `vp run @ut42tech/web#build && vp test`
Expected: すべて PASS

- [ ] **Step 3: すべての画面を Figma と並べて確かめる**

**撮るもの**

- 全ページを撮る。
- 幅は 390×844 と 1440×900。加えて、境目の 1023 と 1024 も撮る。
- ライトとダークの両方を撮る。

**確かめること**

- 7.1 章の整列の規則。高さ（36 / 40 / 44 / 48）、アイコンの大きさ、角丸の同心。
- スマホで、上 47 / 下 34 の安全な領域に部品が重ならないこと。
  - Chrome DevTools の端末の再現（iPhone 14 など）を使う。
  - `env(safe-area-inset-*)` が効くことを確かめる。
- 文字が切れないこと（見切れの規則）。

- [ ] **Step 4: コミット**

```bash
git add apps/web
git commit -m "test(web): check names, headings and pointer opt-in on every page"
```

---

### Task 12: 引き継ぎの文書

**Files:**

- Modify: `README.md`（「デザインへの引き継ぎ」の節）

- [ ] **Step 1: README を書き換える**

- 「仮のもの」という説明を消し、今の構成を書く。
  - トークンの置き場所。
  - ページの一覧と URL。
  - 中身の足し方（`src/content/<collection>/*.md` の frontmatter の項目）。
- **公開前に本人が書くもの**を一覧にする。
  - About の `intro` と `history`（「（仮）」の文）。
  - 素材に無かった Press（note、Zenn、Qiita、YouTube、Speaker Deck）。
  - Apps の `stack`。
- 次の計画「動き」で足すものを1行ずつ書く。
  - 登場演出
  - 「Welcome.」の吸い付きと弾み
  - ipad-cursor
  - シートのせり上がりと払って閉じる操作
  - カードから詳細へ広がる遷移
  - 押したときの沈み

- [ ] **Step 2: `vp run check` と `vp test` を通してコミット**

```bash
git add README.md
git commit -m "docs: document the portfolio site structure"
```
