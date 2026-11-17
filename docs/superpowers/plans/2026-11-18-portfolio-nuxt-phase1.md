# ポートフォリオ 段階1（Nuxt への移行と画面の土台）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/web` を Astro から Nuxt 4 に移し、今のサイトの振る舞いをすべて保ったまま、スマホのシートと Apps の詳細を「指に付いてきて、勢いを引き継ぎ、途中で割り込める」動きにする。

**Architecture:**

- Nuxt 4 の静的書き出し（`nuxt generate`）。全 URL を HTML に書き出し、読み込んだあとは同じ文書の中でページを移る。
- Hello の舞台、ヘッダー、シートの土台、ナビバーは `app.vue` に置き、ページを移っても作り直さない。シートの中身は Vue Router の今の経路から決める。
- 動きは「開き具合」（0 = 閉じた、1 = 開いた）を Motion の値で持ち、ばねで動かす。指で引く、閉じる判断、履歴の扱いは Vue に依存しない素の TS（`app/motion/`）に置く。

**Tech Stack:** Nuxt 4.6.4、Vue 3.5、`motion-v` 2.12.0（画面の外では `motion`）、`@nuxt/content` 3.17.0、`@nuxt/image` 2.2.1、Tailwind CSS 4.3.5（`@tailwindcss/vite`）、`@vueuse/core` 15.0.0、Vite+（`vp check`、`vp test`）、`node-html-parser`

**Spec:** `docs/superpowers/specs/2026-11-18-portfolio-motion-design.md`（段階1 = 9 章の 1）。見た目は `docs/superpowers/specs/2026-11-17-portfolio-visual-design.md`、構造は `docs/superpowers/specs/2026-11-16-portfolio-wireframe-design.md`。食い違いは前者が優先（設計書 12 章）。

**今の実装の読み方:** Astro の元のコードは Task 1 で消す。移すときは `git show main:apps/web/src/<path>` で読む（例: `git show main:apps/web/src/components/WorksNav.astro`）。見た目（CSS、クラス、文言キー）はそのまま移す。

## Global Constraints

- **ハードコード禁止**（今のテスト `test/no-hardcode.test.ts` を移して守らせる）:
  - SVG の要素やパスをソースに書かない（`BrandIcon.vue` だけは `simple-icons` のパスを描く）。
  - 画面の文言を部品に書かない（辞書 `app/i18n/messages/*.ts` を通す）。
  - 色を書かない（`#…`、`rgb()`、`hsl()` 禁止。`packages/tokens` の変数を使う）。
- 値は `@ut42tech/tokens` から読む。動きの数値は Task 7 で作る `@ut42tech/tokens/motion`。
- スマホとパソコンの境目は 1024px（`64rem`）。同じ HTML を CSS で出し分ける。
- 公開する言語は `publishedLocales = ["ja"]` のまま。英語の辞書は持つが書き出さない。
- `import` は明示する。Nuxt の自動 import と部品の自動登録は切る（`imports.autoImport: false`、`components: []`）。Nuxt の関数は `#imports`、`#app` などから import する。依存が読み手に見え、部品を Nuxt の外でテストできるようにするため。
- 動きの層の決まり（設計書 6 章）: `app/motion/` の TS は `vue`、`nuxt`、`motion-v` を import しない（使ってよいのは `motion`）。
- コメントと名前は、今のコードの書き方に合わせる（短い英語のコメント、理由を書く）。
- コミットの最後に `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` を付ける。
- 検査コマンド: `vp run check`（エラーなし）、`pnpm --filter @ut42tech/web build` のあと `vp test`。

## Review Focus

1. **共有リンクで詳細を直接開く**（`/ja/works/apps/<slug>` を新しいタブで開く）: JavaScript なしで詳細が読め、読み込み後はスマホで詳細がモーダルのシート、裏で一覧が奥へ下がった状態から始まる。閉じると一覧に置き換わり、ブラウザの「戻る」で詳細は開かない。→ Task 6 と Task 9 のテスト。
2. **1024px をまたぐ回転・幅の変更**（詳細やシートを開いたまま）: パソコンの幅でシートの動きの `transform` が残らない。スマホの幅に戻るとモーダルに戻る。→ Task 6 と Task 8 のテスト。
3. **動きの途中の連打**（シートがしまわれている間に別のタブを2回押す、閉じる途中でタブを押す）: 最後に押したタブの中身で1回だけ上がる。中身が二重に入れ替わったり、止まったりしない。→ Task 8 のテスト。
4. **視差効果を減らす設定**: ばねも「しまって上がる」も使わず、150ms の切り替えになる。指で引く間は付いてくる。→ Task 7 のテスト。
5. **ページの見出しが1つ**: 詳細を開いているときは Works の見出しが `h2` になり、Hello の舞台はシートの裏では `h1` にならない。→ Task 3、Task 6 のテスト（`a11y.test.ts`）。

---

## ファイルの構成

```
apps/web/
  nuxt.config.ts            Nuxt の設定（自動 import なし、書き出す経路、画像、中身）
  content.config.ts         中身の集まりと項目（今の content.config の移し替え）
  content/<集まり>/ja/*.md   中身（src/content から移す）
  public/works/<集まり>/*    作品の画像（src/assets/works から移す）
  vercel.json               転送 + Nuxt で書き出す設定
  app/
    app.vue                 画面の土台（head、Hello、ヘッダー、シートの土台、ナビ）
    error.vue               404
    pages/                  経路（下の表）
    components/             画面の部品（Vue）
    composables/            Vue の層のつなぎ（言語、中身、幅、シートの状態）
    motion/                 動きの仕組み（素の TS。Vue に依存しない）
    i18n/ lib/ data/        src から移す（中身はそのまま）
    assets/css/global.css   src/styles/global.css から移す
    plugins/ua-transition.client.ts
  test/                     HTML のテスト（.output/public を読む）
```

**経路**

| ファイル                                         | URL                                                                              |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `app/pages/index.vue`                            | `/`（Vercel の外での `/ja/` への転送）                                           |
| `app/pages/[locale].vue`                         | 言語の検査だけをする親（`<NuxtPage />` を出す）                                  |
| `app/pages/[locale]/index.vue`                   | `/ja/`（Hello。シートは閉じる）                                                  |
| `app/pages/[locale]/about.vue`                   | `/ja/about`                                                                      |
| `app/pages/[locale]/press.vue`                   | `/ja/press`                                                                      |
| `app/pages/[locale]/works/index.vue`             | `/ja/works`（Apps へ転送）                                                       |
| `app/pages/[locale]/works/[category].vue`        | `/ja/works/apps` など4つ（一覧。子の `<NuxtPage />` を出す）                     |
| `app/pages/[locale]/works/[category]/index.vue`  | 一覧だけのとき（中身なし）                                                       |
| `app/pages/[locale]/works/[category]/[slug].vue` | `/ja/works/apps/<slug>`（`category` が `apps` で、その slug があるときだけ有効） |
| `app/pages/[...missing].vue`                     | どれにも当たらない経路（404 を投げる）                                           |

---

### Task 1: Nuxt の土台と、フレームワークに依存しないコードの移し替え

**Files:**

- Delete: `apps/web/astro.config.mjs`、`apps/web/src/`（下で移すもの以外）、`apps/web/tsconfig.json`（Nuxt 用に作り直す）
- Move（中身はそのまま、import のパスだけ直す）: `src/i18n/` → `app/i18n/`、`src/lib/{works,localized,theme,icons}.ts`（とテスト） → `app/lib/`、`src/data/skills.ts` → `app/data/`、`src/components/{UiIcon,BrandIcon,ThemeToggle}.vue` → `app/components/`、`src/styles/global.css` → `app/assets/css/global.css`
- Delete: `src/lib/content.ts`（Task 2 で作り直す）、`src/scripts/`（Task 4〜7 で作り直す）
- Create: `apps/web/nuxt.config.ts`、`apps/web/tsconfig.json`、`apps/web/app/app.vue`（仮。`<NuxtPage />` だけ）、`apps/web/app/pages/[locale].vue`、`apps/web/app/pages/[locale]/index.vue`（仮）
- Modify: `apps/web/package.json`、`vite.config.ts`（ルート）、`apps/web/test/html.ts`

**Interfaces:**

- Produces: `readDist(path)`、`loadPage(route)`、`appRoutes(locale)`、`readFrontmatter(path)`（`test/html.ts`。読み先が `.output/public/` に変わるだけで、名前と型は今と同じ）。`readFrontmatter` は `content/<path>` を読む。

- [ ] **Step 1: 依存を入れ替える**

`apps/web/package.json`:

- 外す: `astro`、`@astrojs/vue`、`@astrojs/check`
- 足す: `nuxt@4.6.4`、`motion-v@2.12.0`、`motion`（`motion-v` が要求する版）、`@nuxt/content@3.17.0`、`@nuxt/image@2.2.1`、`@vueuse/core@15.0.0`
- 残す: `@fontsource/*`、`@tabler/icons-vue`、`@tailwindcss/vite`、`tailwindcss`、`simple-icons`、`simple-icons-11`、`@ut42tech/*`、`vue`、`node-html-parser`、`typescript`、`vue-tsc`
- scripts: `"dev": "nuxt dev"`、`"build": "nuxt generate"`、`"preview": "nuxt preview"`、`"typecheck": "nuxt typecheck"`、`"postinstall": "nuxt prepare"`

- [ ] **Step 2: `nuxt.config.ts` を書く**

決めること（この値で書く）:

- `compatibilityDate: "2026-11-01"`、`srcDir` は Nuxt 4 の既定（`app/`）
- `imports: { autoImport: false }`、`components: []`
- `modules: ["@nuxt/content", "@nuxt/image", "motion-v/nuxt"]`（`motion-v/nuxt` は部品を自動登録するが、こちらは明示 import で使う）
- `css: ["~/assets/css/global.css"]`、`vite.plugins: [tailwindcss()]`
- `site` の絶対 URL は `runtimeConfig.public.siteUrl = "https://ut42tech.com"`
- `nitro.prerender`: `routes: ["/", "/ja/", "/404.html"]`、`crawlLinks: true`、`failOnError: true`
- `image: { provider: "ipxStatic", format: ["webp"], screens: { lg: 1024 } }`。プロフィール写真は `packages/assets` から読むので、`image.dirs` に `../../packages/assets` を足す（Task 4 で写真の画像ができていることをテストで確かめる。読めなければ、`nitro.publicAssets` で同じ場所を配る形に変える）
- `content: { experimental: { sqliteConnector: "native" } }`（Node 24 の組み込み SQLite）
- `app.head.htmlAttrs.lang` は付けない（Task 3 で言語から付ける）

- [ ] **Step 3: ルートの `vite.config.ts` を合わせる**

`ignorePatterns` を `["**/dist/**", "**/.nuxt/**", "**/.output/**", "**/.data/**", "**/.vercel/**"]` にする（`.astro` を外す）。`apps/web/tsconfig.json` は `{ "extends": "./.nuxt/tsconfig.json" }`。

- [ ] **Step 4: `test/html.ts` の読み先を `.output/public/` にする**

`dist` を `new URL("../.output/public/", import.meta.url)` に、エラーの文言を `` `apps/web/.output/public/${path} is missing: run \`pnpm --filter @ut42tech/web build\` first` `` に、`appRoutes` と `readFrontmatter` の読み先を `../content/` に変える。

- [ ] **Step 5: 書き出しと単体テストを確かめる**

Run: `pnpm install && pnpm --filter @ut42tech/web build && vp test apps/web/app`
Expected: 書き出しが終わり、`app/i18n/i18n.test.ts`（`vercel.json` の読み先を `../../vercel.json` に直す）、`app/lib/*.test.ts` が通る。`apps/web/test/` の HTML のテストはまだ落ちてよい（Task 3〜6 で直す）。

- [ ] **Step 6: 検査を通す**

Run: `vp run check`
Expected: エラーなし。

- [ ] **Step 7: コミット**

```bash
git add -A apps/web vite.config.ts pnpm-lock.yaml
git commit -m "build(web): replace Astro with Nuxt and move framework-free code"
```

---

### Task 2: 中身（`@nuxt/content`）と作品の画像

**Files:**

- Move: `src/content/**` → `apps/web/content/**`（ファイル名と本文はそのまま）、`src/assets/works/**` → `apps/web/public/works/**`
- Create: `apps/web/content.config.ts`、`apps/web/app/composables/use-works.ts`、`apps/web/app/lib/content.test.ts`
- Modify: `content/apps/ja/coto2-ba.md`、`content/press/ja/nagasaki-university-idsci-2024.md`（`thumbnail` を `/works/apps/coto2-ba.png`、`/works/press/41b115owqt.png` にする）、`app/lib/localized.ts`

**Interfaces:**

- Consumes: `pickLocalized(entries, locale)`（`app/lib/localized.ts`）、`sortByDate`（`app/lib/works.ts`）
- Produces:
  - `type WorksCollection = "apps" | "career" | "awards" | "events" | "press"`
  - `useWorks<C extends WorksCollection>(collection: C, locale: MaybeRefOrGetter<Locale>): Promise<ComputedRef<Localized<WorkEntry<C>>[]>>`（`app/composables/use-works.ts`。新しい順。`useAsyncData` のキーは `` `works:${collection}:${locale}` ``）
  - `useWorkCounts(locale): Promise<ComputedRef<Record<Category, number>>>`
  - `WorkEntry<C>`: `@nuxt/content` の集まりの型（`CollectionItemMap[C]`）
  - 各項目の `id` は `"<lang>/<slug>"`。`stem`（例 `apps/ja/coto2-ba`）から作る `entryId(stem: string): string` を `app/lib/localized.ts` に足す

- [ ] **Step 1: 失敗するテストを書く**

`app/lib/content.test.ts`:

```ts
test("entryId drops the collection and keeps <lang>/<slug>", () => {
  expect(entryId("apps/ja/coto2-ba")).toBe("ja/coto2-ba");
});

test("every thumbnail in content points to a file in public/works", () => {
  for (const file of markdownFiles("content")) {
    const thumbnail = frontmatter(file).thumbnail;
    if (thumbnail)
      expect(existsSync(new URL(`../../public${thumbnail}`, import.meta.url)), file).toBe(true);
  }
});
```

（`markdownFiles` と `frontmatter` はテストの中の小さな補助。`readFrontmatter` と同じ読み方。）

- [ ] **Step 2: 落ちることを確かめる**

Run: `vp test apps/web/app/lib/content.test.ts`
Expected: FAIL（`entryId` がない）

- [ ] **Step 3: `content.config.ts` を書く**

今の `src/content.config.ts`（`git show main:apps/web/src/content.config.ts`）の集まりと項目を、`@nuxt/content` の `defineCollection({ type: "page", source: "<集まり>/**/*.md", schema })` に移す。日付の正規表現、`stack` の列挙、`source` の列挙は同じ。`thumbnail` は `z.string().startsWith("/works/").optional()`。

- [ ] **Step 4: `entryId` と `useWorks`、`useWorkCounts` を書く**

`useWorks` は `queryCollection(collection).all()` を `useAsyncData` で読み、`id = entryId(stem)` を付けて `pickLocalized` → `sortByDate(…, "newest")`（並べ替えの鍵は今の `content.ts` と同じく `start` か `date`）。

- [ ] **Step 5: 通ることを確かめる**

Run: `vp test apps/web/app/lib/content.test.ts && pnpm --filter @ut42tech/web build`
Expected: PASS。書き出しも通る。

- [ ] **Step 6: コミット**

```bash
git add -A apps/web
git commit -m "feat(web): load works and press with Nuxt Content"
```

---

### Task 3: 画面の土台（動きなし）、Hello、404

**Files:**

- Create: `app/app.vue`（仮のものを置き換え）、`app/error.vue`、`app/pages/index.vue`、`app/pages/[...missing].vue`、`app/composables/use-locale.ts`、`app/composables/use-page-meta.ts`、`app/components/{SiteHeader,LocaleSwitch,NavBar,HelloStage,SheetFrame,NotFound}.vue`
- Modify: `app/pages/[locale].vue`、`app/pages/[locale]/index.vue`、`app/assets/css/global.css`（`@view-transition` と、その「減らす設定」の規則を消す）、`test/head.test.ts`（「reduced motion swaps page transitions…」のテストを消す。ページ遷移の仕組みがなくなるため）
- Test: `test/build-output.test.ts`、`test/head.test.ts`、`test/not-found.test.ts`（今のまま）

**Interfaces:**

- Produces:
  - `useLocale(): ComputedRef<Locale>`（`route.params.locale` から。`[locale].vue` の `definePageMeta({ validate })` で `publishedLocales` 以外は 404）
  - `useT(): ComputedRef<Translate>`
  - `usePageMeta(options: { title?: string; description?: string; indexable?: boolean })`: 今の `Site.astro` の head をそのまま作る（`<title>`、description、og:*、`twitter:card`、favicon、canonical と hreflang（絶対 URL。`indexable: false` なら出さずに `noindex`））
  - `type Section = "hello" | "about" | "works" | "press" | "not-found"` と `sectionOf(path: string): Section`（`app/lib/section.ts`。`/ja/works/apps/x` → `"works"`）
  - `SheetFrame.vue`: `<slot />` を今の `Sheet.astro` の見た目（取っ手、スマホの固定シート、パソコンではただの箱）で包む。`receded: boolean` を受ける

- [ ] **Step 1: 今の HTML のテストが落ちることを確かめる**

Run: `pnpm --filter @ut42tech/web build && vp test apps/web/test/build-output.test.ts apps/web/test/head.test.ts apps/web/test/not-found.test.ts`
Expected: FAIL

- [ ] **Step 2: `app.vue` を書く**

中身の順は今の `Site.astro` と同じ: 本文へ移るリンク → `SiteHeader` → Hello の舞台（`section` が `hello` のときは `main` の中の `h1`、それ以外は `main` の外で `aria-hidden` の飾り） → `<main id="content" :data-section>` → `NavBar`。`main` の中に `SheetFrame` と `<NuxtPage />` を置く（Hello と 404 では `SheetFrame` を出さない）。

- テーマのインラインのスクリプト（今の `Site.astro` の `<script is:inline>` の中身そのまま）を `useHead({ script: [{ innerHTML, tagPosition: "head" }] })` で `<head>` に入れる。
- `<html lang>` は `useLocale()` から。
- `section` は `sectionOf(router.currentRoute.value.path)`。**`useRoute()` ではなく Vue Router の `currentRoute` を読む**（設計書 7 章。Nuxt の `useRoute()` はページの描画が終わるまで更新されない）。

- [ ] **Step 3: 404 を書く**

`[...missing].vue` は `throw createError({ statusCode: 404 })`。`error.vue` は 404 のとき `NotFound.vue`（今の `NotFoundView.astro` の見た目）を出し、`usePageMeta({ title: t("notFound.title"), indexable: false })`。`nitro.prerender.routes` の `/404.html` で `.output/public/404.html` に書き出す。

- [ ] **Step 4: `/` の転送**

`app/pages/index.vue` は `navigateTo(localizePath("/", defaultLocale), { redirectCode: 302 })`。

- [ ] **Step 5: 押したときの沈み（設計書 8.9）**

スマホのタブ（`NavBar.vue` の項目）とボタン（Works の分類の切り替え、並べ替え）に、押している間 `scale: 0.92`（`var(--ut-duration-fast)`、`var(--ut-ease-out)`）を CSS の `:active` で付ける（`max-width: 64rem` 未満のみ）。並べ替えと分類の切り替えは Task 4、Task 5 で同じ決まりを付ける。

- [ ] **Step 6: 通ることを確かめる**

Run: `pnpm --filter @ut42tech/web build && vp test apps/web/test/build-output.test.ts apps/web/test/head.test.ts apps/web/test/not-found.test.ts`
Expected: PASS（head のテストは `/ja/` の分。ほかのページの分は Task 4〜6 で通る）

- [ ] **Step 7: コミット**

```bash
git add -A apps/web
git commit -m "feat(web): add the persistent shell, Hello and 404 on Nuxt"
```

---

### Task 4: About と Press

**Files:**

- Create: `app/pages/[locale]/about.vue`、`app/pages/[locale]/press.vue`、`app/components/{PageHead,SortButton,Card,Thumb,CopyEmail}.vue`
- Test: `test/about.test.ts`、`test/press.test.ts`（今のまま）、`test/about.test.ts` に写真のテストを足す

**Interfaces:**

- Consumes: `useWorks("press", locale)`、`usePageMeta`、`useT`
- Produces:
  - `Thumb.vue` props: `{ src?: string; alt: string; initial: string; brand?: BrandIconName; sizes: string; class?: string }`（`NuxtImg` で描く。画像がなければ今と同じ頭文字か媒体のアイコン）
  - `Card.vue` props: `{ to?: string; external?: boolean; title: string; meta: string; image?: string; initial: string; brand?: BrandIconName; lang?: Locale }`（外部のときは `target="_blank" rel="noopener"` と「↗」）
  - `SortButton.vue` props: `{ order: SortOrder }`、emit `update:order`。並べ替えは呼ぶ側が `sortByDate` で行う（DOM を並べ替えない）
  - `PageHead.vue` props: 今の `PageHead.astro` と同じ（`title`、`as`、`show`、`count`）。並べ替えは `v-model:order`

- [ ] **Step 1: 写真のテストを足して、落ちることを確かめる**

```ts
test("the profile photo is served resized from packages/assets", () => {
  const img = about.querySelector("img.photo")!;
  const urls = img
    .getAttribute("srcset")!
    .split(",")
    .map((s) => s.trim().split(" ")[0]!);
  expect(urls.length).toBeGreaterThan(1);
  for (const url of urls)
    expect(existsSync(new URL(`../.output/public${url}`, import.meta.url)), url).toBe(true);
});
```

Run: `pnpm --filter @ut42tech/web build && vp test apps/web/test/about.test.ts apps/web/test/press.test.ts`
Expected: FAIL

- [ ] **Step 2: 部品とページを書く**

見た目は `git show main:apps/web/src/views/AboutView.astro`、`PressView.astro`、`components/{Card,Thumb,PageHead,SortButton}.astro` のまま。画像の `sizes`: カード `"50vw lg:264px"`、写真 `"96px lg:144px"`。メールのコピーは今の `copy-email.ts` の振る舞い（コピーして、隣の `aria-live` に `about.copied` を 2 秒出す）を `CopyEmail.vue` に。

- [ ] **Step 3: 通ることを確かめる**

Run: `pnpm --filter @ut42tech/web build && vp test apps/web/test/about.test.ts apps/web/test/press.test.ts`
Expected: PASS

- [ ] **Step 4: コミット**

```bash
git add -A apps/web
git commit -m "feat(web): port About and Press to Vue"
```

---

### Task 5: Works の一覧

**Files:**

- Create: `app/pages/[locale]/works/index.vue`、`app/pages/[locale]/works/[category].vue`、`app/pages/[locale]/works/[category]/index.vue`、`app/components/{WorksNav,WorksList,RowCard}.vue`
- Test: `test/works.test.ts`（今のまま）

**Interfaces:**

- Consumes: `useWorks`、`useWorkCounts`、`Card`、`Thumb`、`PageHead`、`SortButton`
- Produces:
  - `[category].vue`: `definePageMeta({ validate: (r) => categories.includes(r.params.category) })`。一覧と、子の `<NuxtPage />`（Task 6 の詳細）を出す。子の経路があるとき、スマホの見出し（「Works」）を `h2` にする
  - `WorksNav.vue` props: `{ current: Category; counts: Record<Category, number>; part?: "both" | "segmented" | "sidebar" }`（今と同じ）
  - `WorksList.vue` props: `{ category: Category }`。中身の切り替え（分類を変えたとき）は `<Transition name="swap" mode="out-in">` で包む（Task 8 で動きの値を入れる。ここでは名前だけ）

- [ ] **Step 1: 落ちることを確かめる**

Run: `pnpm --filter @ut42tech/web build && vp test apps/web/test/works.test.ts`
Expected: FAIL

- [ ] **Step 2: ページと部品を書く**

`git show main:apps/web/src/views/WorksView.astro`、`components/{WorksNav,WorksList,RowCard}.astro` のまま。`/ja/works` は `navigateTo` で `/ja/works/apps` へ（静的な書き出しでは転送の HTML になる。`test/works.test.ts` の「/ja/works redirects to apps」が確かめる）。

- [ ] **Step 3: 通ることを確かめる**

Run: `pnpm --filter @ut42tech/web build && vp test apps/web/test/works.test.ts`
Expected: PASS

- [ ] **Step 4: コミット**

```bash
git add -A apps/web
git commit -m "feat(web): port the Works lists to Vue"
```

---

### Task 6: Apps の詳細（動きなし）

**Files:**

- Create: `app/pages/[locale]/works/[category]/[slug].vue`、`app/components/AppDetail.vue`、`app/composables/use-narrow.ts`、`app/motion/dialog-mode.ts`（今の `applySheetMode` を移す）
- Test: `test/app-detail.test.ts`（変える。下）、`test/a11y.test.ts`（今のまま）、`app/motion/dialog-mode.test.ts`（今の `detail-sheet.test.ts` の `applySheetMode` の2本を移す）

**Interfaces:**

- Consumes: `useWorks("apps", locale)`、`Thumb`、`useT`
- Produces:
  - `useNarrow(): Ref<boolean>`（`(width < 64rem)` の `matchMedia`。サーバーでは `false`）
  - `applySheetMode(dialog: SheetDialog, narrow: boolean): void`（今のまま）
  - `[slug].vue`: `definePageMeta({ validate })` で `category === "apps"` かつ slug がある項目だけ。中身は空で、詳細は親の `[category].vue` が `AppDetail` として出す（閉じる動きを経路が変わったあとも見せるため。Task 9）
  - `AppDetail.vue` props: `{ entry: Localized<WorkEntry<"apps">> }`、emit `close`。`<dialog open class="app-detail">` で書き出す（JavaScript なしでも読める）。スマホでは `showModal()`、パソコンでは `show()`（`applySheetMode` を `useNarrow` の変化で呼ぶ）
- 本文は `<ContentRenderer :value="entry" />`

- [ ] **Step 1: テストを設計書に合わせて変え、落ちることを確かめる**

`test/app-detail.test.ts` の「close and back」の数え方を変える（× をなくすため。設計書 8.4）:

```ts
expect(dialog.querySelectorAll('a[href="/ja/works/apps"]').length).toBe(1); // the desktop "back" capsule
const close = dialog.querySelector("button[data-close]")!;
expect(close.getAttribute("aria-label")).toBe("閉じる");
expect(close.classList.contains("sr-only")).toBe(true); // reachable for screen readers, not drawn
```

Run: `pnpm --filter @ut42tech/web build && vp test apps/web/test/app-detail.test.ts apps/web/test/a11y.test.ts apps/web/app/motion/dialog-mode.test.ts`
Expected: FAIL

- [ ] **Step 2: 詳細を書く**

見た目は `git show main:apps/web/src/components/AppDetail.astro` から、右上の × の見た目（`.close`）を除いたもの。目に見えない「閉じる」ボタンは `sr-only` の `<button type="button" data-close>`（`detail.close`）で、`close` を emit する。パソコンの「戻る」のカプセルは今のままリンク。詳細を開いている間、親の Works のシートに `receded` を付ける（今の見た目: 左右 12px、上端 10px）。

- [ ] **Step 3: 通ることを確かめる**

Run: `pnpm --filter @ut42tech/web build && vp test apps/web`
Expected: すべて PASS（`no-hardcode.test.ts` も。Task 10 で対象のフォルダを直す前は、旧パスを見て空振りしている点に注意。Task 10 で直す）

- [ ] **Step 4: コミット**

```bash
git add -A apps/web
git commit -m "feat(web): port the app detail as a dialog without a visible close button"
```

---

### Task 7: 動きの仕組み（素の TS）と数値

**Files:**

- Create: `packages/tokens/motion.ts`、`apps/web/app/motion/{gesture,progress,history}.ts` とそれぞれの `.test.ts`、`apps/web/app/plugins/ua-transition.client.ts`
- Modify: `packages/tokens/package.json`（`"./motion": "./motion.ts"` を足す）、`packages/tokens/tokens.test.ts`

**Interfaces:**

- Produces（`@ut42tech/tokens/motion`）:
  - `SHEET_SPRING = { type: "spring", stiffness: 380, damping: 39, restDelta: 0.0005, restSpeed: 0.005 } as const`
  - `DECAY_PER_MS = 0.998`、`CLOSE_FRACTION = 1 / 3`、`RUBBER_BAND = 0.15`、`SWAP_AT = 0.03`、`REDUCED_DURATION_MS = 150`
  - `RECEDE = { insetPx: 12, liftPx: 10 }`、`SWAP_OUT_MS = 120`、`SWAP_IN_MS = 200`、`SWAP_IN_OFFSET_PX = 8`
- Produces（`app/motion/gesture.ts`）:
  - `projectPx(velocityPx: number): number` = `(velocityPx / 1000) * DECAY_PER_MS / (1 - DECAY_PER_MS)`
  - `shouldClose(offsetPx: number, velocityPx: number, heightPx: number): boolean` = `offsetPx + projectPx(velocityPx) > heightPx * CLOSE_FRACTION`
  - `followFinger(start: number, dyPx: number, heightPx: number): number`（`start - dy/height`。1 を越えた分は `RUBBER_BAND` 倍）
- Produces（`app/motion/progress.ts`、`motion` を使う）:
  - `springTo(value: MotionValue<number>, to: number, options?: { velocity?: number; reduced?: boolean }): AnimationPlaybackControls`（`reduced` なら `REDUCED_DURATION_MS` の `ease-out` の補間。そうでなければ `SHEET_SPRING`。`velocity` を省くと、値が今持っている速さを引き継ぐ）
  - `dragProgress(event: PointerEvent, value: MotionValue<number>, heightPx: () => number, onRelease: (r: { offsetPx: number; velocityPx: number }) => void): void`（`setPointerCapture` は失敗しても続ける。動いている値は `stop()`。`followFinger` で値を置き、離したら `velocityPx = -value.getVelocity() * height`、`offsetPx = (1 - value.get()) * height`）
- Produces（`app/motion/history.ts`）:
  - `closeAction(back: string | null | undefined, target: string): "back" | "replace"`（末尾のスラッシュは無視して比べる。今の `detail-sheet.ts` の `closeAction` の決まり）
- Produces（`app/plugins/ua-transition.client.ts`）: `popstate` の `hasUAVisualTransition` を `uaTransition.skip` に置き、経路が移ったあと次のフレームで `false` に戻す。`uaTransition` は `app/motion/history.ts` から export する `{ skip: boolean }`

- [ ] **Step 1: 失敗するテストを書く**

```ts
test("a flick projects about half its speed in px", () =>
  expect(projectPx(1000)).toBeCloseTo(499, 0));
test("a short fast flick closes", () => expect(shouldClose(40, 1200, 860)).toBe(true));
test("a slow short drag springs back", () => expect(shouldClose(60, 50, 860)).toBe(false));
test("pulling above fully open resists", () =>
  expect(followFinger(1, -86, 860)).toBeCloseTo(1.015, 3));
test("closing goes back only when the previous entry is the target", () => {
  expect(closeAction("/ja/works/apps", "/ja/works/apps")).toBe("back");
  expect(closeAction("/ja/works/apps/", "/ja/works/apps")).toBe("back");
  expect(closeAction("/ja/about", "/ja/works/apps")).toBe("replace");
  expect(closeAction(null, "/ja/")).toBe("replace");
});
test("reduced motion swaps the spring for a 150ms tween", () => {
  const value = motionValue(0);
  const controls = springTo(value, 1, { reduced: true });
  expect(controls.duration).toBeCloseTo(0.15, 3);
});
test("the sheet spring is critically damped", () => {
  expect(SHEET_SPRING.damping).toBeCloseTo(2 * Math.sqrt(SHEET_SPRING.stiffness), 0);
});
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `vp test apps/web/app/motion packages/tokens`
Expected: FAIL

- [ ] **Step 3: 書く**

- [ ] **Step 4: 通ることを確かめる**

Run: `vp test apps/web/app/motion packages/tokens && vp run check`
Expected: PASS。`app/motion/` が `vue`、`nuxt`、`motion-v` を import していない（Task 10 のテストでも見張る）。

- [ ] **Step 5: コミット**

```bash
git add -A packages/tokens apps/web/app/motion apps/web/app/plugins
git commit -m "feat(web): add framework-free sheet gestures and motion tokens"
```

---

### Task 8: シートの動き（スマホ）と中身の入れ替え（パソコン）

**Files:**

- Create: `app/composables/use-sheet.ts`、`app/composables/use-reduced-motion.ts`
- Modify: `app/app.vue`、`app/components/SheetFrame.vue`、`app/components/WorksList.vue`、`app/assets/css/global.css`（`swap` の入れ替えの CSS）
- Test: `app/composables/use-sheet.test.ts`

**Interfaces:**

- Consumes: `springTo`、`dragProgress`、`shouldClose`、`closeAction`、`uaTransition`、`sectionOf`、`SWAP_AT`、`useNarrow`
- Produces:
  - `sheetProgress: MotionValue<number>`、`detailProgress: MotionValue<number>`（`app/composables/use-sheet.ts` のモジュールで1つずつ。`motion` の `motionValue(…)`）
  - `useSheet(): { shownRoute: ShallowRef<RouteLocationNormalizedLoaded | null>; startDrag: (e: PointerEvent) => void; scrollEl: Ref<HTMLElement | undefined> }`
  - 状態: `"open" | "switching" | "closing" | "closed"`。経路の変化への反応は下の表のとおり

| 今の状態         | 新しい経路                     | すること                                                                                                                                                   |
| ---------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| open / switching | Hello                          | 閉じる（`springTo(sheetProgress, 0)`、終わったら `shownRoute = null`）                                                                                     |
| closed / closing | Hello 以外                     | `shownRoute` を新しい経路にして開く（今の速さのまま `springTo(…, 1)`）                                                                                     |
| open             | 別のタブ（`sectionOf` が違う） | 入れ替え: `pending` に新しい経路を置き、`springTo(…, 0)`。値が `SWAP_AT` 以下になったら `shownRoute = pending`、スクロールを一番上に戻し、`springTo(…, 1)` |
| switching        | どこか（Hello 以外）           | `pending` だけを置き換える                                                                                                                                 |
| open             | 同じタブの中                   | `shownRoute` を置き換えるだけ（動かさない）                                                                                                                |

- `uaTransition.skip` のときは、どの動きも値を `jump` で最終位置に置く。
- `useReducedMotion()` のときは `springTo(…, { reduced: true })`。入れ替えはしまわずに、`SWAP_OUT_MS` で消えて `SWAP_IN_MS` で現れる（パソコンと同じ）。
- 取っ手と大見出しの段で `startDrag`。離したら `shouldClose` で閉じる（`springTo(sheetProgress, 0, { velocity: -velocityPx / height })` と `closeAction(history.state.back, localizePath("/", locale))` に従って `router.back()` か `router.replace(…)`）か戻る。
- シートの `transform` は `useNarrow()` が真のときだけ付ける（`translateY((1 - p) * 100%)`）。パソコンでは付けない。
- 要素の大きさは、Motion の部品の参照ではなくその要素から測る（`ref` が部品を指すときは `$el`）。
- パソコン（と「減らす設定」）: `NuxtPage` を `<Transition name="swap" mode="out-in">` で包む（`SWAP_OUT_MS` で消え、`SWAP_IN_OFFSET_PX` 下から `SWAP_IN_MS` で現れる、`var(--ut-ease-out)`）。スマホでは `name` を外す（シートが動くので）。`WorksList` の分類の入れ替えは、幅によらず `swap`。

- [ ] **Step 1: 失敗するテストを書く**

`use-sheet.test.ts` は、経路を差し替えられる小さな偽のルーターと、値を即座に動かす `springTo` の差し替え（`vi.mock("../motion/progress")`）で、状態の移り変わりを確かめる:

```ts
test("switching tabs stows, swaps once below SWAP_AT, then rises", async () => {
  /* open on /ja/about → push /ja/works/apps → shownRoute stays about until progress ≤ 0.03, then becomes works and target is 1 */
});
test("tapping two tabs while stowed swaps only to the last one", async () => {
  /* push /ja/works/apps then /ja/press during switching → one swap, to press */
});
test("a tab tapped while closing reopens from the current speed", async () => {
  /* closing → push /ja/about → springTo called with to=1 and no velocity override */
});
test("moving inside Works does not move the sheet", async () => {
  /* /ja/works/apps → /ja/works/apps/coto2-ba → springTo not called */
});
test("Safari's own back swipe jumps instead of animating", async () => {
  /* uaTransition.skip = true → value jumped */
});
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `vp test apps/web/app/composables/use-sheet.test.ts`
Expected: FAIL

- [ ] **Step 3: `useSheet` を書き、`app.vue` と `SheetFrame.vue` につなぐ**

- [ ] **Step 4: 通ることを確かめる**

Run: `vp test apps/web/app/composables/use-sheet.test.ts && pnpm --filter @ut42tech/web build && vp test apps/web`
Expected: PASS

- [ ] **Step 5: ブラウザで数値を取る**

`pnpm --filter @ut42tech/web preview` で開き、Chrome の 390×844（スマホ）で次を測る（試作と同じやり方: `requestAnimationFrame` ごとにシートの `transform` を読む）。

- Hello → Works: 行き過ぎ 0px、止まる瞬間の飛び 1px 未満
- Works → About: 中身が入れ替わるのはシートが 97% 以上しまわれたあと。入れ替わりは1回
- 1280px の幅でタブを移る: シートに `transform` が付かない

- [ ] **Step 6: コミット**

```bash
git add -A apps/web
git commit -m "feat(web): move the sheet with springs that follow the finger"
```

---

### Task 9: 詳細の動き（スマホ）

**Files:**

- Modify: `app/pages/[locale]/works/[category].vue`、`app/components/AppDetail.vue`、`app/components/SheetFrame.vue`（奥へ下がる量を `detailProgress` から）
- Test: `app/composables/use-detail.test.ts`
- Create: `app/composables/use-detail.ts`

**Interfaces:**

- Consumes: `detailProgress`、`springTo`、`dragProgress`、`shouldClose`、`closeAction`、`uaTransition`、`RECEDE`、`applySheetMode`
- Produces:
  - `useDetail(slug: ComputedRef<string | undefined>): { shown: ShallowRef<Localized<WorkEntry<"apps">> | null>; startDrag: (e: PointerEvent) => void; close: () => void }`
  - 状態: `"open" | "closing" | "closed"`。`slug` が来たら開く（`shown` を置いて `springTo(detailProgress, 1)`）。`slug` が消えたら、開いていれば閉じる動きのあとに `shown = null`。自分で閉じる（払う、隠しボタン、Esc（`<dialog>` の `cancel` を止めて同じ処理））ときは、先に閉じる動きを始めてから `closeAction(history.state.back, 一覧の URL)` に従って戻るか置き換える
  - 直接開いた（共有リンク）ときは、`detailProgress` を 1 から始める（最初の描画から開いた状態。設計書 7 章）
  - 裏のシート: `scale = 1 - (2 * RECEDE.insetPx / 画面の幅) * clamp(p)`、`translateY = -RECEDE.liftPx * clamp(p)`、`scrim` の不透明度 = `clamp(p)`（`clamp` は 0〜1）。スマホのときだけ
  - 取っ手と詳細の画像の部分で `startDrag`（`touch-action: none`）
  - `useReducedMotion()` のときは `springTo(…, { reduced: true })`（Task 8 と同じ）

- [ ] **Step 1: 失敗するテストを書く**

```ts
test("a shared link starts fully open without animating", () => {
  /* initial slug → detailProgress === 1, springTo not called */
});
test("closing by swipe goes back to the list it came from", () => {
  /* history.state.back = list → router.back called once, no push */
});
test("closing a shared link replaces the entry with the list", () => {
  /* history.state.back = null → router.replace(list) */
});
test("the browser back button plays the same close", () => {
  /* slug → undefined while open → springTo(detailProgress, 0) then shown = null */
});
test("Escape closes through the same path", () => {
  /* dialog cancel event → preventDefault + close */
});
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `vp test apps/web/app/composables/use-detail.test.ts`
Expected: FAIL

- [ ] **Step 3: 書いてつなぐ**

- [ ] **Step 4: 通ることを確かめる**

Run: `vp test apps/web/app/composables && pnpm --filter @ut42tech/web build && vp test apps/web`
Expected: PASS

- [ ] **Step 5: ブラウザで確かめる**

Chrome の 390×844 で:

- カードを押す: 詳細がシート1枚で上がり、カードのサムネイルは見えたまま。裏のシートが `scale(…)` と `translateY(-10px)` まで下がる
- 取っ手を速く払う（4フレームで 120px）: 閉じて一覧へ。`history.length` が増えない
- ゆっくり 60px 引いて離す: 戻る
- 詳細を開いたまま 1280px にする: `<dialog>` がモーダルでなくなり、`transform` が残らない

- [ ] **Step 6: コミット**

```bash
git add -A apps/web
git commit -m "feat(web): open and close the app detail as one sheet that follows the finger"
```

---

### Task 10: 仕上げ（守りのテスト、Vercel、資料）

**Files:**

- Modify: `apps/web/test/no-hardcode.test.ts`（対象を `app/` に。部品は `app/components`、`app/pages`、`app/app.vue`、`app/error.vue`。拡張子は `.vue` と `.ts`）、`apps/web/vercel.json`、`README.md`（`apps/web` の構成と使い方）、`docs/handoff.md`、`docs/superpowers/specs/2026-11-16-monorepo-foundation-design.md`（`apps/web` の行を Nuxt 4 + Vue に）
- Create: `apps/web/test/layers.test.ts`

**Interfaces:**

- Consumes: すべて

- [ ] **Step 1: 層の決まりのテストを書く**

```ts
test("app/motion stays free of Vue, Nuxt and motion-v", () => {
  for (const file of filesUnder("app/motion")) {
    const source = readFileSync(file, "utf8");
    expect(source, file).not.toMatch(/from ["'](vue|nuxt|#app|#imports|motion-v)/);
  }
});
```

- [ ] **Step 2: `no-hardcode.test.ts` の対象を直し、通ることを確かめる**

Run: `pnpm --filter @ut42tech/web build && vp test`
Expected: すべて PASS（違反が見つかったら部品を直す）

- [ ] **Step 3: `vercel.json` に書き出しの設定を足す**

`"framework": "nuxtjs"`、`"buildCommand": "nuxt generate"`。今の `redirects` はそのまま。

- [ ] **Step 4: プレビューで確かめる**

ブランチを push し、Vercel のプレビューで次を確かめる。

- `/` → `/ja/`
- `/ja/works` → `/ja/works/apps`
- `/nope` が 404 のページ
- 詳細の URL を直接開ける
- 画像が出る

- [ ] **Step 5: 資料を直す**

README の `apps/web` の節（ページと URL、中身の足し方（`content/` と `public/works/`）、`vp` の使い方、`src/pages/index.astro` の記述）を Nuxt に合わせる。`docs/handoff.md` に段階1の完了と、段階2（設計書 8.7、8.8）が次であることを書く。

- [ ] **Step 6: 全体の検査**

Run: `vp run check && pnpm --filter @ut42tech/web build && vp test`
Expected: エラーなし、すべて PASS

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "chore(web): guard the layers, deploy Nuxt on Vercel and update the docs"
```
