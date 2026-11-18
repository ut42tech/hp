import { THEME_SWITCH } from "@ut42tech/tokens/motion";
import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { revealKeyframes } from "./theme-switch";

const px = (value: string) => value.split(" ").map((n) => Number.parseFloat(n));

// The new theme grows as a soft-edged circle from the button's centre (the mask's solid part is the inner
// 1 − feather of its radius).
test("the circle starts as nothing at the button's centre", () => {
  const frames = revealKeyframes({ x: 1000, y: 40 }, { width: 1080, height: 800 });
  expect(frames.maskSize[0]).toBe("0px 0px");
  expect(frames.maskPosition[0]).toBe("1000px 40px");
});

test("at the end its solid part reaches the farthest corner, still centred on the button", () => {
  const origin = { x: 1000, y: 40 };
  const frames = revealKeyframes(origin, { width: 1080, height: 800 });
  const [size] = px(frames.maskSize[1]!);
  const [left, top] = px(frames.maskPosition[1]!);
  // The farthest corner is the bottom left one.
  const corner = Math.hypot(1000, 760);
  expect((size! / 2) * (1 - THEME_SWITCH.feather)).toBeCloseTo(corner, 1);
  expect(left! + size! / 2).toBeCloseTo(origin.x, 6);
  expect(top! + size! / 2).toBeCloseTo(origin.y, 6);
});

test("the mask is one soft circle that does not repeat", () => {
  const frames = revealKeyframes({ x: 10, y: 10 }, { width: 100, height: 100 });
  const solid = `${(1 - THEME_SWITCH.feather) * 100}%`;
  expect(frames.maskImage).toEqual(
    Array(2).fill(`radial-gradient(closest-side, black ${solid}, transparent)`),
  );
  expect(frames.maskRepeat).toEqual(["no-repeat", "no-repeat"]);
});

// The page is revealed as one picture: the header and the nav bar must not keep their own names (they would
// cross-fade instead of being swept by the circle), and the default cross-fade must not run under the mask.
test("while the theme switches, the whole page is one snapshot without a cross-fade", () => {
  const css = readFileSync(new URL("../assets/css/global.css", import.meta.url), "utf8");
  expect(css).toMatch(/:root\.theme-switching \* \{[^}]*view-transition-name: none !important/);
  expect(css).toMatch(
    /:root\.theme-switching::view-transition-old\(root\),\s*:root\.theme-switching::view-transition-new\(root\) \{[^}]*animation: none;[^}]*mix-blend-mode: normal/,
  );
});
