import { getMicroCMSConfig, MICROCMS_REVALIDATE_SECONDS } from "./config";
import type { MicroCMSListResponse } from "./types";

/** リスト型 API の全件取得（日付降順）。各 API は 100 件以内の前提。 */
export async function fetchList<T>(endpoint: string): Promise<T[]> {
  const { serviceDomain, apiKey } = getMicroCMSConfig();
  const url = `https://${serviceDomain}.microcms.io/api/v1/${endpoint}?limit=100&orders=-date`;
  const res = await fetch(url, {
    headers: { "X-MICROCMS-API-KEY": apiKey },
    next: { revalidate: MICROCMS_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`microCMS ${endpoint} fetch failed: ${res.status}`);
  }
  const data = (await res.json()) as MicroCMSListResponse<T>;
  return data.contents;
}
