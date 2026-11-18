import { ref } from "vue";

// The app whose card thumbnail carries the shared view-transition name during a desktop list ↔ detail move
// (app/plugins/detail-morph.client.ts). Null the rest of the time, and always on the server.
export const morphSlug = ref<string | null>(null);

export const MORPH_NAME = "app-thumb";
