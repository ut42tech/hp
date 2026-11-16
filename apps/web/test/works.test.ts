import { expect, test } from "vite-plus/test";
import { loadPage, readDist } from "./html";

test.each(["apps", "career", "awards", "events"])("/ja/works/%s lists its items", (c) => {
  const page = loadPage(`/ja/works/${c}`);
  expect(
    page.querySelector('nav[aria-label="メイン"] [aria-current="page"]')!.getAttribute("href"),
  ).toBe("/ja/works/apps");
  // The segmented control (mobile) and the sidebar (desktop) both mark the category.
  expect(
    page.querySelectorAll(
      `nav[aria-label="Works の分類"] a[href="/ja/works/${c}"][aria-current="page"]`,
    ).length,
  ).toBe(2);
  expect(page.querySelector("#works-list")!.childNodes.length).toBeGreaterThan(0);
});

test("apps cards link to their detail pages", () => {
  const hrefs = loadPage("/ja/works/apps")
    .querySelectorAll("#works-list a")
    .map((a) => a.getAttribute("href"));
  expect(hrefs.length).toBe(10);
  expect(hrefs.every((h) => /^\/ja\/works\/apps\/[\w-]+$/.test(h!))).toBe(true);
});

test("/ja/works redirects to apps", () => {
  expect(readDist("ja/works/index.html")).toContain("/ja/works/apps");
});

test("default order is newest first", () => {
  const dates = loadPage("/ja/works/apps")
    .querySelectorAll("#works-list .meta")
    .map((m) => m.textContent);
  expect(dates).toEqual([...dates].sort().reverse());
});

test("one h1 per page", () => {
  expect(loadPage("/ja/works/career").querySelectorAll("h1").length).toBe(1);
});
