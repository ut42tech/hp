import { readdirSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { loadPage, readFrontmatter } from "./html";

const slugs = readdirSync(new URL("../content/apps/ja/", import.meta.url)).map((f) =>
  f.replace(/\.md$/, ""),
);

test.each(slugs)("/ja/works/apps/%s renders a readable detail without JS", (slug) => {
  const page = loadPage(`/ja/works/apps/${slug}`);
  const dialog = page.querySelector("dialog.app-detail")!;
  expect(dialog.hasAttribute("open")).toBe(true);
  expect(dialog.querySelector("h1")!.textContent.trim().length).toBeGreaterThan(0);
  expect(dialog.querySelectorAll('a[href="/ja/works/apps"]').length).toBe(2); // close and back
  expect(page.querySelectorAll("h1").length).toBe(1);
});

test("missing links are not rendered", () => {
  for (const slug of slugs) {
    const page = loadPage(`/ja/works/apps/${slug}`);
    const fm = readFrontmatter(`apps/ja/${slug}.md`);
    expect(page.querySelector('dialog a[data-link="demo"]') !== null, slug).toBe(Boolean(fm.demo));
    expect(page.querySelector('dialog a[data-link="github"]') !== null, slug).toBe(
      Boolean(fm.github),
    );
  }
});
