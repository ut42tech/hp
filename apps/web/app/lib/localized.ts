import type { Locale } from "../i18n/config";
import { defaultLocale } from "../i18n/config";

export type Localized<T> = T & { slug: string; lang: Locale };

// Content ids are "<lang>/<slug>". A slug missing in the requested language falls back to Japanese.
export function pickLocalized<T extends { id: string }>(
  entries: T[],
  locale: Locale,
): Localized<T>[] {
  const bySlug = new Map<string, Partial<Record<Locale, T>>>();
  for (const entry of entries) {
    const [lang, ...rest] = entry.id.split("/");
    const slug = rest.join("/");
    const versions = bySlug.get(slug) ?? {};
    versions[lang as Locale] = entry;
    bySlug.set(slug, versions);
  }
  return [...bySlug].flatMap(([slug, versions]) => {
    const lang = versions[locale] ? locale : defaultLocale;
    const entry = versions[lang];
    return entry ? [{ ...entry, slug, lang }] : [];
  });
}
