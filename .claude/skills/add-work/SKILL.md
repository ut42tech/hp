---
name: add-work
description: Scaffold a new portfolio Work entry (project / OSS / research / experience) in src/content/works.ts. Use when adding a new item to the Works data for the ut42tech/hp portfolio.
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Bash
---

# add-work

Add a new entry to the portfolio's **Works** data. Every Work is a typed object literal
appended to the `works: Work[]` array in `src/content/works.ts`. There is **no per-slug
page to create** — the detail route and list page are intentionally stubbed (see Notes).

## Before you start

Read `src/content/types.ts` and conform **exactly** to the `Work` interface — the build
relies on these string unions, so a typo fails `pnpm lint`/the typecheck:

- `slug: string` — URL-safe, kebab-case, **must be unique** (see Notes for why).
- `category: "project" | "oss" | "research" | "experience"`
- `title: string`, `summary: string` — Japanese copy, matching existing entries.
- `body?: string[]` — optional. **Plain-text paragraphs**, one string per paragraph.
  No Markdown (there is no Markdown parser; line breaks come from the array).
- `date: string` — `YYYY-MM-DD`.
- `tags: string[]`
- `thumbnail?: string` — optional `public/`-relative path, e.g. `/photos/foo.jpg`.
- `links: WorkLink[]` — each `{ label, href, kind }`, where
  `kind: "github" | "demo" | "paper" | "slide" | "article" | "other"`. Use `[]` if none.
- `featured?: boolean` — `true` surfaces it on the Bento home **Featured** tile
  (consumed by `getFeaturedWorks()`).

## Steps

1. Gather (ask the user, or infer from context): slug, category, title, summary,
   optional `body` paragraphs, date, tags, links, and whether it's `featured`.
2. Open `src/content/works.ts`. Append the new object **inside the matching category
   block**, delimited by comments like `// ─── project ───`, `// ─── oss ───`,
   `// ─── research ───`, `// ─── experience ───`. Keep entries roughly newest-first by `date`.
3. Confirm the `slug` does not collide with any existing entry in the array.
4. If a `thumbnail` is supplied, place the image under `public/photos/` and point
   `thumbnail` at its `/photos/...` path.
5. Run `pnpm lint` (Biome — also organizes imports) and `pnpm format`. Fix any errors;
   a wrong `category` or link `kind` string will surface as a type error here.
6. Propose a Japanese conventional commit, e.g. `feat: <title> を Works に追加`.
   **Do not commit without the user's go-ahead.**

## Example entry

```ts
{
  slug: "my-new-app",
  category: "project",
  title: "My New App",
  summary: "ハッカソンで開発した〇〇なアプリ。",
  body: [
    "1 段落目の説明文。",
    "2 段落目の説明文。",
  ],
  date: "2026-06-01",
  tags: ["Next.js", "Hackathon"],
  links: [
    { label: "GitHub", href: "https://github.com/ut42tech/my-new-app", kind: "github" },
    { label: "Demo", href: "https://my-new-app.example.com", kind: "demo" },
  ],
  featured: true,
}
```

## Notes / gotchas (verified against the repo)

- **Do not add a `src/app/works/[slug]/page.tsx` for the entry.** That route currently
  just `redirect("/works")`, and `src/app/works/page.tsx` renders
  `<UnderConstruction title="Works" />`. Adding a Work updates *data only*, not routing.
- The **only** per-slug consumer is `src/app/works/[slug]/opengraph-image.tsx`, whose
  `generateStaticParams()` maps over `works` to pre-render one OG image per slug. A
  duplicate or malformed slug breaks that static generation at build time.
- Gallery photos are a **separate** dataset (`PhotoEntry` in `src/content/gallery.ts`) —
  out of scope for this skill.
- The site is single-language (Japanese); keep `title` / `summary` / `body` in Japanese
  to match the convention notes in `types.ts`.
- Read-side helpers in the same file (`getWorkBySlug`, `getFeaturedWorks`,
  `getWorksByCategory`, `workCategories`) consume this array — you don't need to edit them.
