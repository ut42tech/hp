import type { PressItem, Project, TimelineEntry, Work } from "@/content/types";

import { fetchList } from "./client";
import { mapPress, mapProject, mapTimelineEntry, mapWork } from "./mappers";
import type { RawPress, RawProject, RawTimelineEntry, RawWork } from "./types";

/** 日付降順で全 Press を返す。 */
export async function getAllPress(): Promise<PressItem[]> {
  const contents = await fetchList<RawPress>("press");
  return contents.map(mapPress);
}

/** 最新 n 件（ホームのタイル用）。 */
export async function getLatestPress(n: number): Promise<PressItem[]> {
  return (await getAllPress()).slice(0, n);
}

/** Projects セクション用：開発プロジェクトを日付降順で全件返す。 */
export async function getProjects(): Promise<Project[]> {
  const contents = await fetchList<RawProject>("projects");
  return contents.map(mapProject);
}

/** Works セクション用：開発以外の取り組みを日付降順で全件返す。 */
export async function getWorks(): Promise<Work[]> {
  const contents = await fetchList<RawWork>("works");
  return contents.map(mapWork);
}

/** 自己紹介タイムラインを日付降順で全件返す。 */
export async function getTimeline(): Promise<TimelineEntry[]> {
  const contents = await fetchList<RawTimelineEntry>("timeline");
  return contents.map(mapTimelineEntry);
}
