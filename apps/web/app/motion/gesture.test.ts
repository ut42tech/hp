import { expect, test } from "vite-plus/test";
import { followFinger, projectPx, shouldClose } from "./gesture";

test("a flick projects about half its speed in px", () =>
  expect(projectPx(1000)).toBeCloseTo(499, 0));

test("a short fast flick closes", () => expect(shouldClose(40, 1200, 860)).toBe(true));

test("a slow short drag springs back", () => expect(shouldClose(60, 50, 860)).toBe(false));

test("a slow long drag past a third closes", () => expect(shouldClose(300, 0, 860)).toBe(true));

test("dragging down follows the finger", () =>
  expect(followFinger(1, 86, 860)).toBeCloseTo(0.9, 5));

test("pulling above fully open resists", () =>
  expect(followFinger(1, -86, 860)).toBeCloseTo(1.015, 3));
