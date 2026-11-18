const appDetail = /^\/([^/]+)\/works\/apps\/([^/]+)\/?$/;
const appList = /^\/([^/]+)\/works\/apps\/?$/;

// The app whose thumbnail should turn into its detail image (or back) on this move, or null.
// Only between an Apps list and one of its details, in the same language.
export function detailMorph(from: string, to: string): string | null {
  for (const [list, detail] of [
    [from, to],
    [to, from],
  ] as const) {
    const listMatch = list.match(appList);
    const detailMatch = detail.match(appDetail);
    if (listMatch && detailMatch && listMatch[1] === detailMatch[1]) return detailMatch[2]!;
  }
  return null;
}
