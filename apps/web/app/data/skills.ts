// The skills shown on About, in this order. An app's `stack` may only name these (content.config.ts), and each
// has a brand icon (lib/icons.ts).
export const skills = [
  "typescript",
  "python",
  "swift",
  "react",
  "nextdotjs",
  "vuedotjs",
  "astro",
  "threedotjs",
  "unity",
  "blender",
  "figma",
] as const;

export type Skill = (typeof skills)[number];
