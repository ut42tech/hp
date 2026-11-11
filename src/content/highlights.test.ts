import { describe, expect, it } from "vitest";

import { getHighlights } from "./highlights";
import type { TimelineEntry, Work } from "./types";

const work = (over: Partial<Work> = {}): Work => ({
  slug: "w",
  category: "project",
  title: "W",
  summary: "work summary",
  date: "2026-03-15",
  tags: [],
  links: [{ label: "Demo", href: "https://example.com", kind: "demo" }],
  ...over,
});

const entry = (over: Partial<TimelineEntry> = {}): TimelineEntry => ({
  date: "2026-03",
  category: "event",
  title: "T",
  description: "entry description",
  ...over,
});

describe("getHighlights", () => {
  it("highlight: true のものだけを Work と Timeline の両方から集める", () => {
    const result = getHighlights(
      10,
      [work({ title: "A", highlight: true }), work({ title: "B" })],
      [entry({ title: "C", highlight: true }), entry({ title: "D" })],
    );
    expect(result.map((h) => h.title).sort()).toEqual(["A", "C"]);
  });

  it("日付降順（YYYY-MM-DD と YYYY-MM の混在でも sortByDateDesc の順）", () => {
    const result = getHighlights(
      10,
      [work({ title: "W", date: "2026-03-15", highlight: true })],
      [entry({ title: "T", date: "2026-03", highlight: true })],
    );
    expect(result.map((h) => h.title)).toEqual(["W", "T"]);
  });

  it("n 件に切り詰める", () => {
    const works = [1, 2, 3, 4].map((i) =>
      work({ title: `W${i}`, date: `2026-0${i}-01`, highlight: true }),
    );
    expect(getHighlights(3, works, [])).toHaveLength(3);
    expect(getHighlights(undefined, works, [])).toHaveLength(3);
  });

  it("Work は summary と最初のリンクを使う。リンクが無ければ href は undefined", () => {
    const [a] = getHighlights(3, [work({ highlight: true })], []);
    expect(a).toMatchObject({
      kind: "work",
      description: "work summary",
      href: "https://example.com",
    });
    const [b] = getHighlights(3, [work({ highlight: true, links: [] })], []);
    expect(b.href).toBeUndefined();
  });

  it("Timeline は description を使い href は undefined", () => {
    const [h] = getHighlights(3, [], [entry({ highlight: true })]);
    expect(h).toMatchObject({
      kind: "timeline",
      description: "entry description",
      href: undefined,
    });
  });

  it("フラグが無ければ空配列", () => {
    expect(getHighlights(3, [work()], [entry()])).toEqual([]);
  });

  it("実データで 1〜3 件返す", () => {
    const n = getHighlights().length;
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(3);
  });
});
