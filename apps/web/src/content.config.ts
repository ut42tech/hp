import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import type { SkillIcon } from "./lib/icons";

// Entries live at src/content/<collection>/<lang>/<slug>.md, so ids are "<lang>/<slug>".
const localized = (collection: string) =>
  glob({ pattern: "*/*.md", base: `./src/content/${collection}` });

const date = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, "use YYYY-MM or YYYY-MM-DD");

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

export const collections = {
  apps: defineCollection({
    loader: localized("apps"),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        date,
        thumbnail: image().optional(),
        initial: z.string().optional(),
        demo: z.url().optional(),
        github: z.url().optional(),
        stack: z.array(z.enum(skills)).default([]),
      }),
  }),
  career: defineCollection({
    loader: localized("career"),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        start: date,
        end: date.optional(),
        summary: z.string(),
        thumbnail: image().optional(),
        initial: z.string().optional(),
      }),
  }),
  events: defineCollection({
    loader: localized("events"),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        date,
        thumbnail: image().optional(),
        initial: z.string().optional(),
        url: z.url().optional(),
      }),
  }),
  awards: defineCollection({
    loader: localized("awards"),
    schema: z.object({ title: z.string(), date, initial: z.string().optional() }),
  }),
  press: defineCollection({
    loader: localized("press"),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        date,
        url: z.url(),
        source: z.enum(["note", "youtube", "zenn", "qiita", "speakerdeck", "other"]),
        outlet: z.string(),
        thumbnail: image().optional(),
      }),
  }),
};
