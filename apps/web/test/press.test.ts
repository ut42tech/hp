import { expect, test } from "vite-plus/test";
import { loadPage } from "./html";

const press = loadPage("/ja/press");

test("press cards open outside", () => {
  const links = press.querySelectorAll("#press-list a");
  expect(links.length).toBeGreaterThan(0);
  for (const a of links) {
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
  }
});

test("nav marks press", () => {
  expect(
    press.querySelector('nav[aria-label="メイン"] [aria-current="page"]')!.getAttribute("href"),
  ).toBe("/ja/press");
});

test("cards show the date and the outlet", () => {
  expect(press.querySelector("#press-list .meta")!.textContent).toBe(
    "2024.03 · 長崎大学 情報データ科学部",
  );
});
