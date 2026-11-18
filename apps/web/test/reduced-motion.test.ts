import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";

const read = (path: string) => readFileSync(new URL(`../app/${path}`, import.meta.url), "utf8");

// The rules inside `@media (prefers-reduced-motion: reduce) { … }`, up to the block's closing brace.
function reducedBlock(source: string): string {
  const start = source.indexOf("@media (prefers-reduced-motion: reduce)");
  expect(start, "no reduced-motion block").toBeGreaterThan(-1);
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}" && --depth === 0) return source.slice(start, i);
  }
  return source.slice(start);
}

// Design §8.10: with reduced motion, sheets do not travel; the same 150ms progress becomes a fade.
test.each([
  ["components/SheetFrame.vue", "--sheet-progress"],
  ["components/AppDetail.vue", "--detail-progress"],
])("%s fades instead of sliding when motion is reduced", (file, variable) => {
  const block = reducedBlock(read(file));
  expect(block).toContain("translate: none");
  expect(block).toContain(`opacity: var(${variable}`);
});

test("in-place swaps are a plain 150ms fade when motion is reduced", () => {
  const block = reducedBlock(read("assets/css/global.css"));
  expect(block).toContain("150ms");
  expect(block).toContain("translate: none");
});
