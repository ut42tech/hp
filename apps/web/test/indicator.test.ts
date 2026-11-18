import { expect, test } from "vite-plus/test";
import { loadPage } from "./html";

// Design §8.6.1: each navigation has one sliding mark, drawn in the selected item; none when nothing is selected.
const marksIn = (nav: ReturnType<ReturnType<typeof loadPage>["querySelector"]>) =>
  nav!.querySelectorAll("[data-indicator]");

test("Hello selects no tab, so the nav bar has no mark", () => {
  expect(marksIn(loadPage("/ja/").querySelector('nav[aria-label="メイン"]'))).toHaveLength(0);
});

test.each(["/ja/about", "/ja/works/apps", "/ja/press"])(
  "%s: the nav bar marks the current tab",
  (route) => {
    const marks = marksIn(loadPage(route).querySelector('nav[aria-label="メイン"]'));
    expect(marks).toHaveLength(1);
    expect(marks[0]!.closest("a")!.getAttribute("aria-current")).toBe("page");
  },
);

test("both Works navigations mark the current category", () => {
  const navs = loadPage("/ja/works/career").querySelectorAll('nav[aria-label="Works の分類"]');
  expect(navs).toHaveLength(2);
  for (const nav of navs) {
    const marks = marksIn(nav);
    expect(marks).toHaveLength(1);
    expect(marks[0]!.closest("a")!.getAttribute("href")).toBe("/ja/works/career");
  }
});
