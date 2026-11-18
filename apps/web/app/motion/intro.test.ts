import { INTRO } from "@ut42tech/tokens/motion";
import { expect, test } from "vite-plus/test";
import { createSkipSwitch, introSteps, type IntroStep } from "./intro";

const play = introSteps({ mode: "play", bands: 5, letters: 8 });
const of = (steps: IntroStep[], target: IntroStep["target"]) =>
  steps.filter((s) => s.target === target);

test("the name rises at 80ms for 600ms and leaves 24px up at 780ms", () => {
  const name = of(play, "name");
  expect(name).toContainEqual(
    expect.objectContaining({
      at: 80,
      duration: 600,
      ease: "ease-out",
      keyframes: { y: ["100%", 0] },
    }),
  );
  expect(name).toContainEqual(
    expect.objectContaining({
      at: 780,
      duration: 500,
      ease: "ease-in-out",
      keyframes: { y: [0, -24] },
    }),
  );
  expect(name).toContainEqual(
    expect.objectContaining({ at: 780, duration: 350, keyframes: { opacity: [1, 0] } }),
  );
});

test("five bands lift left to right, 60ms apart, 820ms each", () => {
  const bands = of(play, "band");
  expect(bands.map((b) => [b.index, b.at, b.duration, b.ease])).toEqual(
    [0, 1, 2, 3, 4].map((i) => [i, 780 + 60 * i, 820, "ease-curtain"]),
  );
  for (const band of bands) expect(band.keyframes).toEqual({ y: [0, "-100%"] });
});

test("Welcome. rises letter by letter from 0.35em below", () => {
  const letters = of(play, "letter");
  expect(letters.map((l) => [l.index, l.at])).toEqual(
    [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [i, 1060 + 45 * i]),
  );
  for (const letter of letters) {
    expect(letter).toMatchObject({
      duration: 900,
      ease: "ease-rise",
      keyframes: { y: ["0.35em", 0], opacity: [0, 1] },
    });
  }
});

test("the sub line fades in at 1660 for 600ms", () => {
  expect(of(play, "sub")).toEqual([
    expect.objectContaining({ at: 1660, duration: 600, keyframes: { opacity: [0, 1] } }),
  ]);
});

test("outside Hello there are no letter steps", () => {
  const steps = introSteps({ mode: "play", bands: 5, letters: 0 });
  expect(of(steps, "letter")).toHaveLength(0);
  expect(of(steps, "sub")).toHaveLength(0);
});

test("reduced motion only fades the curtain over 400ms", () => {
  expect(introSteps({ mode: "fade", bands: 5, letters: 8 })).toEqual([
    expect.objectContaining({
      target: "curtain",
      at: 0,
      duration: 400,
      ease: "linear",
      keyframes: { opacity: [1, 0] },
    }),
  ]);
});

// removeAt is when the curtain goes (visual spec §9.1); the greeting keeps rising after it.
test("the curtain's own steps end by removeAt", () => {
  const curtain = play.filter((s) => s.target === "name" || s.target === "band");
  expect(Math.max(...curtain.map((s) => s.at + s.duration))).toBeLessThanOrEqual(INTRO.removeAt);
});

// A key or press before the entrance has started (fonts still loading) still skips it, once it starts.
test("a skip asked for before the entrance starts is honoured when it starts", () => {
  let skipped = 0;
  const switcher = createSkipSwitch();
  switcher.request();
  switcher.attach({ skip: () => skipped++ });
  expect(skipped).toBe(1);
});

test("a skip asked for during the entrance skips it at once, only once", () => {
  let skipped = 0;
  const switcher = createSkipSwitch();
  switcher.attach({ skip: () => skipped++ });
  expect(skipped).toBe(0);
  switcher.request();
  switcher.request();
  expect(skipped).toBe(1);
});
