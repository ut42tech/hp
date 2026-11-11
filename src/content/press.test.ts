import { describe, expect, it } from "vitest";

import { hasPress } from "./press";
import type { PressItem } from "./types";

describe("hasPress", () => {
  it("空配列は false、1 件以上で true", () => {
    const item: PressItem = {
      title: "t",
      outlet: "o",
      url: "https://example.com",
      date: "2025-11",
      type: "interview",
    };
    expect(hasPress([])).toBe(false);
    expect(hasPress([item])).toBe(true);
  });

  it("実データは現状 0 件", () => {
    expect(hasPress()).toBe(false);
  });
});
