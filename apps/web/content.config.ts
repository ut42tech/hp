import { defineCollection, defineContentConfig, z } from "@nuxt/content";
import type { SkillIcon } from "./app/lib/icons";

// Entries live at content/<collection>/<lang>/<slug>.md.
const source = (collection: string) => `${collection}/**/*.md`;

const date = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, "use YYYY-MM or YYYY-MM-DD");
// Images live in public/works/<collection>/ and are referenced by their public path.
const thumbnail = z.string().startsWith("/works/").optional();

const skills = [
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
] as const satisfies readonly SkillIcon[];

export default defineContentConfig({
  collections: {
    apps: defineCollection({
      type: "page",
      source: source("apps"),
      schema: z.object({
        title: z.string(),
        date,
        thumbnail,
        initial: z.string().optional(),
        demo: z.string().url().optional(),
        github: z.string().url().optional(),
        stack: z.array(z.enum(skills)).default([]),
      }),
    }),
    career: defineCollection({
      type: "page",
      source: source("career"),
      schema: z.object({
        title: z.string(),
        start: date,
        end: date.optional(),
        summary: z.string(),
        thumbnail,
        initial: z.string().optional(),
      }),
    }),
    events: defineCollection({
      type: "page",
      source: source("events"),
      schema: z.object({
        title: z.string(),
        date,
        thumbnail,
        initial: z.string().optional(),
        url: z.string().url().optional(),
      }),
    }),
    awards: defineCollection({
      type: "page",
      source: source("awards"),
      schema: z.object({ title: z.string(), date, initial: z.string().optional() }),
    }),
    press: defineCollection({
      type: "page",
      source: source("press"),
      schema: z.object({
        title: z.string(),
        date,
        url: z.string().url(),
        source: z.enum(["note", "youtube", "zenn", "qiita", "speakerdeck", "other"]),
        outlet: z.string(),
        thumbnail,
      }),
    }),
  },
});
