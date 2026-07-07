import type {
  ContentLink,
  LinkKind,
  PressItem,
  Project,
  TimelineCategory,
  TimelineEntry,
} from "@/content/types";

import type { RawLink, RawPress, RawProject, RawTimelineEntry } from "./types";

const TIMELINE_CATEGORIES: TimelineCategory[] = [
  "life",
  "education",
  "work",
  "event",
  "other",
];
const LINK_KINDS: LinkKind[] = [
  "github",
  "demo",
  "paper",
  "slide",
  "article",
  "other",
];

/**
 * microCMS の日付（UTC ISO）→ JST 基準の YYYY-MM-DD。
 * JST で選んだ日付は「前日T15:00:00.000Z」で返るため、UTC のまま切り出すと 1 日ずれる。
 */
export function toJstDateString(iso: string): string {
  const utc = new Date(iso);
  const jst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** セレクトフィールド（単一選択でも string[]）の先頭値を既知の値に照合する。 */
function pickSelect<T extends string>(
  values: string[] | undefined,
  allowed: T[],
  fallback: T,
): T {
  const value = values?.[0];
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** カンマ区切りテキスト → タグ配列。 */
export function parseTags(text: string | undefined): string[] {
  return (text ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function mapPress(raw: RawPress): PressItem {
  return {
    title: raw.title,
    outlet: raw.outlet,
    url: raw.url,
    date: toJstDateString(raw.date),
    thumbnail: raw.thumbnail?.url,
    excerpt: raw.excerpt || undefined,
  };
}

function mapLink(raw: RawLink): ContentLink {
  return {
    label: raw.label,
    href: raw.href,
    kind: pickSelect(raw.kind, LINK_KINDS, "other"),
  };
}

export function mapProject(raw: RawProject): Project {
  return {
    slug: raw.id,
    title: raw.title,
    summary: raw.summary,
    date: toJstDateString(raw.date),
    tags: parseTags(raw.tags),
    thumbnail: raw.thumbnail?.url,
    links: (raw.links ?? []).map(mapLink),
  };
}

export function mapTimelineEntry(raw: RawTimelineEntry): TimelineEntry {
  return {
    date: toJstDateString(raw.date),
    category: pickSelect(raw.category, TIMELINE_CATEGORIES, "other"),
    title: raw.title,
    description: raw.description || undefined,
    location: raw.location || undefined,
    thumbnail: raw.thumbnail?.url,
  };
}
