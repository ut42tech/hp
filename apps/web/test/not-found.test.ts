import { parse } from "node-html-parser";
import { expect, test } from "vite-plus/test";
import { readDist } from "./html";

const page = parse(readDist("404.html"));

test("says the page is missing and links home", () => {
  expect(page.querySelector("h1")!.textContent).toBe("ページが見つかりません");
  expect(page.querySelectorAll("h1").length).toBe(1);
  expect(page.querySelector('main a[href="/ja/"]')).not.toBeNull();
});

test("keeps the nav bar with nothing selected", () => {
  expect(page.querySelectorAll('nav[aria-label="メイン"] a').length).toBe(3);
  expect(page.querySelector('nav [aria-current="page"]')).toBeNull();
});

test("is not indexed and claims no address of its own", () => {
  expect(page.querySelector('meta[name="robots"]')!.getAttribute("content")).toBe("noindex");
  expect(page.querySelector('link[rel="canonical"]')).toBeNull();
  expect(page.querySelector('link[rel="alternate"]')).toBeNull();
});
