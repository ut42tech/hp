import { expect, test } from "vite-plus/test";
import { pickLocalized } from "./localized";

test("pickLocalized prefers the locale and falls back to ja", () => {
  const entries = [{ id: "ja/a" }, { id: "ja/b" }, { id: "en/a" }];
  expect(pickLocalized(entries, "en").map((e) => [e.slug, e.lang])).toEqual([
    ["a", "en"],
    ["b", "ja"],
  ]);
  expect(pickLocalized(entries, "ja").map((e) => [e.slug, e.lang])).toEqual([
    ["a", "ja"],
    ["b", "ja"],
  ]);
});
