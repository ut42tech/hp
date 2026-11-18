import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";

const read = (path: string) => readFileSync(new URL(`../app/${path}`, import.meta.url), "utf8");

// Design §8.8: ipad-cursor as its README shows it, with no layer of our own on top.
test("the plugin starts ipad-cursor itself, for a mouse and without reduced motion", () => {
  const plugin = read("plugins/pointer.client.ts");
  expect(plugin).toMatch(/import \{ initCursor \} from "ipad-cursor"/);
  expect(plugin).toMatch(/\(pointer: fine\)/);
  expect(plugin).toMatch(/\(prefers-reduced-motion: reduce\)/);
});

// A modal detail sits in the top layer, above any z-index: the dot would be hidden under it while the system
// pointer is hidden too. While one is open, the system pointer comes back.
test("a modal dialog gives the system pointer back", () => {
  const css = read("assets/css/global.css");
  expect(css).toMatch(/:root:has\(dialog:modal\) \.ipad-cursor \{[^}]*display: none/);
  // The root too: ipad-cursor hides it as well, and the body inherits from it.
  expect(css).toMatch(
    /:root:has\(\.ipad-cursor\):has\(dialog:modal\),\s*:root:has\(\.ipad-cursor\):has\(dialog:modal\) \* \{[^}]*cursor: revert/,
  );
});
