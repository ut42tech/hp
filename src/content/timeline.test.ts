import { describe, expect, it } from "vitest";

import { getFeaturedTimeline, getTimeline } from "./timeline";
import type { TimelineEntry } from "./types";

const e = (
  title: string,
  date: string,
  over: Partial<TimelineEntry> = {},
): TimelineEntry => ({ title, date, category: "event", ...over });

describe("getFeaturedTimeline", () => {
  it("featured: true だけを日付降順で返す", () => {
    const entries = [
      e("a", "2024-01", { featured: true }),
      e("b", "2025-01"),
      e("c", "2026-01", { featured: true }),
    ];
    expect(getFeaturedTimeline(entries).map((x) => x.title)).toEqual([
      "c",
      "a",
    ]);
  });

  it("featured が 0 件なら life 以外の全件を日付降順で返す", () => {
    const entries = [
      e("a", "2024-01"),
      e("l", "2023-01", { category: "life" }),
      e("c", "2026-01"),
    ];
    expect(getFeaturedTimeline(entries).map((x) => x.title)).toEqual([
      "c",
      "a",
    ]);
  });

  it("実データで 4〜8 件", () => {
    const n = getFeaturedTimeline().length;
    expect(n).toBeGreaterThanOrEqual(4);
    expect(n).toBeLessThanOrEqual(8);
  });
});

describe("getTimeline", () => {
  const entries = [
    e("a", "2024-01"),
    e("l", "2023-01", { category: "life" }),
    e("c", "2026-01"),
  ];

  it("includeLife: false は life を含まない", () => {
    expect(
      getTimeline({ includeLife: false }, entries).map((x) => x.title),
    ).toEqual(["c", "a"]);
  });

  it("includeLife: true は全件を日付降順で返す", () => {
    expect(
      getTimeline({ includeLife: true }, entries).map((x) => x.title),
    ).toEqual(["c", "a", "l"]);
  });
});
