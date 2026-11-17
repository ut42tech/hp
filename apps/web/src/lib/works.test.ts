import { expect, test } from "vite-plus/test";
import { formatMonth, formatPeriod, initialOf, nextOrder, sortByDate } from "./works";

test("formatMonth", () => {
  expect(formatMonth("2026-03-15")).toBe("2026.03");
  expect(formatMonth("2024-08")).toBe("2024.08");
});

test("formatPeriod", () => {
  expect(formatPeriod("2025-04")).toBe("2025.04 –");
  expect(formatPeriod("2024-08", "2024-08")).toBe("2024.08");
  expect(formatPeriod("2024-05", "2024-08")).toBe("2024.05 – 2024.08");
});

test("sortByDate is newest-first and stable", () => {
  const items = [
    { d: "2024-01", n: "a" },
    { d: "2026-03", n: "b" },
    { d: "2024-01", n: "c" },
  ];
  expect(sortByDate(items, (i) => i.d, "newest").map((i) => i.n)).toEqual(["b", "a", "c"]);
  expect(sortByDate(items, (i) => i.d, "oldest").map((i) => i.n)).toEqual(["a", "c", "b"]);
});

test("initialOf", () => {
  expect(initialOf("tangi")).toBe("T");
  expect(initialOf("道路標識 OCR")).toBe("道");
  expect(initialOf("ゼンリン R&D部門", "Z")).toBe("Z");
});

test("orders toggle", () => expect(nextOrder(nextOrder("newest"))).toBe("newest"));
