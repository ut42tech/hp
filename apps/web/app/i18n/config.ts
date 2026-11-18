export const locales = ["ja", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ja";
// English pages are built once their translations are ready; add "en" here to publish them.
export const publishedLocales: readonly Locale[] = ["ja"];
export const LOCALE_COOKIE = "ut42tech-lang";

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}

export function localizePath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${locale}/` : `/${locale}${clean}`;
}

export function switchLocalePath(path: string, to: Locale): string {
  return path.replace(new RegExp(`^/(${locales.join("|")})(?=/|$)`), `/${to}`);
}

export function alternates(path: string): { hreflang: string; href: string }[] {
  return [
    ...publishedLocales.map((locale) => ({ hreflang: locale, href: localizePath(path, locale) })),
    { hreflang: "x-default", href: "/" },
  ];
}
