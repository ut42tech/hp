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
