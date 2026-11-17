import type { Collections } from "@nuxt/content";
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";
import { queryCollection, useAsyncData } from "#imports";
import type { Locale } from "~/i18n/config";
import { entryId, pickLocalized, type Localized } from "~/lib/localized";
import { categories, sortByDate, type Category } from "~/lib/works";

export type WorksCollection = Category | "press";
export type WorkEntry<C extends WorksCollection> = Collections[C] & { id: string };

const sortKey = (entry: WorkEntry<WorksCollection>): string =>
  "start" in entry ? entry.start : entry.date;

// Entries for one language (falling back to Japanese per slug), newest first.
// The query does not depend on the language, so each collection is fetched once and shared.
export async function useWorks<C extends WorksCollection>(
  collection: C,
  locale: MaybeRefOrGetter<Locale>,
): Promise<ComputedRef<Localized<WorkEntry<C>>[]>> {
  const { data } = await useAsyncData(`works:${collection}`, () =>
    queryCollection(collection).all(),
  );
  return computed(() => {
    const entries = (data.value ?? []).map(
      (entry) => ({ ...entry, id: entryId(entry.stem) }) as WorkEntry<C>,
    );
    return sortByDate(pickLocalized(entries, toValue(locale)), sortKey, "newest");
  });
}

export async function useWorkCounts(
  locale: MaybeRefOrGetter<Locale>,
): Promise<ComputedRef<Record<Category, number>>> {
  const lists = await Promise.all(categories.map((category) => useWorks(category, locale)));
  return computed(
    () =>
      Object.fromEntries(
        categories.map((category, i) => [category, lists[i]!.value.length]),
      ) as Record<Category, number>,
  );
}
