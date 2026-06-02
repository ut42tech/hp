import { describe, expect, it } from "vitest";

import { sortByDateDesc } from "./utils";

describe("sortByDateDesc", () => {
  it("新しい日付が先頭・元配列を破壊しない", () => {
    const input = [
      { id: "a", date: "2024-01-01" },
      { id: "b", date: "2026-05-01" },
      { id: "c", date: "2025-03-15" },
    ];
    const out = sortByDateDesc(input);
    expect(out.map((x) => x.id)).toEqual(["b", "c", "a"]);
    // 非破壊
    expect(input.map((x) => x.id)).toEqual(["a", "b", "c"]);
  });

  it("YYYY-MM と YYYY-MM-DD が混在しても比較できる", () => {
    const out = sortByDateDesc([{ date: "2025-11" }, { date: "2025-11-20" }]);
    expect(out[0].date).toBe("2025-11-20");
  });
});
