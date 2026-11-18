import { expect, test } from "vite-plus/test";
import { detailMorph, morphDirection } from "./morph";

// Design §8.6: on wide screens the card's thumbnail turns into the detail's image and back.
test("opening an app from its list morphs that app", () => {
  expect(detailMorph("/ja/works/apps", "/ja/works/apps/coto2-ba")).toBe("coto2-ba");
  expect(detailMorph("/ja/works/apps/", "/ja/works/apps/coto2-ba")).toBe("coto2-ba");
});

test("closing back to the list morphs the same app", () => {
  expect(detailMorph("/ja/works/apps/tangi", "/ja/works/apps")).toBe("tangi");
});

test("other moves do not morph", () => {
  expect(detailMorph("/ja/about", "/ja/works/apps/tangi")).toBeNull();
  expect(detailMorph("/ja/works/apps/tangi", "/ja/works/apps/llmeta")).toBeNull();
  expect(detailMorph("/ja/works/apps", "/ja/works/career")).toBeNull();
  expect(detailMorph("/ja/works/apps", "/en/works/apps/tangi")).toBeNull();
});

// The corners change shape on the way: the card's thumbnail is round only at the top, the detail image all round.
test("opening a detail morphs towards the detail's shape, closing back towards the card's", () => {
  expect(morphDirection("/ja/works/apps", "/ja/works/apps/coto2-ba")).toBe("open");
  expect(morphDirection("/ja/works/apps/coto2-ba", "/ja/works/apps")).toBe("close");
  expect(morphDirection("/ja/about", "/ja/works/apps")).toBeNull();
});
