export type SortOrder = "newest" | "oldest";
export type Category = "apps" | "career" | "awards" | "events";

export const categories: readonly Category[] = ["apps", "career", "awards", "events"];

// "2026-03-15" or "2026-03" → "2026.03"
export function formatMonth(date: string): string {
  const [year, month] = date.split("-");
  return `${year}.${month}`;
}

export function formatPeriod(start: string, end?: string): string {
  if (!end) return `${formatMonth(start)} –`;
  if (formatMonth(start) === formatMonth(end)) return formatMonth(start);
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

// ISO dates compare correctly as strings; Array#sort is stable, so equal dates keep their order.
export function sortByDate<T>(items: T[], key: (item: T) => string, order: SortOrder): T[] {
  const direction = order === "newest" ? -1 : 1;
  return [...items].sort((a, b) =>
    key(a) < key(b) ? -direction : key(a) > key(b) ? direction : 0,
  );
}

export function nextOrder(order: SortOrder): SortOrder {
  return order === "newest" ? "oldest" : "newest";
}

export function initialOf(title: string, override?: string): string {
  if (override) return override;
  const [first] = new Intl.Segmenter("ja", { granularity: "grapheme" }).segment(title.trim());
  return (first?.segment ?? "").toUpperCase();
}
