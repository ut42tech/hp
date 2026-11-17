import { expect, test } from "vite-plus/test";
import { sectionOf } from "./section";

test("the language root is Hello", () => {
  expect(sectionOf("/ja/")).toBe("hello");
  expect(sectionOf("/ja")).toBe("hello");
});

test("pages inside a tab belong to that tab", () => {
  expect(sectionOf("/ja/about")).toBe("about");
  expect(sectionOf("/ja/works/apps")).toBe("works");
  expect(sectionOf("/ja/works/apps/coto2-ba")).toBe("works");
  expect(sectionOf("/ja/press/")).toBe("press");
});

test("anything else is not found", () => expect(sectionOf("/ja/nope")).toBe("not-found"));
