import { existsSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { loadPage } from "./html";

const hello = loadPage("/ja/");

test("is Japanese with a safe-area viewport", () => {
  expect(hello.querySelector("html")!.getAttribute("lang")).toBe("ja");
  expect(hello.querySelector('meta[name="viewport"]')!.getAttribute("content")).toContain(
    "viewport-fit=cover",
  );
});

test("sets the theme before first paint", () => {
  const scripts = hello.querySelectorAll("head script");
  expect(scripts.some((s) => s.textContent.includes("ut42tech:theme"))).toBe(true);
});

test("the theme toggle ships every icon so CSS can show the stored one before hydration", () => {
  const prefs = hello
    .querySelectorAll("header .theme-icon")
    .map((i) => i.getAttribute("data-pref"));
  expect(prefs).toEqual(["auto", "light", "dark"]);
});

test("hello greets without selecting a nav item", () => {
  expect(hello.querySelector('[aria-label="Welcome."]')).not.toBeNull();
  expect(hello.querySelector('nav [aria-current="page"]')).toBeNull();
  expect(
    hello.querySelectorAll('nav[aria-label="メイン"] a').map((a) => a.getAttribute("href")),
  ).toEqual(["/ja/about", "/ja/works/apps", "/ja/press"]);
});

test("handle links home", () => {
  expect(hello.querySelector('header a[href="/ja/"]')!.textContent).toContain("@ut42tech");
});

test("declares alternates", () => {
  expect(hello.querySelector('link[rel="alternate"][hreflang="x-default"]')).not.toBeNull();
});

test("has a favicon", () => expect(hello.querySelector('link[rel="icon"]')).not.toBeNull());

test("English is not published yet", () => {
  expect(existsSync(new URL("../dist/en", import.meta.url))).toBe(false);
});

test("no language switch while only one locale is published", () => {
  expect(hello.querySelector('a[hreflang="en"]')).toBeNull();
});
