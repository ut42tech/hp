import { describe, expect, it } from "vitest";

import { formatBlogDate } from "./utils";

describe("formatBlogDate", () => {
  it.each([
    ["2026-01-01T23:30:00Z", "2026.01.02"],
    ["2026-03-15T03:00:00Z", "2026.03.15"],
    ["2025-12-31T14:59:59Z", "2025.12.31"],
    ["2025-12-31T15:00:00Z", "2026.01.01"],
  ])("%s -> %s (Asia/Tokyo)", (iso, expected) => {
    expect(formatBlogDate(iso)).toBe(expected);
  });
});
