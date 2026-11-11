import { sortByDateDesc } from "@/lib/utils";
import { profile } from "./profile";
import type { Highlight, TimelineEntry, Work } from "./types";
import { works as allWorks } from "./works";

/** highlight: true の Work / Timeline を日付降順で最大 n 件返す。 */
export function getHighlights(
  n = 3,
  works: Work[] = allWorks,
  timeline: TimelineEntry[] = profile.timeline,
): Highlight[] {
  const items: Highlight[] = [
    ...works
      .filter((w) => w.highlight)
      .map(
        (w): Highlight => ({
          title: w.title,
          date: w.date,
          description: w.summary,
          href: w.links[0]?.href,
          kind: "work",
        }),
      ),
    ...timeline
      .filter((t) => t.highlight)
      .map(
        (t): Highlight => ({
          title: t.title,
          date: t.date,
          description: t.description,
          href: undefined,
          kind: "timeline",
        }),
      ),
  ];
  return sortByDateDesc(items).slice(0, n);
}
