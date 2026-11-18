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

// The card's thumbnail is captured with square corners (the card clips it), the detail image with round ones;
// cross-fading the two made the corners vanish and snap back. The travelling frame clips both to the card radius.
test("the travelling thumbnail keeps rounded corners for the whole morph", () => {
  const group = css.match(/::view-transition-group\(app-thumb\) \{([^}]*)\}/)?.[1] ?? "";
  expect(group).toContain("border-radius: var(--ut-radius-card)");
  expect(group).toMatch(/overflow: (clip|hidden)/);
});

// Motion measures layout in page coordinates. Inside a fixed container (the nav bar, the desktop sidebar) a
// scroll change between measurements reads as movement, so the sliding mark starts from the wrong place
// unless the fixed container is marked as a layout root.
test.each([
  ["components/NavBar.vue", "nav-bar"],
  ["components/WorksNav.vue", "sidebar"],
])("%s marks its fixed container as a Motion layout root", (file, className) => {
  const source = readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8");
  expect(source).toMatch(
    new RegExp(
      `<motion\\.nav[^>]*layout-root[^>]*class="${className}"|<motion\\.nav[^>]*class="${className}"[^>]*layout-root`,
    ),
  );
});
