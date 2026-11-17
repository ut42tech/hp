import faviconUrl from "@ut42tech/assets/favicon.ico?url";
// One share image for every page: the Hello screen at 1200×630, rendered from the site itself.
import ogImageUrl from "@ut42tech/assets/og.png?url";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useHead, useRouter, useRuntimeConfig } from "#imports";
import { alternates, localizePath } from "~/i18n/config";
import { mottoFor } from "~/i18n/t";
import { useLocale, useT } from "./use-locale";

interface PageMeta {
  title?: MaybeRefOrGetter<string | undefined>;
  description?: MaybeRefOrGetter<string | undefined>;
  // The 404 page is served at any missing URL, so it has no address of its own to declare.
  indexable?: boolean;
}

export function usePageMeta({ title, description, indexable = true }: PageMeta = {}): void {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const siteUrl = useRuntimeConfig().public.siteUrl as string;
  // Search engines need absolute URLs for hreflang and canonical.
  const absolute = (href: string) => new URL(href, siteUrl).href;

  const siteName = computed(() => t.value("site.name"));
  const pageTitle = computed(() => {
    const own = toValue(title);
    return own ? `${own} — ${siteName.value}` : siteName.value;
  });
  const pageDescription = computed(() => toValue(description) ?? mottoFor(locale.value));
  // Path without the locale prefix or a trailing slash, e.g. "/ja/about/" → "/about".
  const path = computed(
    () =>
      router.currentRoute.value.path
        .replace(new RegExp(`^/${locale.value}(?=/|$)`), "")
        .replace(/(.)\/$/, "$1") || "/",
  );

  useHead({
    title: pageTitle,
    meta: computed(() => [
      { name: "description", content: pageDescription.value },
      { property: "og:title", content: pageTitle.value },
      { property: "og:description", content: pageDescription.value },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: siteName.value },
      { property: "og:image", content: absolute(ogImageUrl) },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(indexable ? [] : [{ name: "robots", content: "noindex" }]),
    ]),
    link: computed(() => [
      { rel: "icon" as const, href: faviconUrl },
      ...(indexable
        ? [
            { rel: "canonical" as const, href: absolute(localizePath(path.value, locale.value)) },
            ...alternates(path.value).map((link) => ({
              rel: "alternate" as const,
              hreflang: link.hreflang,
              href: absolute(link.href),
            })),
          ]
        : []),
    ]),
  });
}
