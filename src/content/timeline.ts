import { sortByDateDesc } from "@/lib/utils";
import { profile } from "./profile";
import type { TimelineEntry } from "./types";

/**
 * featured: true のエントリを日付降順で返す。
 * 1 件も無ければ life を除く全件にフォールバックする。
 */
export function getFeaturedTimeline(
  entries: TimelineEntry[] = profile.timeline,
): TimelineEntry[] {
  const featured = entries.filter((e) => e.featured);
  if (featured.length > 0) return sortByDateDesc(featured);
  return sortByDateDesc(entries.filter((e) => e.category !== "life"));
}

/** 全タイムラインを日付降順で返す。includeLife: false なら life を除く。 */
export function getTimeline(
  opts: { includeLife: boolean },
  entries: TimelineEntry[] = profile.timeline,
): TimelineEntry[] {
  return sortByDateDesc(
    opts.includeLife ? entries : entries.filter((e) => e.category !== "life"),
  );
}
