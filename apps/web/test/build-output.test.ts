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

// The toggle shows the Tabler outline sun and moon, like every other icon; CSS keyed on [data-theme] (set before
// first paint) picks one, so it is right before hydration.
test("the theme toggle is a dark mode switch with an outline sun and moon", () => {
  const toggle = hello.querySelector("header .theme-toggle")!;
  expect(toggle.tagName).toBe("BUTTON");
  expect(toggle.getAttribute("aria-label")).toBe("ダークモード");
  const icons = toggle.querySelectorAll(".theme-icon");
  expect(icons.map((i) => i.getAttribute("data-theme-icon"))).toEqual(["light", "dark"]);
  for (const icon of icons)
    expect(icon.querySelector("svg")!.getAttribute("stroke-width")).toBe("1.75");
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
