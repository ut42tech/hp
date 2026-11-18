import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";

const css = readFileSync(new URL("../app/assets/css/global.css", import.meta.url), "utf8");

// A transform on the page root would become the containing block for its fixed children (the Works
// sidebar), which then jump to their real place when the swap ends. The root only fades; its children rise.
test("the swap's rise moves the page's children, never the page root", () => {
  const rootFrom = css.match(/\.swap-enter-from \{([^}]*)\}/)?.[1] ?? "";
  expect(rootFrom).not.toMatch(/translate|transform/);
  expect(css).toMatch(/\.swap-enter-from > \* \{[^}]*translate: 0 8px/);
});

// The card's thumbnail is round only at the top, the detail image all round. The travelling frame changes
// between those shapes over the same 360ms, in the direction of the move, so nothing snaps at the end.
test("the travelling thumbnail turns its corners from one shape into the other", () => {
  const card = "var(--ut-radius-card) var(--ut-radius-card) 0 0";
  const pair = (direction: string) =>
    css.match(
      new RegExp(
        `:root\\[data-morph="${direction}"\\]::view-transition-image-pair\\(app-thumb\\) \\{([^}]*)\\}`,
      ),
    )?.[1] ?? "";
  expect(pair("open")).toMatch(/animation: thumb-corners-open 360ms/);
  expect(pair("close")).toMatch(/animation: thumb-corners-close 360ms/);
  expect(css).toMatch(
    new RegExp(
      `@keyframes thumb-corners-close \\{\\s*from \\{\\s*border-radius: var\\(--ut-radius-card\\);\\s*\\}\\s*to \\{\\s*border-radius: ${card.replace(/[()]/g, "\\$&")};`,
    ),
  );
});

// The marks slide as a compositor transform (app/motion/slide-mark.ts); Motion's JS-driven layout projection
// (layoutId) stalled while the next page rendered, so the mark stopped and then jumped, most visibly in Safari.
test.each(["components/SelectionMark.vue", "components/NavBar.vue", "components/WorksNav.vue"])(
  "%s does not use JS-driven layout animation",
  (file) => {
    const source = readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8");
    expect(source).not.toMatch(/layout-id|layoutId|LayoutGroup|layout-root/);
  },
);

// The header and the nav bar stay above everything during a view transition (the travelling thumbnail
// used to pass over the header, then drop under it when the transition ended).
test("the header and the nav bar sit above the travelling thumbnail", () => {
  for (const name of ["site-header", "nav-bar"]) {
    expect(css).toMatch(new RegExp(`::view-transition-group\\(${name}\\)[^{]*\\{[^}]*z-index`));
  }
  const header = readFileSync(new URL("../app/components/SiteHeader.vue", import.meta.url), "utf8");
  const nav = readFileSync(new URL("../app/components/NavBar.vue", import.meta.url), "utf8");
  expect(header).toContain("view-transition-name: site-header");
  expect(nav).toContain("view-transition-name: nav-bar");
});

test("the desktop header is a translucent, frosted layer", () => {
  const header = readFileSync(new URL("../app/components/SiteHeader.vue", import.meta.url), "utf8");
  expect(header).toMatch(
    /background: color-mix\(in srgb, var\(--ut-color-bg\) \d+%, transparent\)/,
  );
  expect(header).toContain("backdrop-filter");
});
