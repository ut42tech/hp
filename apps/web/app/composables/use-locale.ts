import { computed, type ComputedRef } from "vue";
import { useRouter } from "#imports";
import { defaultLocale, isLocale, type Locale } from "~/i18n/config";
import { useTranslations, type Translate } from "~/i18n/t";

// Reads the router's current location directly: Nuxt's useRoute() only updates once the page has rendered,
// and the shell must follow the address as soon as it changes.
export function useLocale(): ComputedRef<Locale> {
  const router = useRouter();
  return computed(() => {
    const locale = router.currentRoute.value.params.locale;
    return isLocale(locale) ? locale : defaultLocale;
  });
}

export function useT(): ComputedRef<Translate> {
  const locale = useLocale();
  return computed(() => useTranslations(locale.value));
}
