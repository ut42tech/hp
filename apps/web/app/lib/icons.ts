import {
  IconArrowsSort,
  IconArrowUpRight,
  IconChevronLeft,
  IconCopy,
  IconLanguage,
  IconMail,
  IconMoon,
  IconSun,
} from "@tabler/icons-vue";
import type { SocialIcon } from "@ut42tech/profile";
import {
  siAstro,
  siBlender,
  siFigma,
  siGithub,
  siNextdotjs,
  siNote,
  siPython,
  siQiita,
  siReact,
  siSpeakerdeck,
  siSwift,
  siThreedotjs,
  siTypescript,
  siUnity,
  siVuedotjs,
  siWantedly,
  siX,
  siYoutube,
  siZenn,
} from "simple-icons";
// LinkedIn was removed from Simple Icons after 11.0.0; that release is installed under an alias.
import { siLinkedin } from "simple-icons-11";
import type { Component } from "vue";
import type { Skill } from "../data/skills";

export type UiIconName =
  | "chevron-left"
  | "arrow-up-right"
  | "arrows-sort"
  | "sun"
  | "moon"
  | "copy"
  | "mail"
  | "language";

export type BrandIconName = SocialIcon | Skill | "speakerdeck";

export const UI_ICON_STROKE = 1.75;

export const uiIcons: Record<UiIconName, Component> = {
  "chevron-left": IconChevronLeft,
  "arrow-up-right": IconArrowUpRight,
  "arrows-sort": IconArrowsSort,
  sun: IconSun,
  moon: IconMoon,
  copy: IconCopy,
  mail: IconMail,
  language: IconLanguage,
};

export const brandIcons: Record<BrandIconName, { title: string; path: string }> = {
  x: siX,
  github: siGithub,
  linkedin: siLinkedin,
  qiita: siQiita,
  zenn: siZenn,
  note: siNote,
  youtube: siYoutube,
  wantedly: siWantedly,
  speakerdeck: siSpeakerdeck,
  typescript: siTypescript,
  python: siPython,
  swift: siSwift,
  react: siReact,
  nextdotjs: siNextdotjs,
  vuedotjs: siVuedotjs,
  astro: siAstro,
  threedotjs: siThreedotjs,
  unity: siUnity,
  blender: siBlender,
  figma: siFigma,
};
