import { describe, expect, it } from "vitest";

import { getProjects } from "./works";

describe("getProjects", () => {
  it("project/oss/research のみ返し experience を除外する", () => {
    const list = getProjects();
    expect(list.length).toBeGreaterThan(0);
    for (const w of list) {
      expect(["project", "oss", "research"]).toContain(w.category);
    }
    expect(list.some((w) => w.category === "experience")).toBe(false);
  });

  it("日付降順に並ぶ", () => {
    const dates = getProjects().map((w) => w.date);
    const sorted = [...dates].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    expect(dates).toEqual(sorted);
  });
});
