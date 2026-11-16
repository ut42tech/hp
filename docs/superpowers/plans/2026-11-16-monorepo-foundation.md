# ut42tech monorepo 土台 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pnpm + Vite+ の monorepo を作り、共有パッケージ（config / profile / tokens / assets）と `apps/web`（Astro 7 + Vue + Tailwind v4）の雛形を Vercel の新プロジェクト `hp-v2` のプレビューで表示できる状態にする。

**Architecture:** リポジトリ全体の層（タスク実行・キャッシュ・Lint・整形・テスト）は Vite+ がルートの `vite.config.ts` 1枚で担当し、アプリの層（dev / build）は Astro の CLI を `vp run` から呼ぶ。共有パッケージはビルドせず、ソース（TS / CSS / 画像）を `exports` で直接公開する。

**Tech Stack:** Node 24 / pnpm 12 / Vite+ 1.6（Oxlint, Oxfmt, Vitest 5）/ TypeScript 6 / Astro 7 / Vue 3.5 / Tailwind CSS 4.3 / Vercel / GitHub Actions

**Spec:** `docs/superpowers/specs/2026-11-16-monorepo-foundation-design.md`

## Global Constraints

- Node: `.node-version` に `24`。
- パッケージマネージャー: ルート `package.json` の `"packageManager": "pnpm@12.21.0"`。
- 依存バージョン（2026-11-16 時点の最新安定版）: `vite-plus@^1.6.0`, `astro@^7.4.12`, `@astrojs/vue@^7.1.6`, `vue@^3.5.45`, `tailwindcss@^4.3.5`, `@tailwindcss/vite@^4.3.5`, `@astrojs/check@^0.9.12`, `vue-tsc@^3.3.14`, `@astrojs/compiler-rs@^0.5.3`。
- **TypeScript は `^6.0.3`（7 ではない）**。`@astrojs/check` の peerDependency が `^5 || ^6` のため。
- パッケージ名は `@ut42tech/<name>`、すべて `"private": true`, `"type": "module"`。内部依存は `workspace:*`。
- 共有パッケージはビルド手順を持たない。`exports` はソースファイルを直接指す。
- `@ut42tech/profile` はランタイム依存ゼロ。DOM・Vite・Astro・Vue の型も import しない。
- `apps/web` に `vite.config.ts` を置かない。Astro は `vp run` 経由で `astro dev` / `astro build` を呼ぶ（`vp dev` / `vp build` は Vite+ が Astro プロジェクトでは拒否する）。
- Lint / 整形の設定はルート `vite.config.ts` の `lint` / `fmt` のみ。`.oxlintrc.json`、`.prettierrc` などは作らない。
- ルート `package.json` に `build` / `test` / `typecheck` スクリプトを置かない（`vp run -r` の再帰呼び出しを避けるため）。ワークスペース全体の実行は `vp run -r --cache <task>` で行う。
- **`ut42tech.com` のドメイン設定には一切触れない。** 既存プロジェクト `hp` の改名は、直前に本人の明示的な承認を得てから行う。
- 作業ブランチは `feat/monorepo-foundation`。`main` へのマージは本人が行う。

## Review Focus

1. **ダークモードのトークン漏れ**: ライトに定義した色がダーク（`prefers-color-scheme` と `[data-theme="dark"]` の両方）に無いと、ダーク時だけ色が抜ける → Task 3 のテストで3ブロックの変数名集合が一致することを固定する。
2. **localStorage が使えない環境**（プライベートモード、ストレージ無効）: テーマ切り替えが例外で落ちず、OS 設定に従って動き続けること → Task 4 のテストで `getItem` / `setItem` が throw するケースを固定する。
3. **JS 無効・JS 読み込み前の表示**: 名前・モットー・SNS リンクが静的 HTML に含まれ、初回表示でテーマがちらつかないこと → Task 4 でビルド後の `dist/index.html` を検査する。
4. **クリーンな環境でのインストール**: lockfile と `packageManager` が一致しないと CI / Vercel で install が落ちる → Task 5 の CI（frozen lockfile）と Task 6 の Vercel ビルドで確認する。
5. **Vercel が Root Directory 外の `packages/*` を解決できること**: 「Include files outside the root directory」が無効だとビルドが落ちる → Task 6 でプレビューのビルド成功と表示内容を確認する。

---

### Task 1: ワークスペースのルートとツールチェーン

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `.node-version`, `.gitignore`, `vite.config.ts`
- Create: `packages/config/package.json`, `packages/config/tsconfig.base.json`

**Interfaces:**
- Produces: `@ut42tech/config/tsconfig.base.json`（各パッケージが `"extends": "@ut42tech/config/tsconfig.base.json"` で使う）。ルートスクリプト `check` と `dev`。

- [ ] **Step 1: 作業ブランチを作る**

Run: `git switch -c feat/monorepo-foundation`

- [ ] **Step 2: ルートファイルを作る**

- `package.json`: `"name": "ut42tech-hp"`, `"private": true`, `"type": "module"`, `"packageManager": "pnpm@12.21.0"`, `"engines": { "node": ">=24" }`。scripts は次の2つだけ:
  - `"dev": "vp run @ut42tech/web#dev"`
  - `"check": "vp check && vp run -r --cache typecheck"`
  - devDependencies: `vite-plus`, `typescript`, `@astrojs/compiler-rs`（Global Constraints のバージョン）
- `pnpm-workspace.yaml`: `packages: ["apps/*", "packages/*"]`
- `.node-version`: `24`
- `.gitignore`: `node_modules/`, `dist/`, `.astro/`, `.vercel/`, `.env*`（`!.env.example` は除外しない）, `*.log`, `.DS_Store`

- [ ] **Step 3: `vite.config.ts` を作る**

`import { defineConfig } from 'vite-plus'` で次を設定する:
- `lint`: `plugins: ['typescript', 'vue']`, `options: { typeAware: true, typeCheck: true }`, `ignorePatterns: ['**/dist/**', '**/.astro/**', '**/.vercel/**']`
- `fmt`: `astro: true`, `ignorePatterns` は lint と同じ（キー名は Oxfmt の設定リファレンスに従う）
- `run`: 設定しない（キャッシュはコマンドの `--cache` で明示する）

- [ ] **Step 4: `packages/config` を作る**

- `package.json`: `name: "@ut42tech/config"`, `exports: { "./tsconfig.base.json": "./tsconfig.base.json" }`
- `tsconfig.base.json` の `compilerOptions`: `strict: true`, `target: "ES2023"`, `module: "ESNext"`, `moduleResolution: "Bundler"`, `verbatimModuleSyntax: true`, `isolatedModules: true`, `noEmit: true`, `skipLibCheck: true`, `noUncheckedIndexedAccess: true`, `resolveJsonModule: true`

- [ ] **Step 5: インストールと検査が通ることを確認する**

Run: `vp install && vp check`
Expected: install が成功し `pnpm-lock.yaml` が作られる。`vp check` がエラー 0 で終わる。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: set up pnpm workspace with Vite+ toolchain"
```

---

### Task 2: `@ut42tech/profile`

**Files:**
- Create: `packages/profile/package.json`, `packages/profile/tsconfig.json`, `packages/profile/src/index.ts`, `packages/profile/src/types.ts`, `packages/profile/src/profile.ts`
- Test: `packages/profile/src/profile.test.ts`

**Interfaces:**
- Consumes: `@ut42tech/config/tsconfig.base.json`
- Produces（`@ut42tech/profile` から export）:
  - `type SocialIcon = 'x' | 'github' | 'qiita' | 'zenn' | 'note' | 'youtube' | 'wantedly'`
  - `interface SocialLink { label: string; href: string; icon: SocialIcon }`
  - `interface Profile { name: string; handle: string; roleTags: string[]; affiliation: { role: string; school: string }; motto: string; mottoEn: string; social: SocialLink[] }`
  - `const profile: Profile`

- [ ] **Step 1: パッケージの枠を作る**

`package.json`: `name: "@ut42tech/profile"`, `exports: { ".": "./src/index.ts" }`, scripts `"typecheck": "tsc --noEmit"`, `"test": "vp test run"`、devDependencies に `@ut42tech/config: "workspace:*"`。dependencies は空。`tsconfig.json` は base を extends し `include: ["src"]`。

- [ ] **Step 2: 失敗するテストを書く**（`src/profile.test.ts`）

```ts
import { describe, expect, test } from 'vitest'
import { profile } from './index'

describe('profile', () => {
  test('identity', () => {
    expect(profile.name).toBe('Takuya Uehara')
    expect(profile.handle).toBe('ut42tech')
    expect(profile.motto).toBe('デザインとテクノロジーで、最高のユーザ体験を届けたい。')
    expect(profile.mottoEn).toBe('Delivering the best experiences with design & technology.')
  })
  test('social links are https and unique per icon', () => {
    expect(profile.social.length).toBe(7)
    for (const link of profile.social) expect(new URL(link.href).protocol).toBe('https:')
    expect(new Set(profile.social.map((l) => l.icon)).size).toBe(profile.social.length)
  })
})
```

- [ ] **Step 3: テストが失敗することを確認する**

Run: `vp run @ut42tech/profile#test`
Expected: FAIL（`./index` が存在しない）

- [ ] **Step 4: 型とデータを実装する**

`types.ts` に Interfaces の型、`profile.ts` にデータ、`index.ts` で両方を re-export する。データの値（旧サイト `ut42tech/hp-v1` の `src/content/profile.ts` から転記）:
- `roleTags`: `['学生エンジニア', 'フルスタック', 'デザイン', 'INFJ']`
- `affiliation`: `{ role: "Master's Student", school: 'Nagasaki University' }`
- `social`（この順）: X `https://x.com/ut42tech` / GitHub `https://github.com/ut42tech` / Qiita `https://qiita.com/ut42tech` / Zenn `https://zenn.dev/ut42tech` / note `https://note.com/ut42tech` / YouTube `https://www.youtube.com/@ut42tech` / Wantedly `https://www.wantedly.com/id/tuehara`

- [ ] **Step 5: テストと型チェックが通ることを確認する**

Run: `vp run @ut42tech/profile#test && vp run @ut42tech/profile#typecheck && vp check`
Expected: PASS、エラー 0

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(profile): add shared profile data package"
```

---

### Task 3: `@ut42tech/tokens` と `@ut42tech/assets`

**Files:**
- Create: `packages/tokens/package.json`, `packages/tokens/tokens.css`, `packages/tokens/theme.css`
- Test: `packages/tokens/tokens.test.ts`
- Create: `packages/assets/package.json`, `packages/assets/favicon.ico`, `packages/assets/profile.jpg`
- Test: `packages/assets/assets.test.ts`

**Interfaces:**
- Produces:
  - `@ut42tech/tokens/tokens.css`: CSS 変数 `--ut-color-bg`, `--ut-color-fg`, `--ut-color-muted`, `--ut-color-accent`, `--ut-color-border`, `--ut-font-sans`, `--ut-font-mono`, `--ut-radius`
  - `@ut42tech/tokens/theme.css`: `tokens.css` を import し、Tailwind ユーティリティ `bg-bg`, `text-fg`, `text-muted`, `text-accent`, `border-border`, `font-sans`, `font-mono`, `rounded-ut` を生む
  - `@ut42tech/assets/favicon.ico`, `@ut42tech/assets/profile.jpg`

- [ ] **Step 1: 失敗するテストを書く**

`packages/tokens/tokens.test.ts`（`node:fs` で CSS を文字列として読む）:
- `test('dark mode defines every light color token')`: `:root { … }`（最初のブロック）、`@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }`、`:root[data-theme="dark"] { … }` の3ブロックから `--ut-color-*` の名前を抽出し、3つの集合が等しく、かつ 5 個であることを assert する。
- `test('theme.css maps every color token')`: `theme.css` の `@theme inline { … }` に、各 `--ut-color-X` に対応する `--color-X: var(--ut-color-X)` が存在することを assert する。

`packages/assets/assets.test.ts`:
- `test('every export points to an existing file')`: `package.json` の `exports` の各値について `existsSync` が true。

- [ ] **Step 2: テストが失敗することを確認する**

Run: `vp run -r test`
Expected: tokens と assets のテストが FAIL（ファイルがない）

- [ ] **Step 3: `tokens.css` を実装する**

プレースホルダー値（最終値はデザインの設計で決める）:

| 変数 | light | dark |
|---|---|---|
| `--ut-color-bg` | `#ffffff` | `#0a0a0a` |
| `--ut-color-fg` | `#0a0a0a` | `#fafafa` |
| `--ut-color-muted` | `#6b7280` | `#9ca3af` |
| `--ut-color-accent` | `#2563eb` | `#60a5fa` |
| `--ut-color-border` | `#e5e7eb` | `#27272a` |

`--ut-font-sans: system-ui, -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif`、`--ut-font-mono: ui-monospace, SFMono-Regular, Menlo, monospace`、`--ut-radius: 0.5rem`（`:root` のみ）。`:root` に `color-scheme: light dark`、ダークの2ブロックに `color-scheme: dark` を付ける。

- [ ] **Step 4: `theme.css` を実装する**

先頭に `@import "./tokens.css";`、続けて **`@theme inline`**（実行時に CSS 変数を参照させ、テーマ切り替えで色が変わるようにするため）で `--color-bg` などの5色、`--font-sans`、`--font-mono`、`--radius-ut` を `var(--ut-…)` に対応付ける。`package.json`: `name: "@ut42tech/tokens"`, `exports: { "./tokens.css": "./tokens.css", "./theme.css": "./theme.css" }`, `"test": "vp test run"`。

- [ ] **Step 5: `assets` を実装する**

旧サイトから `src/app/favicon.ico` と `public/profile.jpg` をコピーする（`git clone --depth 1 https://github.com/ut42tech/hp-v1` を scratch に取得）。`package.json`: `name: "@ut42tech/assets"`, `exports: { "./favicon.ico": "./favicon.ico", "./profile.jpg": "./profile.jpg" }`, `"test": "vp test run"`。

- [ ] **Step 6: テストが通ることを確認する**

Run: `vp run -r test && vp check`
Expected: PASS、エラー 0

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add shared design tokens and assets packages"
```

---

### Task 4: `apps/web`（Astro 7 + Vue + Tailwind v4）

**Files:**
- Create: `apps/web/package.json`, `apps/web/astro.config.mjs`, `apps/web/tsconfig.json`
- Create: `apps/web/src/styles/global.css`, `apps/web/src/layouts/Base.astro`, `apps/web/src/pages/index.astro`
- Create: `apps/web/src/lib/theme.ts`, `apps/web/src/components/ThemeToggle.vue`
- Test: `apps/web/src/lib/theme.test.ts`, `apps/web/test/build-output.test.ts`

**Interfaces:**
- Consumes: `profile` / `Profile`（Task 2）、`@ut42tech/tokens/theme.css`（Task 3）、`@ut42tech/assets/favicon.ico`（Task 3）
- Produces（`src/lib/theme.ts`）:
  - `type Theme = 'light' | 'dark'`
  - `const THEME_STORAGE_KEY = 'ut42tech:theme'`
  - `readStoredTheme(storage: Pick<Storage, 'getItem'> | undefined): Theme | null` — 未設定・不正値・throw のときは `null`
  - `resolveTheme(stored: Theme | null, prefersDark: boolean): Theme`
  - `storeTheme(storage: Pick<Storage, 'setItem'> | undefined, theme: Theme): void` — throw は握りつぶす

- [ ] **Step 1: パッケージの枠を作る**

`package.json`: `name: "@ut42tech/web"`。dependencies: `astro`, `@astrojs/vue`, `vue`, `tailwindcss`, `@tailwindcss/vite`, `@ut42tech/profile`, `@ut42tech/tokens`, `@ut42tech/assets`（内部は `workspace:*`）。devDependencies: `@astrojs/check`, `vue-tsc`, `typescript`, `@ut42tech/config`。scripts:
- `"dev": "astro dev"`, `"build": "astro build"`, `"preview": "astro preview"`
- `"typecheck": "astro check && vue-tsc --noEmit"`
- `"test": "vp test run"`

`astro.config.mjs`: `site: 'https://ut42tech.com'`, `output: 'static'`, `integrations: [vue()]`, `vite: { plugins: [tailwindcss()] }`。`tsconfig.json`: `astro/tsconfigs/strict` を extends（Astro の推奨）し、`include: [".astro/types.d.ts", "src", "test"]`。

- [ ] **Step 2: `theme.ts` の失敗するテストを書く**（`src/lib/theme.test.ts`）

```ts
const throwing = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('denied') } }

test('readStoredTheme returns null when storage throws', () => expect(readStoredTheme(throwing)).toBeNull())
test('readStoredTheme returns null for unknown values', () => expect(readStoredTheme({ getItem: () => 'sepia' })).toBeNull())
test('readStoredTheme returns null without storage', () => expect(readStoredTheme(undefined)).toBeNull())
test('stored theme wins over system preference', () => expect(resolveTheme('light', true)).toBe('light'))
test('falls back to system preference', () => {
  expect(resolveTheme(null, true)).toBe('dark')
  expect(resolveTheme(null, false)).toBe('light')
})
test('storeTheme swallows storage errors', () => expect(() => storeTheme(throwing, 'dark')).not.toThrow())
```

- [ ] **Step 3: テストが失敗することを確認する**

Run: `vp run @ut42tech/web#test`
Expected: FAIL（`./theme` が存在しない）。もし Vite+ が Astro プロジェクトで `vp test` を拒否した場合は、scripts の `test` を `vp exec vitest run` に変えて再実行する。

- [ ] **Step 4: `theme.ts` を実装し、テストが通ることを確認する**

Run: `vp run @ut42tech/web#test`
Expected: PASS

- [ ] **Step 5: 画面を実装する**

- `src/styles/global.css`: `@import "tailwindcss";` → `@import "@ut42tech/tokens/theme.css";`。`body` に `bg-bg text-fg font-sans` を `@layer base` で当てる。
- `Base.astro`: `<html lang="ja">`。`<head>` に charset、viewport、`<title>{profile.name}</title>`、`description` と `og:description` に `profile.mottoEn`、`og:title` に `profile.name`、`og:type` に `website`、favicon は `import faviconUrl from '@ut42tech/assets/favicon.ico?url'` で `<link rel="icon">`。**`<script is:inline>`** で `localStorage` の `ut42tech:theme`（try/catch 付き）と `matchMedia('(prefers-color-scheme: dark)')` から `document.documentElement.dataset.theme` を描画前に設定する（`theme.ts` とキー・判定を揃える旨をコメントに書く）。
- `index.astro`: `Base` の中に、`profile.name`（h1）、`profile.motto`、`profile.mottoEn`、`profile.social` のリンク一覧（`<a href rel="me noopener">`）、`<ThemeToggle client:load />`。
- `ThemeToggle.vue`: `<script setup lang="ts">`。`theme.ts` の関数で現在のテーマを決め、クリックで切り替えて `documentElement.dataset.theme` と `storeTheme` を更新する。ボタンには `aria-label` と `aria-pressed` を付ける。

- [ ] **Step 6: ビルド結果を検査するテストを書く**（`test/build-output.test.ts`）

`dist/index.html` を読み、次を assert する: `lang="ja"` を含む / `Takuya Uehara` を含む / `profile.motto` を含む / `profile.social` の全 `href` を含む / `ut42tech:theme` を含む（インラインのテーマ初期化）/ `<link rel="icon"` を含む。`dist/index.html` が無いときは「先に build を実行すること」というメッセージで失敗させる。

- [ ] **Step 7: ビルド・テスト・型チェックを通す**

Run: `vp run @ut42tech/web#build && vp run @ut42tech/web#test && vp run check`
Expected: build 成功、テスト PASS、`astro check` / `vue-tsc` / `vp check` すべてエラー 0

- [ ] **Step 8: 開発サーバーで目視確認する**

Run: `vp run dev`（ルートの `dev`）→ `http://localhost:4321` を開く
Expected: 名前・モットー・SNS リンクが表示される。トグルでライト / ダークが切り替わり、リロード後も維持される。

- [ ] **Step 9: キャッシュが効くことを確認する**

Run: `vp run -r --cache build` を2回続けて実行する
Expected: 2回目に `cache hit` が表示され、`@ut42tech/web#build` がスキップされる（設計書の完了条件 3）。

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(web): scaffold Astro app with shared tokens and profile"
```

---

### Task 5: CI と README

**Files:**
- Create: `.github/workflows/ci.yml`, `README.md`

**Interfaces:**
- Consumes: ルートスクリプト `check`（Task 1）、各パッケージの `build` / `test`（Task 2〜4）

- [ ] **Step 1: CI を書く**

`on: pull_request` と `push: branches: [main]`。job は `ubuntu-latest` で:
1. `actions/checkout`（バージョンはタグではなく commit SHA で固定）
2. `voidzero-dev/setup-vp@v1.22.0` を `with: { node-version-file: '.node-version', cache: true }`（既定で `vp install` が走る）
3. `vp run -r --cache build`
4. `vp run check`
5. `vp run -r --cache test`（build-output テストが build の後に走る順序にする）

- [ ] **Step 2: README を書く**

次の節を持つ: 構成（apps / packages の表と各サブドメイン）、前提（Node 24、`vp` のインストール方法）、コマンド（`vp install` / `vp run dev` / `vp run -r --cache build` / `vp run check` / `vp run -r --cache test`）、新しいアプリの追加手順（`apps/<name>` を作る → `@ut42tech/*` を `workspace:*` で依存 → `dev` / `build` / `typecheck` / `test` スクリプトを揃える → Vercel プロジェクト作成）、サブドメインの追加手順（Vercel プロジェクトを作り Root Directory を設定 → Vercel でドメイン追加 → Cloudflare に CNAME を追加し、プロキシはオフ（DNS only））、ツール選定の注記（Oxlint はテンプレートを Lint しないため `astro check` と `vue-tsc` で補っていること、TypeScript を 6 に留めている理由）。

- [ ] **Step 3: CI 相当をローカルで確認する**

Run: `rm -rf node_modules apps/*/node_modules packages/*/node_modules && vp install --frozen-lockfile && vp run -r --cache build && vp run check && vp run -r --cache test`
Expected: すべて成功

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "ci: add GitHub Actions workflow and README"
```

---

### Task 6: Vercel（`hp` → `hp-v1` の改名、`hp-v2` の作成、プレビュー確認）

チーム ID: `team_6LT6tsacpcMwKgPjGEyfIcP6`（`takuya-ueharas-projects`）。Vercel MCP の `list_projects` はこのチームで空を返したため、**Vercel CLI（`vercel api`）を使う**。

- [ ] **Step 1: 改名前の状態を記録する**

Run: `vercel api "/v9/projects/hp?teamId=team_6LT6tsacpcMwKgPjGEyfIcP6"` で `id` と `link.repo`（`hp-v1` であること）を、`vercel api "/v4/aliases?projectId=<id>&teamId=team_6LT6tsacpcMwKgPjGEyfIcP6"` でエイリアス一覧を取得し、`curl -sI https://ut42tech.com` が `200` であることを確認する。

- [ ] **Step 2: 本人の承認を取る（ここで停止）**

エイリアス一覧（特に `*.vercel.app`）を本人に見せ、「`hp` を `hp-v1` に改名する。`ut42tech.com` には影響せず、変わるのは `*.vercel.app` のエイリアスとダッシュボードの URL」と伝えて、明示的な承認を得る。承認が無ければ改名をせず Step 4 に進む（その場合、新プロジェクト名は本人に確認する）。

- [ ] **Step 3: 改名して本番を確認する**

Run: `vercel api "/v9/projects/hp?teamId=team_6LT6tsacpcMwKgPjGEyfIcP6" -X PATCH --input <{"name":"hp-v1"} の JSON ファイル>` → `curl -sI https://ut42tech.com`
Expected: レスポンスの `name` が `hp-v1`。`ut42tech.com` が引き続き `200`。

- [ ] **Step 4: `hp-v2` を作る**

`POST /v11/projects?teamId=…` に `{"name":"hp-v2","framework":"astro","rootDirectory":"apps/web","gitRepository":{"type":"github","repo":"ut42tech/hp"}}`。続けて `PATCH /v9/projects/hp-v2?teamId=…` で `{"nodeVersion":"24.x","enableAffectedProjectsDeployments":true}` を設定し、`POST /v10/projects/hp-v2/env?teamId=…` で `ENABLE_EXPERIMENTAL_COREPACK=1`（type `plain`、target は production / preview / development）を追加する（`packageManager` の pnpm バージョンを Vercel に守らせるため）。
Expected: `GET /v9/projects/hp-v2` で `rootDirectory: "apps/web"`、`link.repo: "hp"`、`framework: "astro"`、`nodeVersion: "24.x"` を確認できる。「Include files outside the root directory」が有効（`sourceFilesOutsideRootDirectory: true`）であることも確認し、無効なら PATCH で有効にする。

- [ ] **Step 5: ブランチを push して PR を開く**

Run: `git push -u origin feat/monorepo-foundation` → `gh pr create`（タイトル `Set up monorepo foundation`、本文に設計書と計画へのリンク、完了条件のチェックリスト、末尾に `🤖 Generated with [Claude Code](https://claude.com/claude-code)`）
Expected: CI が緑になる。Vercel の `hp-v2` のプレビューデプロイが PR に付く。

- [ ] **Step 6: プレビューを確認する**

Run: `vercel inspect <preview-url>` でビルド成功（`READY`）を確認し、`vercel curl <preview-url>`（プレビューは Deployment Protection で保護されているため）で HTML を取得する。
Expected: HTML に `Takuya Uehara` と SNS リンクが含まれる。最後にもう一度 `curl -sI https://ut42tech.com` が `200`。

- [ ] **Step 7: 本人に報告する**

PR の URL、プレビュー URL、`hp-v1` への改名結果、`ut42tech.com` が無事であることを報告する。`main` へのマージは本人に任せる。
