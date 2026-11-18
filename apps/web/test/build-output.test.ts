import { existsSync, readFileSync } from "node:fs";
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

// The toggle is @theme-toggles/vue's Classic: its sun turns into a moon by CSS from a `.dark` class on the root,
// which the inline script sets before first paint, so the icon is right before hydration too.
test("the theme toggle is an animated sun and moon named as a dark mode switch", () => {
  const toggle = hello.querySelector("header .theme-toggle")!;
  expect(toggle.tagName).toBe("BUTTON");
  expect(toggle.getAttribute("aria-label")).toBe("ダークモード");
  expect(toggle.querySelector("svg")).not.toBeNull();
  // Neither state pinned on the button itself, or it would override the root's class before hydration.
  expect(toggle.classList.contains("light")).toBe(false);
  expect(toggle.classList.contains("dark")).toBe(false);
  const scripts = hello.querySelectorAll("head script").map((s) => s.textContent);
  expect(scripts.some((s) => s.includes('classList.toggle("dark"'))).toBe(true);
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

// The toggle numbers its clip path from a counter in its module: prerendering counts across every page, the
// browser starts again at 1, and after hydration the moon's cut-out pointed at a clip path that does not
// exist. ThemeToggle.vue remounts it once mounted, so the browser numbers both ends.
test("the theme toggle is remounted in the browser, so its clip path ids agree", () => {
  const source = readFileSync(
    new URL("../app/components/ThemeToggle.vue", import.meta.url),
    "utf8",
  );
  expect(source).toMatch(/<Classic[^>]*:key="dark === undefined \? 'prerendered' : 'browser'"/);
});
