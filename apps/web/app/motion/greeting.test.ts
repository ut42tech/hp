import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { bounceSpeed, pull } from "./greeting";

// Visual spec §9.2: within 420px a letter leans toward the pointer, up to 14px across and 10px up or down,
// more the closer it is.
test("letters ignore a pointer farther than 420px", () => {
  expect(pull({ x: 0, y: 0 }, { x: 500, y: 0 })).toEqual({ x: 0, y: 0 });
});

test("a pointer right next to a letter pulls it almost the full 14px across", () => {
  expect(pull({ x: 0, y: 0 }, { x: 1, y: 0 }).x).toBeCloseTo(14 * (1 - 1 / 420), 5);
});

test("vertical pull tops out at 10px", () => {
  expect(pull({ x: 0, y: 0 }, { x: 0, y: 1 }).y).toBeCloseTo(10 * (1 - 1 / 420), 5);
});

test("halfway out pulls half as far", () => {
  expect(pull({ x: 0, y: 0 }, { x: 210, y: 0 }).x).toBeCloseTo(7, 5);
});

test("a pointer exactly on the letter does not move it", () => {
  expect(pull({ x: 5, y: 5 }, { x: 5, y: 5 })).toEqual({ x: 0, y: 0 });
});

test("a press throws each letter up at 260–320px/s", () => {
  expect(bounceSpeed(() => 0)).toBe(-260);
  expect(bounceSpeed(() => 1)).toBe(-320);
});

// The entrance moves the letters with `transform`; the greeting uses `translate`, so the two never fight.
test("the greeting moves `translate`, never `transform`", () => {
  const source = readFileSync(new URL("./greeting.ts", import.meta.url), "utf8");
  expect(source).toMatch(/style\.translate/);
  expect(source).not.toMatch(/style\.transform/);
});
