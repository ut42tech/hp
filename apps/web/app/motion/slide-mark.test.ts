import { expect, test } from "vite-plus/test";
import { markKeyframes } from "./slide-mark";

const box = (left: number, top: number) => ({ left, top });

// The new mark starts where the old one was and slides home, as a transform the compositor can run even
// while the next page is being rendered (JS-driven layout animation stalled there and jumped).
test("the mark starts from the old item's place", () => {
  expect(markKeyframes(box(510, 18), box(598, 18))).toEqual([
    "translate(-88px, 0px)",
    "translate(0px, 0px)",
  ]);
});

test("vertical navigations slide vertically", () => {
  expect(markKeyframes(box(32, 306), box(32, 354))).toEqual([
    "translate(0px, -48px)",
    "translate(0px, 0px)",
  ]);
});

test("a mark that has not moved does not animate", () => {
  expect(markKeyframes(box(65, 780), box(65, 780))).toBeNull();
});
