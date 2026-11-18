import { expect, test } from "vite-plus/test";
import { isCategorySwitch, sectionOf } from "./section";

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

test("moving between Works categories is a category switch", () => {
  expect(isCategorySwitch("/ja/works/apps", "/ja/works/career")).toBe(true);
  expect(isCategorySwitch("/ja/works/career/", "/ja/works/events")).toBe(true);
});

test("opening an app, leaving Works or staying put is not a category switch", () => {
  expect(isCategorySwitch("/ja/works/apps", "/ja/works/apps/tangi")).toBe(false);
  expect(isCategorySwitch("/ja/works/apps", "/ja/about")).toBe(false);
  expect(isCategorySwitch("/ja/works/apps", "/ja/works/apps")).toBe(false);
});
