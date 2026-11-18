import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { pointerConfig } from "./pointer";

test("ipad-cursor takes its sizes and timing from the tokens", () => {
  expect(pointerConfig.normalStyle).toMatchObject({
    width: 20,
    height: 20,
    radius: "50%",
    durationBase: 200,
  });
  expect(pointerConfig.blockPadding).toBe(6);
  expect(pointerConfig.mouseDownStyle).toMatchObject({ scale: 0.9 });
  // Weaker than the library's 10, so a large card leans a few pixels, not 30.
  expect(pointerConfig.adsorptionStrength).toBe(6);
});

test("ipad-cursor uses the theme's pointer colours, so it follows light and dark", () => {
  expect(pointerConfig.normalStyle?.background).toBe("var(--ut-color-pointer)");
  expect(pointerConfig.blockStyle?.background).toBe("var(--ut-color-pointer-block)");
});

test("ipad-cursor is a dot everywhere but on pressable elements, and follows new pages by itself", () => {
  expect(pointerConfig.enableAutoTextCursor).toBe(false);
  expect(pointerConfig.enableAutoUpdateCursor).toBe(true);
});

test("touch screens and reduced motion never load the pointer", () => {
  const plugin = readFileSync(new URL("../plugins/pointer.client.ts", import.meta.url), "utf8");
  expect(plugin).toMatch(/\(pointer: fine\)/);
  expect(plugin).toMatch(/\(prefers-reduced-motion: reduce\)/);
  // Loaded on demand, so touch devices never download it.
  expect(plugin).toMatch(/import\("~\/motion\/pointer"\)/);
});

const css = readFileSync(new URL("../assets/css/global.css", import.meta.url), "utf8");

// A modal detail sits in the top layer, above any z-index: the dot would be hidden under it while the system
// pointer is hidden too. While one is open, the system pointer comes back.
test("a modal dialog gives the system pointer back", () => {
  expect(css).toMatch(
    /html\.has-pointer:has\(dialog:modal\) \.ipad-cursor[^{]*\{[^}]*display: none/,
  );
  expect(css).toMatch(/html\.has-pointer:has\(dialog:modal\) \*[^{]*\{[^}]*cursor: revert/);
});

// A pen, a touch on a laptop screen, or the pointer outside the window: no dot, the system pointer as usual.
test("the dot steps aside for a pen, a touch or the pointer leaving the window", () => {
  expect(css).toMatch(/html\.pointer-off \.ipad-cursor[^{]*\{[^}]*opacity: 0/);
  expect(css).toMatch(/html\.pointer-off \*[^{]*\{[^}]*cursor: revert/);
});
