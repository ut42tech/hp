import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { alternates, localizePath, publishedLocales, switchLocalePath } from "./config";
import { en } from "./messages/en";
import { ja } from "./messages/ja";
import { useTranslations } from "./t";

test("en has every ja key and no empty values", () => {
  expect(Object.keys(en).sort()).toEqual(Object.keys(ja).sort());
  for (const [key, value] of Object.entries(en)) expect(value.trim(), key).not.toBe("");
});

test("localizePath prefixes every locale", () => {
  expect(localizePath("/about", "ja")).toBe("/ja/about");
  expect(localizePath("/", "ja")).toBe("/ja/");
  expect(localizePath("/about", "en")).toBe("/en/about");
});

test("switchLocalePath keeps the page", () => {
  expect(switchLocalePath("/ja/works/apps/tangi", "en")).toBe("/en/works/apps/tangi");
  expect(switchLocalePath("/en/", "ja")).toBe("/ja/");
});

test("alternates list published locales and x-default", () => {
  expect(alternates("/about")).toEqual([
    { hreflang: "ja", href: "/ja/about" },
    { hreflang: "x-default", href: "/" },
  ]);
});

test("interpolates", () => expect(useTranslations("ja")("count", { n: 10 })).toBe("10 件"));

test("only Japanese is published for now", () => expect(publishedLocales).toEqual(["ja"]));

test("vercel sends / to Japanese without a permanent redirect", () => {
  const { redirects } = JSON.parse(
    readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
  );
  expect(redirects).toContainEqual(
    expect.objectContaining({ source: "/", destination: "/ja/", permanent: false }),
  );
});
