import type {
  LinkKind,
  PressItem,
  PressType,
  TimelineCategory,
  TimelineEntry,
  Work,
  WorkCategory,
  WorkLink,
} from "@/content/types";
import { sortByDateDesc } from "@/lib/utils";

import type { RawPress, RawTimelineEntry, RawWork, RawWorkLink } from "./types";

const PRESS_TYPES: PressType[] = [
  "interview",
  "feature",
  "award",
  "event",
  "media",
];
const WORK_CATEGORIES: WorkCategory[] = [
  "project",
  "oss",
  "research",
  "experience",
];
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

/** テキストエリア → 空行区切りの段落配列。空なら undefined。 */
export function parseBody(text: string | undefined): string[] | undefined {
  const paragraphs = (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : undefined;
}

export function mapPress(raw: RawPress): PressItem {
  return {
    title: raw.title,
    outlet: raw.outlet,
    url: raw.url,
    date: toJstDateString(raw.date),
    type: pickSelect(raw.type, PRESS_TYPES, "media"),
    thumbnail: raw.thumbnail?.url,
    excerpt: raw.excerpt || undefined,
  };
}

function mapWorkLink(raw: RawWorkLink): WorkLink {
  return {
    label: raw.label,
    href: raw.href,
    kind: pickSelect(raw.kind, LINK_KINDS, "other"),
  };
}

export function mapWork(raw: RawWork): Work {
  return {
    slug: raw.id,
    category: pickSelect(raw.category, WORK_CATEGORIES, "project"),
    title: raw.title,
    summary: raw.summary,
    body: parseBody(raw.body),
    date: toJstDateString(raw.date),
    tags: parseTags(raw.tags),
    thumbnail: raw.thumbnail?.url,
    links: (raw.links ?? []).map(mapWorkLink),
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

const PROJECT_CATEGORIES: WorkCategory[] = ["project", "oss", "research"];

/** Projects セクション用：project/oss/research のみ日付降順で返す。 */
export function filterProjects(works: Work[]): Work[] {
  return sortByDateDesc(
    works.filter((w) => PROJECT_CATEGORIES.includes(w.category)),
  );
}
