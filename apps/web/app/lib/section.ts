export type Section = "hello" | "about" | "works" | "press" | "not-found";

const tabs = ["about", "works", "press"] as const;

// Which part of the site a path belongs to: "/ja/works/apps/x" → "works". The first segment is the language.
export function sectionOf(path: string): Section {
  const segment = path.split("/").filter(Boolean)[1];
  if (segment === undefined) return "hello";
  return (tabs as readonly string[]).includes(segment) ? (segment as Section) : "not-found";
}

const worksList = /^\/[^/]+\/works\/([^/]+)\/?$/;

// Switching from one Works category list to another (not opening an app, not leaving Works).
export function isCategorySwitch(from: string, to: string): boolean {
  const a = from.match(worksList)?.[1];
  const b = to.match(worksList)?.[1];
  return a !== undefined && b !== undefined && a !== b;
}
