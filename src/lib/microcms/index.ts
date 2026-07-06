import type { PressItem, TimelineEntry, Work } from "@/content/types";

import { fetchList } from "./client";
import { filterProjects, mapPress, mapTimelineEntry, mapWork } from "./mappers";
import type { RawPress, RawTimelineEntry, RawWork } from "./types";

/** 日付降順で全 Press を返す。 */
export async function getAllPress(): Promise<PressItem[]> {
  const contents = await fetchList<RawPress>("press");
  return contents.map(mapPress);
}

/** 最新 n 件（ホームのタイル用）。 */
export async function getLatestPress(n: number): Promise<PressItem[]> {
  return (await getAllPress()).slice(0, n);
}

/** Projects セクション用：作品（project/oss/research）を日付降順で全件返す。 */
export async function getProjects(): Promise<Work[]> {
  const contents = await fetchList<RawWork>("works");
  return filterProjects(contents.map(mapWork));
}

/** 自己紹介タイムラインを日付降順で全件返す。 */
export async function getTimeline(): Promise<TimelineEntry[]> {
  const contents = await fetchList<RawTimelineEntry>("timeline");
  return contents.map(mapTimelineEntry);
}
