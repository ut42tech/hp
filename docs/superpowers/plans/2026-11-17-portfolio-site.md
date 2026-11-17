# ポートフォリオ サイト（静的な画面）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/web` を、Figma で確定した見た目のとおりに作り直す。対象は次のとおり。

- 全ページ（Hello / About / Works の4分類 / Apps の詳細 / Press）
- ライト／ダーク
- スマホのシート表示と、パソコンのツールバー表示
- 英語版のための仕組み（i18n）

**Architecture:**

- Astro の静的サイト（MPA）にする。URL ごとに1ページを書き出す。
- スマホとパソコンは、同じ HTML を CSS で出し分ける。境目は 1024px。
  - 1024px 未満: Hello を地に、中身を「シート」として重ねる。
  - 1024px 以上: 上にツールバー、中身をページに直接置く。
- ページの間のつながりは、ブラウザ標準の画面遷移（`@view-transition { navigation: auto; }`）で取る。JavaScript のルーターは使わない。
- 言語:
  - 英語は日本語と対等に扱う（本人の決定）。URL は、日本語を `/ja/`、英語を `/en/` にそろえる（Astro の i18n ルーティング、`prefixDefaultLocale: true`）。
  - ページは `src/pages/[locale]/` に置き、`getStaticPaths` で `publishedLocales` の言語だけを書き出す。ページの本体は `src/views/` の部品にし、`locale` を受け取る。
  - `/` は、ページを読む前に Vercel の転送（`apps/web/vercel.json` の `redirects`）で言語へ振り分ける。強制はしない。
    - 順番: 言語の切り替えで選んだ記憶（クッキー `ut42tech-lang`）、端末の言語（`Accept-Language`）、どちらも無ければ `/ja/`。
    - 英語は、翻訳がそろうまで書き出さない。それまでは `/` → `/ja/` の1本だけを置く。
- 動きは、**この計画に含めない**。この計画が終わった後に、別の計画「動き」で足す。この計画では、その土台（要素の名前、`data-cursor`、`view-transition-name`）だけを置く。
  - 対象: 登場演出、文字の吸い付き、ポインター、シートを払う操作、詳細へ広がる遷移。

**Tech Stack:**

- Astro 7、Vue 3、Tailwind CSS v4、TypeScript 6、Vite+（`vp`）、`vite-plus/test`
- 書体: `@fontsource/line-seed-jp@5.3.2`、`@fontsource/geist-mono@5.3.0`
- アイコン:
  - `@tabler/icons-vue@3.52.0`
  - `simple-icons@16.38.0`
  - `simple-icons-11`（`npm:simple-icons@11.0.0`。LinkedIn だけに使う）
- テスト: `node-html-parser`、`vue/server-renderer`

**Spec:**

- 見た目: `docs/superpowers/specs/2026-11-17-portfolio-visual-design.md`
- 構造: `docs/superpowers/specs/2026-11-16-portfolio-wireframe-design.md`
- Figma: ファイル `ZPaC9SNAfMyKTROfRvAJyT`

| 画面            | スマホ   | パソコン |
| --------------- | -------- | -------- |
| Hello           | `43:435` | `44:496` |
| About           | `43:458` | `44:523` |
| Works（Apps）   | `43:602` | `44:669` |
| Apps の詳細     | `43:691` | `44:770` |
| Works（Career） | `43:766` | `44:862` |
| Press           | `43:845` | `44:949` |
| 部品            | `32:2`   | —        |

## Global Constraints

- **ハードコード禁止**（本人の決定）。Task 4 のテストで機械的に見張る。
  - **アイコンの形**: SVG の要素やパスの文字列をソースに書かない。
    - 操作のアイコンは `@tabler/icons-vue` の部品を使う。
    - ブランドのアイコンは `simple-icons` のパッケージのデータを使う。
  - **画面の文言**: 部品（`src/components`、`src/views`、`src/layouts`）に直接書かない。すべて言語別の辞書（`src/i18n/messages/*.ts`）を通す。
    - 例外は2つ。ブランド名などの固有名詞と、中身の Markdown。
  - **色**: 色の値（`#…`、`rgb(…)`）を、トークン（`packages/tokens`）の外に書かない。
- **値の出どころ**: 色・書体・角丸・余白・高さ・影は、見た目の設計書 5〜7.1 章の値だけを使う。
- **境目**: 1024px（Tailwind の `lg`）。設計書が実装に任せているので、Claude が決めた。
  - パソコンの Works の中身は、サイドバーの右端（248px）から画面の右端までの中央に置く。幅は最大 840px。
  - 幅が足りないときは、左右に 32px を残して縮める。
- **言語**:
  - 対応する言語は `ja`（`/ja/...`）と `en`（`/en/...`）。既定は `ja`。どちらも接頭辞を付ける。
  - 書き出すのは `publishedLocales`（今は `["ja"]`）だけ。
  - `/` の振り分けは `vercel.json` の転送（307）で行う。ページの中の JavaScript で振り分けない（一瞬違うページが見えるため）。
  - 検索エンジン向けに、各ページに `hreflang` の代替リンクを出す。公開中の言語すべてと、`x-default`（`/`）を含める。
  - `<html lang>` は言語に合わせる。
  - ページの間のリンクは、すべて `localizePath` で作る。
- **安全な領域**:
  - viewport に `viewport-fit=cover` を指定する。
  - スマホの上の段の上端は `max(env(safe-area-inset-top), 12px)`、下は `max(env(safe-area-inset-bottom), 12px)`。
  - 横の余白は `20px + env(safe-area-inset-left/right)`。
- **ナビゲーションバー**: 項目は About / Works / Press の3つ。Hello では、どれも選ばない。今いる項目に `aria-current="page"` を付ける。
- **押せる要素**: すべてに `data-cursor="block"` を付ける（「動き」の計画で ipad-cursor が使う）。
- **アイコンの使い方**:
  - Tabler の線の太さは 1.75。
  - 飾りのアイコンには `aria-hidden="true"` を付ける。アイコンだけのボタンには、辞書の文言で `aria-label` を付ける。
- **書体**: LINE Seed JP（400 / 700 / 800）と Geist Mono（400）を `@fontsource` から読み込む。
- **中身の素材**: `../hp-archive-materials/content` と `images` から移す。`../hp-archive-materials/private/` は開かない。複製もしない。
- **リポジトリに書かないもの**: 参考にしたサイトやテンプレートの名前を、コード・コメント・文書に書かない。
- **テスト**:
  - `vite-plus/test` から import する。
  - 実行は、ルートで `vp run @ut42tech/web#build && vp test` の順。`apps/web/test` はビルド結果を検査するので、先にビルドする。
- **タスクの終わり**: 各タスクの最後に、`vp run check`（整形・Lint・型）を通す。1タスクごとにコミットし、メッセージの最後に `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` を付ける。

## Review Focus

1. **ページを移るとライト／ダークが元に戻る、または一瞬光る**。保存値が `auto` や壊れた値のときも同じ。
   - Task 5 で、`readPreference` が壊れた値と例外のときに `auto` を返すことを確かめる。
   - Task 5 で、全ページの `<head>` に最初の描画より前に動くスクリプトがあることを確かめる。
2. **共有された `/ja/works/apps/<slug>` を直接開く**。一覧へ戻れること、JavaScript が無くても読めることが必要。
   - Task 9 で、ビルド結果に `<dialog open` と、一覧へ戻るリンクがあることを確かめる。
3. **長い題名・画像なし・Demo や GitHub なしの作品**で、カードの高さがそろい、無いボタンは出さないこと。
   - Task 6 で、`initialOf` と書式化の関数を確かめる。
   - Task 9 で、Demo の無い作品に Demo のリンクが無いことを確かめる。
4. **辞書に無い文言・英語の辞書の抜け**。英語を公開した日に、文言が欠ける。
   - Task 4 で、`en` の辞書が `ja` と同じ鍵をすべて持ち、空の値が無いことを確かめる。
   - Task 4 で、部品に日本語が直接書かれていないことを確かめる。
5. **名前の無いボタン、iPhone の切り欠きとホームインジケーターとの重なり**。
   - Task 12 で、全ページの `a` と `button` に名前があることを確かめる。
   - Task 12 で、iPhone の画面（390×844、上 47 / 下 34）を再現したスクリーンショットで確かめる。

---

### Task 1: デザイントークン

**Files:**

- Modify: `packages/tokens/tokens.css`
- Modify: `packages/tokens/theme.css`
- Test: `packages/tokens/tokens.test.ts`

**Interfaces:**

- Produces:
  - CSS 変数: 見た目の設計書 5 章と 7 章の `--ut-*` すべて。加えて次の2つ。
    - `--ut-font-sans: "LINE Seed JP", system-ui, sans-serif`
    - `--ut-font-mono: "Geist Mono", ui-monospace, monospace`
  - Tailwind のユーティリティ:
    - 色: `bg-surface`、`text-muted`、`bg-bar`、`bg-bar-active`、`text-on-bar`、`text-on-bar-muted`、`bg-fill`、`bg-placeholder`、`bg-scrim`、`bg-curtain`、`text-on-curtain`、`border-border`、`text-fg`、`bg-bg`
    - 角丸: `rounded-card`（16）、`rounded-row`（12）、`rounded-sheet`（28）、`rounded-control`（999）
    - 影: `shadow-float`、`shadow-sheet`
    - 文字（`@utility`）: `text-display`、`text-title-l`（30。`lg` で 40）、`text-title-m`、`text-headline`、`text-card-title`、`text-body`、`text-callout`、`text-caption`、`text-mono`
      - 書体は、`text-mono` だけが `--ut-font-mono`。ほかは `--ut-font-sans`。

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
    for (const [fg, bg, min] of pairs)
      expect(contrast(color(mode, fg), color(mode, bg))).toBeGreaterThanOrEqual(min);
  });
});
test("theme.css maps radius, shadow and type tokens", () => {
  const theme = read("./theme.css");
  for (const name of [
    "--radius-card",
    "--radius-row",
    "--radius-sheet",
    "--radius-control",
    "--shadow-float",
    "--shadow-sheet",
  ])
    expect(theme).toContain(name);
  for (const u of ["text-display", "text-title-l", "text-card-title", "text-mono"])
    expect(theme).toContain(`@utility ${u}`);
});
```

テストの中に、関数を2つ書く。

- `color(mode, name)`: `tokens.css` から `#RRGGBB` を読む。light は `:root {` の塊、dark は `:root[data-theme="dark"]` の塊から読む。
- `contrast(a, b)`: WCAG の相対輝度から比を出す。

既存のテスト「dark mode defines every light color token」「theme.css maps every color token」は残す。

- [ ] **Step 2: 失敗を確かめる**

Run: `vp test packages/tokens`
Expected: FAIL（`--ut-color-surface` が無い）

- [ ] **Step 3: `tokens.css` と `theme.css` を設計書の値に置き換える**

- **値**: 5 章の表の Light / Dark と、7 章の表（角丸、余白、幅、イージング、時間、影）。
- **透明度のある色**（`fill`、`scrim`）: `rgb(0 0 0 / 7%)` の形で書く。
- **ダークの値**: 今の3つの塊にそろえて書く。
  - `:root`
  - `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`
  - `:root[data-theme="dark"]`
- **`--ut-radius`**: `var(--ut-radius-row)` の別名として残す（7 章）。
- **`--ut-color-accent`**: `var(--ut-color-fg)`（5 章）。
- **`@utility text-title-l`**: 中に `@media (width >= 64rem)` を入れて、40px に切り替える。

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

- [ ] **Step 1: 失敗するテストを書く**

LinkedIn の URL は `https://www.linkedin.com/in/ut42tech/`（本人から受け取った値）。

```ts
test("contact", () => {
  expect(profile.email).toBe("hello@ut42tech.com");
  expect(profile.social.map((l) => l.icon)).toEqual([
    "x",
    "github",
    "linkedin",
    "qiita",
    "zenn",
    "note",
    "youtube",
    "wantedly",
  ]);
  expect(profile.social.find((l) => l.icon === "linkedin")!.href).toBe(
    "https://www.linkedin.com/in/ut42tech/",
  );
});
```

既存の `expect(profile.social.length).toBe(7)` は 8 に変える。

- [ ] **Step 2: 失敗を確かめる**

Run: `vp test packages/profile`
Expected: FAIL

- [ ] **Step 3: 型と値を足す**

- [ ] **Step 4: 通ることを確かめる**

Run: `vp test packages/profile`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git commit -am "feat(profile): add email and LinkedIn"
```

---

### Task 3: アイコン

**Files:**

- Modify: `apps/web/package.json`
  - dependencies に `@tabler/icons-vue@3.52.0`、`simple-icons@16.38.0`、`"simple-icons-11": "npm:simple-icons@11.0.0"` を足す。
- Create: `apps/web/src/lib/icons.ts`
- Create: `apps/web/src/components/UiIcon.vue`
- Create: `apps/web/src/components/BrandIcon.vue`
- Test: `apps/web/src/lib/icons.test.ts`

**Interfaces:**

- Consumes: `SocialIcon`（Task 2）
- Produces:

```ts
// lib/icons.ts
export type UiIconName = "chevron-left" | "x" | "arrow-up-right" | "arrows-sort" | "sun" | "moon" | "device-desktop" | "copy" | "mail" | "language";
export type SkillIcon = "typescript" | "python" | "swift" | "react" | "nextdotjs" | "vuedotjs" | "astro" | "threedotjs" | "unity" | "blender" | "figma";
export type BrandIconName = SocialIcon | SkillIcon | "speakerdeck";
export const uiIcons: Record<UiIconName, Component>;   // Tabler の部品（IconChevronLeft など）
export const brandIcons: Record<BrandIconName, { title: string; path: string }>; // simple-icons のデータ。linkedin だけ simple-icons-11
export const UI_ICON_STROKE = 1.75;
```

```ts
// UiIcon.vue props
{
  name: UiIconName;
  size: number;
}
// → <component :is="uiIcons[name]" :size :stroke="UI_ICON_STROKE" aria-hidden="true" focusable="false" />

// BrandIcon.vue props
{
  name: BrandIconName;
  size: number;
}
// → 24 の正方形の SVG に、brandIcons[name].path を :d で結び付ける。fill は currentColor、aria-hidden="true"。
```

`BrandIcon.vue` の SVG の要素は、データを描く入れ物だけ。形のデータ（パス）は、パッケージから読む。

Astro の中では、どちらも `client:*` を付けずに置く。すると、ビルドのときに HTML になる。

- [ ] **Step 1: 失敗するテストを書く**

```ts
import { renderToString } from "vue/server-renderer";
import { h } from "vue";

test("every ui icon renders a Tabler outline at stroke 1.75", async () => {
  for (const name of Object.keys(uiIcons) as UiIconName[]) {
    const html = await renderToString(h(UiIcon, { name, size: 16 }));
    expect(html).toContain('width="16"');
    expect(html).toContain('stroke-width="1.75"');
    expect(html).toContain('aria-hidden="true"');
  }
});
test("every brand comes from a simple-icons package", () => {
  for (const [name, icon] of Object.entries(brandIcons))
    expect(icon.path.length, name).toBeGreaterThan(10);
  expect(brandIcons.linkedin.title).toBe("LinkedIn");
});
test("brand icons render as filled single-color shapes", async () => {
  const html = await renderToString(h(BrandIcon, { name: "github", size: 18 }));
  expect(html).toContain('fill="currentColor"');
  expect(html).toContain('width="18"');
});
```

- [ ] **Step 2: 失敗を確かめる**

Run: `vp test apps/web/src/lib/icons`
Expected: FAIL

- [ ] **Step 3: 実装する**

- `@tabler/icons-vue` から、名前付きの部品を import する。
  - 例: `IconChevronLeft`、`IconArrowsSort`、`IconDeviceDesktop`。
- `simple-icons` から、`si*` を import する。
  - 例: `siGithub`、`siSpeakerdeck`、`siNextdotjs`。
- LinkedIn だけは `simple-icons-11` の `siLinkedin` を使う。

- [ ] **Step 4: 通ることを確かめる**

Run: `vp test apps/web/src/lib/icons`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add apps/web/package.json pnpm-lock.yaml apps/web/src/lib/icons.ts apps/web/src/lib/icons.test.ts apps/web/src/components/UiIcon.vue apps/web/src/components/BrandIcon.vue
git commit -m "feat(web): add Tabler and Simple Icons components"
```

---

### Task 4: 言語（i18n）と、ハードコードの見張り

**Files:**

- Modify: `apps/web/astro.config.mjs`
  - `i18n: { locales: ["ja", "en"], defaultLocale: "ja", routing: { prefixDefaultLocale: true, redirectToDefaultLocale: true } }` を足す（`/` の静的な転送は、Vercel の外で開いたときの予備になる）。
- Create: `apps/web/vercel.json`（`/` → `/ja/` の転送。307、`permanent: false`）
- Create: `apps/web/src/i18n/config.ts`
- Create: `apps/web/src/i18n/messages/ja.ts`
- Create: `apps/web/src/i18n/messages/en.ts`
- Create: `apps/web/src/i18n/t.ts`
- Create: `apps/web/src/lib/localized.ts`
- Test: `apps/web/src/i18n/i18n.test.ts`
- Test: `apps/web/src/lib/localized.test.ts`
- Test: `apps/web/test/no-hardcode.test.ts`

**Interfaces:**

- Produces:

```ts
// i18n/config.ts
export const locales = ["ja", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ja";
export const publishedLocales: readonly Locale[] = ["ja"];
export function localizePath(path: string, locale: Locale): string; // ("/about","ja") → "/ja/about"、("/","ja") → "/ja/"、("/about","en") → "/en/about"
export function localeStaticPaths(): { params: { locale: Locale } }[]; // publishedLocales だけ
export function alternates(path: string): { hreflang: string; href: string }[]; // 公開中の言語と x-default（"/"）
export function switchLocalePath(path: string, to: Locale): string; // ("/ja/works/apps","en") → "/en/works/apps"
export const LOCALE_COOKIE = "ut42tech-lang";

// i18n/messages/ja.ts
export const ja = { ... } as const; // 平たい鍵（例 "nav.label"）
export type MessageKey = keyof typeof ja;

// i18n/messages/en.ts
export const en = { ... } satisfies Record<MessageKey, string>;

// i18n/t.ts
export function useTranslations(locale: Locale): (key: MessageKey, vars?: Record<string, string | number>) => string; // "{n} 件" の {n} を差し込む
export function mottoFor(locale: Locale): string; // ja → profile.motto、en → profile.mottoEn

// lib/localized.ts — 中身の言語の選び方
export function pickLocalized<T extends { id: string }>(entries: T[], locale: Locale): (T & { slug: string; lang: Locale })[];
// id は "<lang>/<slug>"。その言語の版が無い slug は、ja の版を lang: "ja" として返す。
```

**辞書の鍵**（この計画で使うものすべて。値は日本語 / 英語）

| 鍵                                               | ja                                                                                                                                                                                 | en                                                                                                                                  |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `site.name`                                      | ut42tech                                                                                                                                                                           | ut42tech                                                                                                                            |
| `hello.title`                                    | Welcome.                                                                                                                                                                           | Welcome.                                                                                                                            |
| `hello.sub`                                      | to ut42tech                                                                                                                                                                        | to ut42tech                                                                                                                         |
| `nav.label`                                      | メイン                                                                                                                                                                             | Main                                                                                                                                |
| `nav.about` / `nav.works` / `nav.press`          | About / Works / Press                                                                                                                                                              | About / Works / Press                                                                                                               |
| `skip`                                           | 本文へ移動                                                                                                                                                                         | Skip to content                                                                                                                     |
| `theme.auto` / `theme.light` / `theme.dark`      | 表示: 自動 / 表示: ライト / 表示: ダーク                                                                                                                                           | Theme: Auto / Theme: Light / Theme: Dark                                                                                            |
| `locale.switch`                                  | English で見る                                                                                                                                                                     | 日本語で見る                                                                                                                        |
| `works.label`                                    | Works の分類                                                                                                                                                                       | Works categories                                                                                                                    |
| `works.apps` / `.career` / `.awards` / `.events` | Apps / Career / Awards / Events                                                                                                                                                    | 同じ                                                                                                                                |
| `count`                                          | {n} 件                                                                                                                                                                             | {n} items                                                                                                                           |
| `sort.newest` / `sort.oldest`                    | 新しい順 / 古い順                                                                                                                                                                  | Newest / Oldest                                                                                                                     |
| `detail.close`                                   | 閉じる                                                                                                                                                                             | Close                                                                                                                               |
| `detail.back`                                    | Apps                                                                                                                                                                               | Apps                                                                                                                                |
| `detail.demo` / `detail.github`                  | Demo / GitHub                                                                                                                                                                      | Demo / GitHub                                                                                                                       |
| `detail.stack`                                   | Stack                                                                                                                                                                              | Stack                                                                                                                               |
| `about.title`                                    | About                                                                                                                                                                              | About                                                                                                                               |
| `about.affiliation1` / `about.affiliation2`      | 長崎大学大学院 総合生産科学研究科 / 瀬戸崎研究室                                                                                                                                   | Graduate School of Integrated Science and Technology, Nagasaki University / Setozaki Lab                                            |
| `about.intro`                                    | （仮）長崎大学大学院の修士学生。デザインとエンジニアリングの両方から、触って気持ちのいい体験をつくっています。画面の設計から実装、動きの調整まで、ひとりで通して作るのが好きです。 | (Draft) A master's student at Nagasaki University, crafting experiences that feel good to touch — from both design and engineering. |
| `about.skills`                                   | Skills                                                                                                                                                                             | Skills                                                                                                                              |
| `about.history.title`                            | これまで                                                                                                                                                                           | Background                                                                                                                          |
| `about.history`                                  | （仮）長崎県で生まれ、横浜で育つ。長崎大学 情報データ科学部を卒業し、大学院へ。インドとタイへの短期留学も経験。                                                                    | (Draft) Born in Nagasaki, raised in Yokohama. Graduated from Nagasaki University and went on to graduate school.                    |
| `about.contact`                                  | Contact                                                                                                                                                                            | Contact                                                                                                                             |
| `about.note.sns`                                 | 気軽なご連絡は、SNS へどうぞ。                                                                                                                                                     | For casual messages, reach me on social media.                                                                                      |
| `about.note.email`                               | お仕事のご依頼など、正式なご連絡はメールでお願いします。                                                                                                                           | For work and other formal inquiries, please email me.                                                                               |
| `about.copy`                                     | メールアドレスをコピー                                                                                                                                                             | Copy email address                                                                                                                  |
| `about.copied`                                   | コピーしました                                                                                                                                                                     | Copied                                                                                                                              |
| `press.title`                                    | Press                                                                                                                                                                              | Press                                                                                                                               |

鍵を足すときは、`ja` と `en` の両方に足す。

**ハードコードの見張り**（`test/no-hardcode.test.ts`）

`apps/web/src` の `.astro` / `.vue` / `.ts` を読み、次を検査する。テストファイルは除く。

1. SVG の形が書かれていないこと。
   - 対象: `<svg` / `<path` / `<circle` / `d="M`。
   - 例外: `BrandIcon.vue` の `<svg>` と `<path :d=…>` だけ。データを描く入れ物で、形はパッケージから来るため。
2. `src/components`、`src/views`、`src/layouts` に、日本語の文字（ひらがな・カタカナ・漢字）が無いこと。
3. 色の値（`#[0-9a-fA-F]{3,8}\b`、`rgb(`、`hsl(`）が無いこと。

- [ ] **Step 1: 失敗するテストを書く**

```ts
// i18n.test.ts
test("en has every ja key and no empty values", () => {
  expect(Object.keys(en).sort()).toEqual(Object.keys(ja).sort());
  for (const [k, v] of Object.entries(en)) expect(v.trim(), k).not.toBe("");
});
test("localizePath prefixes every locale", () => {
  expect(localizePath("/about", "ja")).toBe("/ja/about");
  expect(localizePath("/", "ja")).toBe("/ja/");
  expect(localizePath("/about", "en")).toBe("/en/about");
});
test("switchLocalePath keeps the page", () => {
  expect(switchLocalePath("/ja/works/apps/tangi", "en")).toBe("/en/works/apps/tangi");
  expect(switchLocalePath("/en/", "ja")).toBe("/ja/");
});
test("alternates list published locales and x-default", () => {
  expect(alternates("/about")).toEqual([
    { hreflang: "ja", href: "/ja/about" },
    { hreflang: "x-default", href: "/" },
  ]);
});
test("vercel sends / to Japanese without a permanent redirect", () => {
  const { redirects } = JSON.parse(
    readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
  );
  expect(redirects).toContainEqual(
    expect.objectContaining({ source: "/", destination: "/ja/", permanent: false }),
  );
});
test("interpolates", () => expect(useTranslations("ja")("count", { n: 10 })).toBe("10 件"));
test("only Japanese is published for now", () => expect(publishedLocales).toEqual(["ja"]));

// localized.test.ts
test("pickLocalized prefers the locale and falls back to ja", () => {
  const entries = [{ id: "ja/a" }, { id: "ja/b" }, { id: "en/a" }];
  expect(pickLocalized(entries, "en").map((e) => [e.slug, e.lang])).toEqual([
    ["a", "en"],
    ["b", "ja"],
  ]);
  expect(pickLocalized(entries, "ja").map((e) => [e.slug, e.lang])).toEqual([
    ["a", "ja"],
    ["b", "ja"],
  ]);
});
```

`no-hardcode.test.ts` は、上の3つの検査を `test` にする。違反したファイル名と行を、失敗の文言に出す。

- [ ] **Step 2: 失敗を確かめる**

Run: `vp test apps/web/src/i18n apps/web/src/lib/localized`
Expected: FAIL

- [ ] **Step 3: 実装する**

- [ ] **Step 4: 通ることを確かめる**

Run: `vp test apps/web`
Expected: i18n と localized は PASS。no-hardcode は、今の `ThemeToggle.vue` と `index.astro` の日本語と色で FAIL してよい。Task 5 で消える。

- [ ] **Step 5: コミット**

```bash
git add apps/web
git commit -m "feat(web): add i18n dictionaries and hardcode guard"
```

---

### Task 5: 土台のレイアウトと表示の切り替え

**Files:**

- Modify: `apps/web/package.json`
  - dependencies に `@fontsource/line-seed-jp@5.3.2`、`@fontsource/geist-mono@5.3.0` を足す。
  - devDependencies に `node-html-parser` を足す。
- Modify: `apps/web/src/lib/theme.ts`
- Modify: `apps/web/src/lib/theme.test.ts`
- Rewrite: `apps/web/src/components/ThemeToggle.vue`
- Create: `apps/web/src/layouts/Site.astro`（`Base.astro` を置き換え、`Base.astro` は消す）
- Create: `apps/web/src/components/SiteHeader.astro`
- Create: `apps/web/src/components/LocaleSwitch.astro`
- Create: `apps/web/src/scripts/locale-switch.ts`
- Create: `apps/web/src/components/NavBar.astro`
- Create: `apps/web/src/components/HelloStage.astro`
- Create: `apps/web/src/views/HelloView.astro`
- Modify: `apps/web/src/styles/global.css`
- Delete: `apps/web/src/pages/index.astro`（`/` は Task 4 の転送が受け持つ）
- Create: `apps/web/src/pages/[locale]/index.astro`（`getStaticPaths = localeStaticPaths`、`<HelloView locale={…} />` だけ）
- Create: `apps/web/test/html.ts`
- Rewrite: `apps/web/test/build-output.test.ts`

**Interfaces:**

- Consumes: トークン（Task 1）、`UiIcon`（Task 3）、`useTranslations` / `localizePath`（Task 4）
- Produces:

```ts
// lib/theme.ts
export type Theme = "light" | "dark";
export type ThemePreference = "auto" | "light" | "dark";
export const THEME_STORAGE_KEY = "ut42tech:theme";
export function readPreference(storage: Pick<Storage, "getItem"> | undefined): ThemePreference; // 無い・壊れた値・例外 → "auto"
export function storePreference(
  storage: Pick<Storage, "setItem" | "removeItem"> | undefined,
  pref: ThemePreference,
): void; // "auto" は removeItem
export function resolveTheme(pref: ThemePreference, prefersDark: boolean): Theme;
export function nextPreference(pref: ThemePreference): ThemePreference; // auto → light → dark → auto
```

```ts
// Site.astro props
type Section = "hello" | "about" | "works" | "press";
interface Props {
  locale: Locale;
  section: Section;
  title?: string; // 省略時は t("site.name")。指定時は `${title} — ${t("site.name")}`
  description?: string; // 省略時は mottoFor(locale)
}
```

`Site.astro` は、次の順に描く。

1. `SiteHeader`
2. `HelloStage`
3. `<main id="content" data-section={section}>`（中身は slot）
4. `NavBar current={section}`

`<head>` に `alternates(path)` の `<link rel="alternate" hreflang>` を出す。

`ThemeToggle.vue` は、文言を props（`labels: Record<ThemePreference, string>`）で受け取る。島（Vue）の中で辞書を読まない。

`test/html.ts`:

```ts
export function loadPage(route: string): HTMLElement; // dist/<route>/index.html を node-html-parser で読む
export function readDist(path: string): string;
```

- [ ] **Step 1: 失敗するテストを書く**

`theme.test.ts` を書き直す。

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
  expect((["auto", "light", "dark"] as const).map(nextPreference)).toEqual([
    "light",
    "dark",
    "auto",
  ]);
});
test("storing auto removes the key", () => {
  const calls: string[] = [];
  storePreference(
    { setItem: () => calls.push("set"), removeItem: () => calls.push("remove") },
    "auto",
  );
  expect(calls).toEqual(["remove"]);
});
test("storePreference swallows storage errors", () =>
  expect(() => storePreference(throwing, "dark")).not.toThrow());
```

`build-output.test.ts` を書き直す。

```ts
const hello = loadPage("/ja/");
test("is Japanese with a safe-area viewport", () => {
  expect(hello.querySelector("html")!.getAttribute("lang")).toBe("ja");
  expect(hello.querySelector('meta[name="viewport"]')!.getAttribute("content")).toContain(
    "viewport-fit=cover",
  );
});
test("sets the theme before first paint", () =>
  expect(
    hello.querySelectorAll("head script").some((s) => s.textContent.includes("ut42tech:theme")),
  ).toBe(true));
test("hello greets without selecting a nav item", () => {
  expect(hello.querySelector('[aria-label="Welcome."]')).not.toBeNull();
  expect(hello.querySelector('nav [aria-current="page"]')).toBeNull();
  expect(
    hello.querySelectorAll('nav[aria-label="メイン"] a').map((a) => a.getAttribute("href")),
  ).toEqual(["/ja/about", "/ja/works/apps", "/ja/press"]);
});
test("handle links home", () =>
  expect(hello.querySelector('header a[href="/ja/"]')!.textContent).toContain("@ut42tech"));
test("declares alternates", () =>
  expect(hello.querySelector('link[rel="alternate"][hreflang="x-default"]')).not.toBeNull());
test("has a favicon", () => expect(hello.querySelector('link[rel="icon"]')).not.toBeNull());
test("English is not published yet", () =>
  expect(existsSync(new URL("../dist/en", import.meta.url))).toBe(false));
test("no language switch while only one locale is published", () =>
  expect(hello.querySelector('a[hreflang="en"]')).toBeNull());
```

- [ ] **Step 2: 失敗を確かめる**

Run: `vp run @ut42tech/web#build && vp test apps/web`
Expected: FAIL

- [ ] **Step 3: 実装する**

**テーマ**

- **最初の描画より前に動くスクリプト**（`Site.astro` の `<head>`、`is:inline`）:
  - 保存値が `light` / `dark` なら、それを使う。それ以外は OS の設定に従う。
  - `prefers-color-scheme` の変化も受け取る。従うのは、保存値が無いときだけ。
- **`ThemeToggle.vue`**:
  - 押すたびに `nextPreference` で次の設定に進む。
  - アイコンは設定に合わせる。auto は `device-desktop`、light は `sun`、dark は `moon`（20px、`UiIcon`）。
  - `aria-label` は `labels[pref]`。
  - 押せる範囲は 44×44。面と影は付けない。
  - 島は `client:load`。

**ヘッダー**（`SiteHeader.astro`）

- 左: ハンドルのリンク `@ut42tech`（`localizePath("/", locale)`、`text-headline`）。
- 右: `LocaleSwitch`（`publishedLocales` が2つ以上のときだけ）と `ThemeToggle` を、この順に並べる。
  - `LocaleSwitch`: アイコン `language`（20）だけのリンク。`href` は `switchLocalePath(今のパス, もう一方)`、`hreflang` と `lang` はもう一方の言語、`aria-label` は `t("locale.switch")`。押せる範囲は 44×44。
  - `scripts/locale-switch.ts`: 押したら、クッキー `ut42tech-lang` に行き先の言語を書く（1年、`path=/`、`SameSite=Lax`）。
- スマホ:
  - 上の段に置く。上端は `max(env(safe-area-inset-top), 12px)`、高さ 44。
  - 横の余白 20。表示の切り替えは、アイコンの右端を余白にそろえる。
- パソコン:
  - `position: fixed`、高さ 76。
  - 横の余白は、左 32 / 右 20（アイコンの右端が 32 にそろう）。

**ナビゲーションバー**（`NavBar.astro`）

- `<nav aria-label={t("nav.label")}>`。
- 形と色:
  - `bg-bar`、高さ 48、中の余白 4。
  - 項目は 84×40 のカプセル。今いる項目は `bg-bar-active` と `text-on-bar`、ほかは `text-on-bar-muted`。
  - 影は `shadow-float`。
- 置き場所:
  - スマホ: 下の中央。下端は `max(env(safe-area-inset-bottom), 12px) + 8px`。
  - パソコン: 上の中央。上から 14px。
- `view-transition-name: nav` を付ける。

**Hello**（`HelloStage.astro`）

- 「Welcome.」を `h1` にし、`aria-label={t("hello.title")}` を付ける。文字ごとの `span` は `aria-hidden="true"`。
- 下に `t("hello.sub")` を置く。
- 書体: `text-display`、`text-callout text-muted`。
- 置き場所: 画面の中央。
- 見せる場面:
  - スマホ: いつも地として見せる。
  - パソコン: `section="hello"` のときだけ見せる。

**`global.css`**

- フォントの CSS を読み込む。
  - `@fontsource/line-seed-jp/400.css`、`700.css`、`800.css`
  - `@fontsource/geist-mono/400.css`
- `@view-transition { navigation: auto; }`
- フォーカスの枠（`fg` の 2px の線を 2px 離す）
- `prefers-reduced-motion` のときは、画面遷移を止める。

- [ ] **Step 4: 通ることを確かめる**

Run: `vp run @ut42tech/web#build && vp test apps/web`
Expected: no-hardcode も含めて PASS

- [ ] **Step 5: 見た目を確かめる**

- `vp run dev` で開発サーバーを立てる。
- Chrome DevTools で `/` を開き、390×844 と 1440×900 のスクリーンショットを撮る。ライトとダークの両方を撮る。
- Figma の `43:435` / `43:1023` / `44:496` / `44:1020` と比べる。

- [ ] **Step 6: `vp run check` を通してコミット**

```bash
git add -A apps/web pnpm-lock.yaml
git commit -m "feat(web): add site shell, nav bar and theme preference"
```

---

### Task 6: 中身の型と素材

**Files:**

- Create: `apps/web/src/content.config.ts`
- Create: `apps/web/src/content/{apps,career,events,awards,press}/ja/*.md`
- Create: `apps/web/src/assets/works/**`（素材の画像を写す）
- Create: `apps/web/src/lib/works.ts`
- Test: `apps/web/src/lib/works.test.ts`

**Interfaces:**

- Consumes: `SkillIcon`（Task 3）、`pickLocalized`（Task 4）
- Produces:
  - コレクション（`glob` loader、パターンは `*/*.md`）。
    - id は `<lang>/<slug>`。
    - 日付は `YYYY-MM-DD` か `YYYY-MM` の文字列。

| コレクション | frontmatter                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps`       | `title`、`date`、`thumbnail?: image()`、`initial?`、`demo?: url`、`github?: url`、`stack: SkillIcon[]`。本文が説明。                                           |
| `career`     | `title`、`start`、`end?`、`summary`、`thumbnail?`、`initial?`                                                                                                  |
| `events`     | `title`、`date`、`thumbnail?`、`initial?`、`url?`                                                                                                              |
| `awards`     | `title`、`date`、`initial?`                                                                                                                                    |
| `press`      | `title`、`date`、`url`、`source: "note" \| "youtube" \| "zenn" \| "qiita" \| "speakerdeck" \| "other"`、`outlet: string`（媒体名として出す文字）、`thumbnail?` |

```ts
// lib/works.ts
export type SortOrder = "newest" | "oldest";
export type Category = "apps" | "career" | "awards" | "events";
export const categories: readonly Category[]; // ["apps", "career", "awards", "events"]
export function formatMonth(date: string): string;                 // "2026-03-15" → "2026.03"
export function formatPeriod(start: string, end?: string): string;  // end なし → "2025.04 –"、同じ月 → "2024.08"、それ以外 → "2024.05 – 2024.08"
export function sortByDate<T>(items: T[], key: (item: T) => string, order: SortOrder): T[]; // 同じ日付は元の順を保つ
export function nextOrder(order: SortOrder): SortOrder;
export function initialOf(title: string, override?: string): string; // override が優先。無ければ最初の1文字（英字は大文字）
export async function getWorks<C extends Category | "press">(collection: C, locale: Locale): Promise<…>; // getCollection → pickLocalized → sortByDate(newest)
```

- [ ] **Step 1: 失敗するテストを書く**

```ts
test("formatMonth", () => {
  expect(formatMonth("2026-03-15")).toBe("2026.03");
  expect(formatMonth("2024-08")).toBe("2024.08");
});
test("formatPeriod", () => {
  expect(formatPeriod("2025-04")).toBe("2025.04 –");
  expect(formatPeriod("2024-08", "2024-08")).toBe("2024.08");
  expect(formatPeriod("2024-05", "2024-08")).toBe("2024.05 – 2024.08");
});
test("sortByDate is newest-first and stable", () => {
  const items = [
    { d: "2024-01", n: "a" },
    { d: "2026-03", n: "b" },
    { d: "2024-01", n: "c" },
  ];
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

- [ ] **Step 2: 失敗を確かめる**

Run: `vp test apps/web/src/lib/works`
Expected: FAIL

- [ ] **Step 3: `works.ts` と `content.config.ts` を書く**

- `z` は `astro/zod` から、loader は `astro/loaders` の `glob` を使う。
- `stack` の要素は、`SkillIcon` の値だけを許す。

- [ ] **Step 4: 素材を移す**

日本語の版として、`ja/` の下に置く。

| 移し先              | 元                                  | 書き方                                                                                                                              |
| ------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `apps`              | `content/projects/*.md`（10件）     | `links` の `kind` が demo / github のものを、`demo` / `github` に入れる。`summary` と本文を合わせて本文にする。`stack` は空でよい。 |
| `career`            | `content/works/*.md`                | 構造の設計書 5 章の Career の表に当たるものだけを入れる。                                                                           |
| `events` / `awards` | `content/works`、`content/timeline` | 構造の設計書 5 章の表に挙がっている項目だけを入れる。                                                                               |
| `press`             | `content/press/*.md`                | `outlet` を媒体名にする。`source: "other"`。                                                                                        |

- 画像: `images/` から `src/assets/works/<collection>/` に写し、`thumbnail` に相対パスで書く。
- 開始と終了の月: 素材に無いときは、`date` の月を開始にする。終了は空にする。
- 素材に無い Press（note や Zenn の記事など）は作らない。

- [ ] **Step 5: 通ることを確かめる**

Run: `vp test apps/web/src/lib/works && vp run @ut42tech/web#build`
Expected: PASS。ビルドが frontmatter の型で落ちない。

- [ ] **Step 6: コミット**

```bash
git add apps/web/src/content.config.ts apps/web/src/content apps/web/src/assets apps/web/src/lib/works.ts apps/web/src/lib/works.test.ts
git commit -m "feat(web): add works and press content"
```

---

### Task 7: カード・横長カード・並び替え

**Files:**

- Create: `apps/web/src/components/Thumb.astro`
- Create: `apps/web/src/components/Card.astro`
- Create: `apps/web/src/components/RowCard.astro`
- Create: `apps/web/src/components/SortButton.astro`
- Create: `apps/web/src/scripts/sort.ts`

**Interfaces:**

- Consumes: `BrandIcon` / `UiIcon`（Task 3）、`useTranslations`（Task 4）、`formatMonth` / `initialOf` / `nextOrder`（Task 6）
- Produces:

```ts
// Thumb.astro
interface Props {
  image?: ImageMetadata;
  alt: string;
  initial: string;
  brand?: BrandIconName;
  widths: number[];
  sizes: string;
}
// Card.astro（href が無いときは div）
interface Props {
  href?: string;
  external?: boolean;
  title: string;
  meta: string;
  image?: ImageMetadata;
  initial: string;
  brand?: BrandIconName;
  lang?: Locale;
}
// RowCard.astro
interface Props {
  href?: string;
  title: string;
  period: string;
  summary: string;
  image?: ImageMetadata;
  initial: string;
  lang?: Locale;
}
// SortButton.astro
interface Props {
  list: string;
  locale: Locale;
} // list は並べ替える一覧の id
```

**`Thumb.astro`**

- 比率は 16:10。`object-fit: cover`。
- 画像が無いときは、`bg-placeholder` の面に次のどちらかを出す。
  - `brand` があれば、ブランドのアイコン（32、`text-muted`）。
  - 無ければ、頭文字（`text-title-m text-muted`）。

**`Card.astro`**

- 外形: `bg-surface`、`border-border` の 1px 内側、`rounded-card`、`overflow: hidden`。
- 題名: `text-card-title`、`line-clamp: 2`、`min-height: 40px`。
- 補足: `class="meta"`、`text-mono text-muted`、1行で「…」。
- 本文の余白: 上 12 / 横 12 / 下 12。
- 外へ開くリンク: `target="_blank" rel="noopener"`。
- 文字が折り返せるように、`overflow-wrap: anywhere` を付ける（日本語の長い語のため）。
- `lang` が表示中の言語と違うときは、その要素に `lang` 属性を付ける。

**`RowCard.astro`**

- 高さは 100。
- 画像の幅: スマホ 96、`lg` で 160。
- 本文は縦の中央にそろえる。
  - 期間: `text-mono`
  - 題名: 最大2行。スマホは `text-card-title`、`lg` は `text-headline`。
  - 説明: `text-callout text-muted`、1行。

**`SortButton.astro`**

- 形: 高さ 36、カプセル、`border-border` の 1px 内側。
- 中身: `arrows-sort`（14）と文字。間は 8。
- 文言: `t("sort.newest")` / `t("sort.oldest")` を `data-*` 属性で `scripts/sort.ts` に渡す。
- 動き: 押すと、`#list` の子要素の順を逆にし、文字を入れ替える。
- JavaScript が無いときは、新しい順のまま。

- [ ] **Step 1: 試しのページを作る**

- `src/pages/_dev/cards.astro` を作る。`_` で始まるので、書き出されない。
- 載せるカード:
  - 長い題名（60文字）
  - 画像なし
  - ブランドのフォールバック

- [ ] **Step 2: 見た目を確かめる**

- 390 と 1440 で、Figma の部品 `33:126`（Card）と `33:153`（RowCard）に合うことを確かめる。
- 題名の長さによらず、カードの高さが同じであることを確かめる。

- [ ] **Step 3: `_dev/cards.astro` を消し、`vp run check` と `vp test apps/web/test/no-hardcode` を通してコミット**

```bash
git add apps/web/src/components apps/web/src/scripts
git commit -m "feat(web): add card, row card and sort button"
```

---

### Task 8: Works の一覧（4分類）

**Files:**

- Create: `apps/web/src/components/Sheet.astro`
- Create: `apps/web/src/components/PageHead.astro`
- Create: `apps/web/src/components/WorksNav.astro`
- Create: `apps/web/src/components/WorksList.astro`
- Create: `apps/web/src/views/WorksView.astro`
- Create: `apps/web/src/pages/[locale]/works/[category].astro`
- Create: `apps/web/src/pages/[locale]/works/index.astro`（`localizePath("/works/apps", locale)` への redirect）
- Test: `apps/web/test/works.test.ts`

**Interfaces:**

- Consumes: `Site`（Task 5）、`Card` / `RowCard` / `SortButton`（Task 7）、`getWorks` / `categories`（Task 6）
- Produces:
  - **`Sheet.astro`**: `{ receded?: boolean }`。スマホのシートの外形を描く。中身は slot。
    - 外形: 取っ手（36×5、`border` の色、カプセル）。見出しは持たない。
    - 位置: 上端は、上の段の下 8px。
    - 形: 上だけ `rounded-sheet`、`shadow-sheet`、`bg-surface`。
    - スクロール: 中だけでスクロールし、`overscroll-behavior: contain`。下に、ナビゲーションバーの分の余白を取る。
    - `lg` では外形を消し、ただの領域になる。
  - **`PageHead.astro`**: `{ title: string; as?: "h1" | "h2"; show?: "both" | "mobile" | "desktop"; count?: number; sortList?: string; locale: Locale }`。ページの見出しの行。
    - 見出し: `text-title-l`。`show` に合わない幅では、見えなくするだけにする（`sr-only`。読み上げには残す）。
    - スマホ: 見出しの下に、件数（`t("count")`、`text-caption`）と `SortButton` の行。
    - パソコン: 見出しの右に件数、行の右端に `SortButton`。
  - **`WorksNav.astro`**: `{ current: Category; locale: Locale }`。2つを描く。
    - スマホの切り替え: 高さ 40、中の項目 32、カプセル。
    - パソコンのサイドバー:
      - `bg-surface` の線付きカード。角丸 16、内側の余白 4。
      - 項目は高さ 44・角丸 12。
      - 置き場所: 画面の上下の中央に `position: fixed`。左 32、幅 216。
    - 今いる項目: `fg` の面に `bg` の文字、`aria-current="page"`。
    - `aria-label={t("works.label")}`。
  - **`WorksList.astro`**: `{ category: Category; locale: Locale }`。
    - 先頭に `PageHead`（分類名、`as="h2"`、`show="desktop"`、件数、`sortList="works-list"`）。
    - 一覧の id は `works-list`。
  - **`WorksView.astro`**: `{ category: Category; locale: Locale }`。次の順に描く。
    1. `PageHead title="Works" show="mobile"`（`h1`）
    2. `WorksNav`
    3. `WorksList`

    スマホでは、全体を `Sheet` に入れる。

- [ ] **Step 1: 失敗するテストを書く**

```ts
test.each(["apps", "career", "awards", "events"])("/ja/works/%s lists its items", (c) => {
  const page = loadPage(`/ja/works/${c}`);
  expect(
    page.querySelector('nav[aria-label="メイン"] [aria-current="page"]')!.getAttribute("href"),
  ).toBe("/ja/works/apps");
  expect(page.querySelectorAll(`a[href="/ja/works/${c}"][aria-current="page"]`).length).toBe(2); // 切り替えとサイドバー
  expect(page.querySelector("#works-list")!.childNodes.length).toBeGreaterThan(0);
});
test("apps cards link to their detail pages", () => {
  const hrefs = loadPage("/ja/works/apps")
    .querySelectorAll("#works-list a")
    .map((a) => a.getAttribute("href"));
  expect(hrefs.every((h) => /^\/ja\/works\/apps\/[\w-]+$/.test(h!))).toBe(true);
});
test("/ja/works redirects to apps", () =>
  expect(readDist("ja/works/index.html")).toContain("/ja/works/apps"));
test("default order is newest first", () => {
  const dates = loadPage("/ja/works/apps")
    .querySelectorAll("#works-list .meta")
    .map((m) => m.textContent);
  expect(dates).toEqual([...dates].sort().reverse());
});
```

- [ ] **Step 2: 失敗を確かめる**

Run: `vp run @ut42tech/web#build && vp test apps/web/test/works`
Expected: FAIL

- [ ] **Step 3: 実装する**

- `pages/[locale]/works/[category].astro`: `getStaticPaths` で、公開中の言語 × 4分類を返す。`<WorksView locale={…} category={…} />` を描くだけにする。
- 中身の並べ方:

| 分類                   | 部品      | スマホ       | パソコン           |
| ---------------------- | --------- | ------------ | ------------------ |
| Apps / Awards / Events | `Card`    | 2列、間 16   | 3列、間 24、幅 264 |
| Career                 | `RowCard` | 縦1列、間 12 | 縦1列、間 12       |

- パソコンの中身の幅: `main` の左に 248px を空け、残りの中央に、最大 840px で置く。
- Awards には `href` を渡さない。
- Events は、`url` があれば外へ開くリンクにする。無ければ `href` を渡さない。

- [ ] **Step 4: 通ることを確かめる**

Run: `vp run @ut42tech/web#build && vp test apps/web/test/works`
Expected: PASS

- [ ] **Step 5: 見た目を確かめる**

- 390 と 1440、ライトとダークで撮る。
- Figma の `43:602` / `43:766` / `43:1043` / `44:669` / `44:862` / `44:1047` と比べる。
- 次を確かめる。
  - サイドバーが上下の中央にあり、中身が領域の中央にある。
  - スマホで、シートが上の段の下から始まる。
  - 最後のカードが、ナビゲーションバーに隠れない。

- [ ] **Step 6: `vp run check` を通してコミット**

```bash
git add apps/web
git commit -m "feat(web): add works category pages"
```

---

### Task 9: Apps の詳細

**Files:**

- Create: `apps/web/src/components/AppDetail.astro`
- Create: `apps/web/src/views/AppDetailView.astro`
- Create: `apps/web/src/pages/[locale]/works/apps/[slug].astro`（公開中の言語 × 作品）
- Create: `apps/web/src/scripts/detail-sheet.ts`
- Test: `apps/web/test/app-detail.test.ts`

**Interfaces:**

- Consumes: `Sheet` / `PageHead` / `WorksNav` / `WorksList`（Task 8）、`Thumb`（Task 7）、`UiIcon` / `BrandIcon` / `brandIcons`（Task 3）
- Produces:
  - `AppDetail.astro`: `{ entry: LocalizedEntry<"apps">; locale: Locale }`。
  - 描き方: `<dialog open class="app-detail" data-close-href={localizePath("/works/apps", locale)}>`。中の順は次のとおり。
    1. 閉じる（スマホ）: `x`、32px の `fill` の丸、`aria-label={t("detail.close")}`
    2. 戻る（パソコン）: `chevron-left` 14 と `t("detail.back")`。`fill` のカプセル、高さ 36
    3. 画像（16:10）
    4. 補足「YYYY.MM · Apps」
    5. `h1` の題名（`text-title-l`）
    6. 本文（`text-body`）
    7. ボタン: Demo は `fg` の面、GitHub は線。高さ 40。外部の印 `arrow-up-right` 14。`data-link="demo"` / `data-link="github"`。無いものは出さない
    8. Stack のタイル: 48、角丸 12、アイコン 22、`title` と `aria-label` にブランド名
  - 閉じると戻るは、どちらも一覧へのリンクにする。

- [ ] **Step 1: 失敗するテストを書く**

```ts
const slugs = readdirSync(new URL("../src/content/apps/ja/", import.meta.url)).map((f) =>
  f.replace(/\.md$/, ""),
);
test.each(slugs)("/ja/works/apps/%s renders a readable detail without JS", (slug) => {
  const page = loadPage(`/ja/works/apps/${slug}`);
  const dialog = page.querySelector("dialog.app-detail")!;
  expect(dialog.hasAttribute("open")).toBe(true);
  expect(dialog.querySelector("h1")!.textContent.trim().length).toBeGreaterThan(0);
  expect(dialog.querySelectorAll('a[href="/ja/works/apps"]').length).toBe(2); // 閉じる・戻る
  expect(page.querySelectorAll("h1").length).toBe(1);
});
test("missing links are not rendered", () => {
  for (const slug of slugs) {
    const page = loadPage(`/ja/works/apps/${slug}`);
    const fm = readFrontmatter(`apps/ja/${slug}.md`);
    expect(page.querySelector('dialog a[data-link="demo"]') !== null).toBe(Boolean(fm.demo));
    expect(page.querySelector('dialog a[data-link="github"]') !== null).toBe(Boolean(fm.github));
  }
});
```

`readFrontmatter(path)` を `test/html.ts` に足す。YAML の先頭の塊から `key: value` を読む、小さな関数でよい。

- [ ] **Step 2: 失敗を確かめる**

Run: `vp run @ut42tech/web#build && vp test apps/web/test/app-detail`
Expected: FAIL

- [ ] **Step 3: 実装する**

**`AppDetailView.astro`**

`Site section="works"` の中に、次を置く。

- `WorksNav current="apps"`
- `Sheet receded`
  - 中に `PageHead title="Works" as="h2" show="mobile"` と `WorksList category="apps"`。
  - 題名の `h1` は、詳細だけが持つ。
- `AppDetail`

**スマホ（1024px 未満）**

- 詳細のシート:
  - `position: fixed`。上端は Works のシートと同じ。ナビゲーションバーより手前に出す。
  - 外形はシートと同じ。取っ手と閉じるの行は高さ 40。
- 下の Works のシート（`receded`）: 左右を 12px 狭め、上端を 10px 上げる。
- 暗くする層: `dialog::backdrop` に `--ut-color-scrim`。

**パソコン（1024px 以上）**

- 一覧を隠す（`receded` の Sheet を `display: none`）。
- `dialog` を普通の流れに置く。`position: static`。ブラウザ標準の余白と枠は外す。
- 幅は 720。サイドバーの右の領域の中央に置く。

**`scripts/detail-sheet.ts`**

- 1024px 未満のときだけ、`open` を外して `showModal()` を呼ぶ。後ろを操作できない状態にするため。
- `cancel`（Esc）を受けたら、既定の動きを止めて `location.href = data-close-href` に移る。

- [ ] **Step 4: 通ることを確かめる**

Run: `vp run @ut42tech/web#build && vp test apps/web/test/app-detail`
Expected: PASS

- [ ] **Step 5: 見た目と操作を確かめる**

- Figma の `43:691`（スマホ）と `44:770`（パソコン）と比べる。
- スマホの幅で、次を確かめる。
  - Tab キーが詳細の外へ出ない。
  - Esc で一覧に戻る。
  - JavaScript を切っても読める。

- [ ] **Step 6: `vp run check` を通してコミット**

```bash
git add apps/web
git commit -m "feat(web): add app detail sheet"
```

---

### Task 10: About

**Files:**

- Create: `apps/web/src/data/skills.ts`
  - `export const skills: readonly SkillIcon[] = ["typescript", "python", "swift", "react", "nextdotjs", "vuedotjs", "astro", "threedotjs", "unity", "blender", "figma"]`
- Create: `apps/web/src/views/AboutView.astro`
- Create: `apps/web/src/pages/[locale]/about.astro`
- Create: `apps/web/src/scripts/copy-email.ts`
- Test: `apps/web/test/about.test.ts`

**Interfaces:**

- Consumes: `profile`（Task 2）、`BrandIcon` / `UiIcon` / `brandIcons`（Task 3）、`useTranslations` / `mottoFor`（Task 4）、`Sheet` / `PageHead`（Task 8）

**ページの構成**（上から。文言はすべて辞書から取る）

| 部分     | 中身                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 見出し   | `PageHead title={t("about.title")}`（`h1`）                                                                                                                              |
| 本人     | 写真、本名（スマホ `text-headline`、パソコン `text-title-m`）、所属（`about.affiliation1` と `about.affiliation2`。パソコンは `·` でつなぎ、スマホは改行。`text-muted`） |
| 自己紹介 | `about.intro`（`text-body`）                                                                                                                                             |
| モットー | `mottoFor(locale)`（`text-headline`）                                                                                                                                    |
| Skills   | 見出し（`text-mono text-muted`）と、48 のタイル（角丸 12、アイコン 22、`data-skill`、`role="img"`、`aria-label` にブランド名）。間 12                                    |
| これまで | 見出しと `about.history`                                                                                                                                                 |
| Contact  | 下の表                                                                                                                                                                   |

- 写真: `@ut42tech/assets/profile.jpg` を `astro:assets` の `Image` で描く。スマホ 96 / パソコン 144 の丸。2倍の解像度を用意する。
- `id="contact"` は、Contact の見出しを含む `section` に付ける。

**Contact の中身**

- **SNS のボタン**: `about.note.sns` の後に置く。
  - 形: 高さ 44、カプセル、`bg-fill`、左の余白 16。アイコン（18）と文字の間は 8。
  - 並び: スマホ 2列、パソコン 4列。間 8。
  - リンク: `rel="me noopener"`。
- **メール欄**: `about.note.email` の後に置く。
  - 形: 高さ 48、角丸 12、線、左右の余白 16。
  - 中身: `mail`（16）と `mailto:` のリンク、コピーのボタン（`copy` 16、`aria-label={t("about.copy")}`）。
  - コピーすると、`aria-live="polite"` の領域に `about.copied` を出す。文言は `data-*` 属性で script に渡す。

**幅と置き方**

- スマホ: `Sheet` の中に置く。
- パソコン: 幅 720 で、画面の中央に置く。

- [ ] **Step 1: 失敗するテストを書く**

```ts
const about = loadPage("/ja/about");
test("renders identity and contact without JavaScript", () => {
  expect(about.textContent).toContain(profile.name);
  expect(about.textContent).toContain(profile.motto);
  expect(
    about.querySelector('nav[aria-label="メイン"] [aria-current="page"]')!.getAttribute("href"),
  ).toBe("/ja/about");
  const contact = about.querySelector("#contact")!;
  for (const link of profile.social)
    expect(contact.querySelector(`a[href="${link.href}"]`)).not.toBeNull();
  expect(contact.querySelector(`a[href="mailto:${profile.email}"]`)).not.toBeNull();
});
test("skills are labelled icons", () =>
  expect(about.querySelectorAll("[data-skill][aria-label]").length).toBe(11));
test("no research link yet", () => expect(about.textContent).not.toContain("研究について"));
```

- [ ] **Step 2: 失敗を確かめる**

Run: `vp run @ut42tech/web#build && vp test apps/web/test/about`
Expected: FAIL

- [ ] **Step 3: 実装する**

- [ ] **Step 4: 通ることを確かめる**

Run: `vp run @ut42tech/web#build && vp test apps/web/test/about`
Expected: PASS

- [ ] **Step 5: 見た目を確かめる**

Figma の `43:458` / `44:523` と比べる。ライトとダークの両方を確かめる。

- [ ] **Step 6: `vp run check` を通してコミット**

```bash
git add apps/web
git commit -m "feat(web): add about page with contact"
```

---

### Task 11: Press

**Files:**

- Create: `apps/web/src/views/PressView.astro`
- Create: `apps/web/src/pages/[locale]/press.astro`
- Test: `apps/web/test/press.test.ts`

**Interfaces:**

- Consumes: `Card` / `SortButton`（Task 7）、`Sheet` / `PageHead`（Task 8）、`getWorks("press", locale)`（Task 6）

**ページの構成**

- 見出しの行: `PageHead title={t("press.title")} count={n} sortList="press-list"`（`h1`）
- 一覧の id: `press-list`
- カードの補足: `「YYYY.MM · {outlet}」`。1行で「…」。
- 画像が無いとき: `source` がブランドのアイコンを持っていれば、そのアイコン。`other` なら頭文字。
- リンク: 外へ開く。
- 並べ方:
  - スマホ: `Sheet` の中に、カード2列。
  - パソコン: カード3列。幅 840 で、画面の中央に置く。

- [ ] **Step 1: 失敗するテストを書く**

```ts
const press = loadPage("/ja/press");
test("press cards open outside", () => {
  const links = press.querySelectorAll("#press-list a");
  expect(links.length).toBeGreaterThan(0);
  for (const a of links) {
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
  }
});
test("nav marks press", () =>
  expect(
    press.querySelector('nav[aria-label="メイン"] [aria-current="page"]')!.getAttribute("href"),
  ).toBe("/ja/press"));
```

- [ ] **Step 2: 失敗を確かめる**

Run: `vp run @ut42tech/web#build && vp test apps/web/test/press`
Expected: FAIL

- [ ] **Step 3: 実装する**

- [ ] **Step 4: 通ることを確かめる**

Run: `vp run @ut42tech/web#build && vp test apps/web/test/press`
Expected: PASS

- [ ] **Step 5: 見た目を確かめる**

Figma の `43:845` / `44:949` と比べる。

- [ ] **Step 6: `vp run check` を通してコミット**

```bash
git add apps/web
git commit -m "feat(web): add press page"
```

---

### Task 12: 全ページの点検

**Files:**

- Create: `apps/web/test/a11y.test.ts`
- Modify: 点検で見つかった箇所

- [ ] **Step 1: 失敗するテストを書く**

```ts
const routes = [
  "/ja/",
  "/ja/about",
  "/ja/works/apps",
  "/ja/works/career",
  "/ja/works/awards",
  "/ja/works/events",
  "/ja/press",
  ...appRoutes("ja"),
];
test.each(routes)("%s: every link and button has a name", (route) => {
  for (const el of loadPage(route).querySelectorAll("a, button")) {
    const name = el.getAttribute("aria-label") ?? el.textContent.trim();
    expect(name.length, el.outerHTML.slice(0, 120)).toBeGreaterThan(0);
  }
});
test.each(routes)("%s: interactive elements opt into the pointer", (route) => {
  for (const el of loadPage(route).querySelectorAll("a, button"))
    expect(el.hasAttribute("data-cursor"), el.outerHTML.slice(0, 120)).toBe(true);
});
test.each(routes)("%s: one h1", (route) =>
  expect(loadPage(route).querySelectorAll("h1").length).toBe(1),
);
```

`appRoutes(locale)` を `test/html.ts` に足す。`/<locale>/works/apps/<slug>` の一覧を返す。

- [ ] **Step 2: 失敗を確かめ、直し、通す**

Run: `vp run @ut42tech/web#build && vp test`
Expected: すべて PASS（no-hardcode を含む）

- [ ] **Step 3: すべての画面を Figma と並べて確かめる**

**撮るもの**

- 全ページを撮る。
- 幅は 390×844 と 1440×900。加えて、境目の 1023 と 1024 も撮る。
- ライトとダークの両方を撮る。

**確かめること**

- 7.1 章の整列の規則。
  - 高さ（36 / 40 / 44 / 48）
  - アイコンの大きさ
  - 角丸が同心になっていること
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

### Task 13: 引き継ぎの文書

**Files:**

- Modify: `README.md`（「デザインへの引き継ぎ」の節）

- [ ] **Step 1: README を書き換える**

「仮のもの」という説明を消し、次の項目を書く。

- **今の構成**:
  - トークンの置き場所
  - ページと URL の一覧
  - 中身の足し方（`src/content/<collection>/<lang>/*.md` の frontmatter の項目）
- **ハードコード禁止の決まり**: アイコンはパッケージから、文言は辞書から、色はトークンから。`test/no-hardcode.test.ts` が見張っていることも書く。
- **英語を公開する手順**:
  1. `en` の辞書を本番の文に直す。
  2. `src/content/*/en/` に翻訳を足す。
  3. `publishedLocales` に `"en"` を足す（ページは `[locale]` から自動で書き出される）。
  4. `vercel.json` の `/` の振り分けを、3本にする。
     1. クッキー `ut42tech-lang` が `en` なら `/en/`
     2. `Accept-Language` が英語で始まるなら `/en/`
     3. それ以外は `/ja/`
  5. 言語の切り替えは、公開中の言語が2つになると自動で出る。英語のページで見た目と動きを確かめる。
- **公開前に本人が書くもの**:
  - About の自己紹介と、これまで（「（仮）」の文）
  - 素材に無かった Press（note、Zenn、Qiita、YouTube、Speaker Deck）
  - Apps の `stack`
- **次の計画「動き」で足すもの**（1行ずつ）:
  - 登場演出
  - 「Welcome.」の吸い付きと弾み
  - ipad-cursor
  - シートのせり上がりと、払って閉じる操作
  - カードから詳細へ広がる遷移
  - 押したときの沈み

- [ ] **Step 2: `vp run check` と `vp test` を通してコミット**

```bash
git add README.md
git commit -m "docs: document the portfolio site structure"
```
