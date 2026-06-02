import type { Keyword } from "./types";

/**
 * Keywords タイルに表示する人物像キーワード。
 * size: xl(主役・中心) > lg > md > sm。accent で緑バッジ。
 * 設計書 未確定事項 #2：中心(xl)ワードは要確定（候補: Creative Engineer / ものづくり / Design & Dev）。
 */
export const keywords: Keyword[] = [
  { label: "Creative Engineer", size: "xl", accent: true },

  { label: "ものづくり", size: "lg", accent: true },
  { label: "Generative AI", size: "lg" },
  { label: "弓道", size: "lg", accent: true },
  { label: "3DCG", size: "lg" },
  { label: "Hackathons", size: "lg" },
  { label: "Curiosity", size: "lg" },
  { label: "Visual Thinker", size: "lg" },
  { label: "HCI", size: "lg" },

  { label: "Community", size: "md" },
  { label: "Metaverse", size: "md" },
  { label: "WebXR", size: "md" },
  { label: "Research", size: "md" },
  { label: "UI/UX", size: "md" },
  { label: "Spatial Computing", size: "md" },
  { label: "茶道", size: "md", accent: true },
  { label: "Photography", size: "md" },
  { label: "Full-stack", size: "md" },

  { label: "Motion Graphics", size: "sm" },
  { label: "映画・アニメ", size: "sm" },
  { label: "一人旅", size: "sm" },
  { label: "Sauna", size: "sm" },
  { label: "Mentor", size: "sm" },
  { label: "OSS", size: "sm" },
  { label: "Homelab", size: "sm" },
  { label: "Apple", size: "sm" },
  { label: "恩送り", size: "sm" },
  { label: "長崎 Nagasaki", size: "sm" },
];
