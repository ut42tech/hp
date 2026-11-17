import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { appRoutes, loadPage } from "./html";

const routes = ["/ja/", "/ja/about", "/ja/works/apps", "/ja/press", ...appRoutes("ja").slice(0, 1)];

test.each(routes)("%s: hreflang and canonical URLs are absolute", (route) => {
  const page = loadPage(route);
  const links = page.querySelectorAll('link[rel="alternate"], link[rel="canonical"]');
  expect(links.some((l) => l.getAttribute("rel") === "canonical")).toBe(true);
  for (const link of links) expect(link.getAttribute("href")).toMatch(/^https:\/\/ut42tech\.com\//);
});

test("canonical matches the page path without a trailing slash", () => {
  expect(loadPage("/ja/about").querySelector('link[rel="canonical"]')!.getAttribute("href")).toBe(
    "https://ut42tech.com/ja/about",
  );
});

// Reduced motion must win over the default transition, so it cannot sit in a cascade layer
// (layered rules always lose to the unlayered `@view-transition`).
test("reduced motion swaps page transitions for a short fade, outside any layer", () => {
  const css = readFileSync(new URL("../src/styles/global.css", import.meta.url), "utf8");
  const at = css.indexOf("::view-transition-old(*)");
  expect(at).toBeGreaterThan(-1);
  const enclosing: string[] = [];
  let depth = 0;
  const stack: string[] = [];
  let start = 0;
  for (let i = 0; i < at; i++) {
    if (css[i] === "{") {
      stack.push(css.slice(start, i).trim().split("\n").pop()!.trim());
      depth++;
      start = i + 1;
    } else if (css[i] === "}") {
      stack.pop();
      depth--;
      start = i + 1;
    } else if (css[i] === ";") start = i + 1;
  }
  enclosing.push(...stack);
  expect(enclosing).toEqual(["@media (prefers-reduced-motion: reduce)"]);
  expect(css.slice(at, css.indexOf("}", at))).toContain("150ms");
});
