import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { blockFrame } from "./pointer";

test("a block grows the pointer around the element with 6px to spare", () => {
  expect(blockFrame({ left: 100, top: 50, width: 84, height: 40 }, "999px")).toEqual({
    x: 94,
    y: 44,
    width: 96,
    height: 52,
    radius: "999px",
  });
});

test("a squared element keeps its corners, grown by the same 6px", () => {
  expect(blockFrame({ left: 0, top: 0, width: 216, height: 44 }, "12px").radius).toBe("18px");
});

test("uneven corners follow the first one", () => {
  expect(blockFrame({ left: 0, top: 0, width: 264, height: 260 }, "16px 16px 0px 0px").radius).toBe(
    "22px",
  );
});

test("touch screens and reduced motion never load the pointer", () => {
  const plugin = readFileSync(new URL("../plugins/pointer.client.ts", import.meta.url), "utf8");
  expect(plugin).toMatch(/\(pointer: fine\)/);
  expect(plugin).toMatch(/\(prefers-reduced-motion: reduce\)/);
  // Loaded on demand, so touch devices never download it.
  expect(plugin).toMatch(/import\("~\/motion\/pointer"\)/);
});
