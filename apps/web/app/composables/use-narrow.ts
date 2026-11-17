import { useMediaQuery } from "@vueuse/core";
import type { Ref } from "vue";

// Phones and portrait tablets (below 1024px) get sheets; wider screens get the page layout.
// On the server this is false; the CSS draws the right layout before it hydrates.
export function useNarrow(): Ref<boolean> {
  return useMediaQuery("(width < 64rem)");
}
