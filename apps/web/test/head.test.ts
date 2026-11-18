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

test.each(routes)("%s: shares the large image at an absolute URL", (route) => {
  const page = loadPage(route);
  const image = page.querySelector('meta[property="og:image"]')!.getAttribute("content")!;
  expect(image).toMatch(/^https:\/\/ut42tech\.com\/.+\.png$/);
  expect(page.querySelector('meta[name="twitter:card"]')!.getAttribute("content")).toBe(
    "summary_large_image",
  );
});
