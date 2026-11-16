import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "../i18n/config";
import { pickLocalized, type Localized } from "./localized";
import { sortByDate, type Category } from "./works";

type WorksCollection = Category | "press";

const sortKey = (entry: CollectionEntry<WorksCollection>): string =>
  "start" in entry.data ? entry.data.start : entry.data.date;

// Entries for one language (falling back to Japanese per slug), newest first.
export async function getWorks<C extends WorksCollection>(
  collection: C,
  locale: Locale,
): Promise<Localized<CollectionEntry<C>>[]> {
  const entries = (await getCollection(collection)) as CollectionEntry<C>[];
  return sortByDate(pickLocalized(entries, locale), sortKey, "newest");
}
