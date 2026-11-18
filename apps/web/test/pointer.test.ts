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

// ipad-cursor's frame takes the element's own corners (radius "auto"). The header's name and the theme toggle
// have no surface of their own, so they are pills with room around them; otherwise the frame is a hard grey
// box hugging the text.
test.each([
  ["components/SiteHeader.vue", ".home"],
  ["components/ThemeToggle.vue", ".theme-toggle"],
])("%s is a pill the pointer can settle on", (file, selector) => {
  const source = read(file);
  expect(source).toContain(`class="${selector.slice(1)}`);
  const rule = source.slice(source.indexOf(`${selector} {`));
  expect(rule).toMatch(/^[^}]*border-radius: var\(--ut-radius-full\)/);
  expect(rule).toMatch(/^[^}]*(padding|width)/);
});

// The sun and the moon trade places: the outgoing one turns away and shrinks, the incoming one turns in and
// settles with a little overshoot. Reduced motion just swaps them.
test("the theme icons turn into each other, and simply swap with reduced motion", () => {
  const source = read("components/ThemeToggle.vue");
  expect(source).toMatch(/\.theme-icon \{[^}]*transition:[^}]*rotate[^}]*scale/);
  expect(source).toMatch(/:root\[data-theme="dark"\] \.theme-icon\[data-theme-icon="light"\]/);
  const reduced = source.slice(source.indexOf("@media (prefers-reduced-motion: reduce)"));
  expect(reduced).toMatch(/transition: none/);
});
