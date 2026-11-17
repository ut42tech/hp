import { usePreferredReducedMotion } from "@vueuse/core";
import { computed, type ComputedRef } from "vue";

export function useReducedMotion(): ComputedRef<boolean> {
  const preference = usePreferredReducedMotion();
  return computed(() => preference.value === "reduce");
}
