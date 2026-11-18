import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";

const source = readFileSync(new URL("../app/components/SortButton.vue", import.meta.url), "utf8");

// Design §8.6.1: the order label turns over like a card, the arrows half-turn, and reduced motion just swaps.
test("the label turns over like a card when the order flips", () => {
  expect(source).toMatch(/<Transition name="flip" mode="out-in">/);
  expect(source).toMatch(/:key="order"/);
  expect(source).toMatch(/\.flip-leave-to \{[^}]*rotateX\(90deg\)/);
  expect(source).toMatch(/\.flip-enter-from \{[^}]*rotateX\(-90deg\)/);
  // Swings a little past flat and settles back: the playful part.
  expect(source).toMatch(/\.flip-enter-active \{[^}]*var\(--ut-ease-overshoot\)/);
});

test("the arrows half-turn with the order", () => {
  expect(source).toMatch(/is-oldest/);
  expect(source).toMatch(/rotate: 180deg/);
});

test("reduced motion swaps the label without turning", () => {
  const reduced = source.slice(source.indexOf("@media (prefers-reduced-motion: reduce)"));
  expect(reduced).toMatch(/transition: none/);
});
