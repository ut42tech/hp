export type Section = "hello" | "about" | "works" | "press" | "not-found";

const tabs = ["about", "works", "press"] as const;

// Which part of the site a path belongs to: "/ja/works/apps/x" → "works". The first segment is the language.
export function sectionOf(path: string): Section {
  const segment = path.split("/").filter(Boolean)[1];
  if (segment === undefined) return "hello";
  return (tabs as readonly string[]).includes(segment) ? (segment as Section) : "not-found";
}
