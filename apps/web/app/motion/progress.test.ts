import { SHEET_SPRING } from "@ut42tech/tokens/motion";
import { motionValue, spring } from "motion";
import { expect, test } from "vite-plus/test";
import { springTo } from "./progress";

test("reduced motion swaps the spring for a 150ms tween", () => {
  const controls = springTo(motionValue(0), 1, { reduced: true });
  expect(controls.duration).toBeCloseTo(0.15, 3);
  controls.stop();
});

test("the sheet spring lands on its target without overshooting", () => {
  // Sample the curve directly; Motion's frame loop needs requestAnimationFrame, which tests do not have.
  const curve = spring({ keyframes: [0, 1], ...SHEET_SPRING });
  let max = 0;
  let state = curve.next(0);
  for (let t = 0; !state.done && t < 3000; t += 8) {
    state = curve.next(t);
    max = Math.max(max, state.value);
  }
  expect(state.done).toBe(true);
  expect(state.value).toBe(1);
  expect(max).toBeLessThanOrEqual(1);
});
