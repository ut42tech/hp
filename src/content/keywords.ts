import type { Keyword } from "./types";

/**
 * Keywords タイルに表示する人物像キーワード（日本人向け・日本語）。
 * size: xl(主役・中心) > lg > md > sm。accent で緑バッジ。
 * 出典: README / note 記事から人物像が伝わるものを採用。
 */
export const keywords: Keyword[] = [
  { label: "Creative", size: "xl", accent: true },

  { label: "Web", size: "lg" },
  { label: "Design", size: "lg" },
  { label: "AI", size: "lg" },
  { label: "HCI", size: "lg" },
  { label: "XR", size: "lg" },
  { label: "Visual Thinker", size: "lg", accent: true },
  { label: "UI & UX", size: "lg" },

  { label: "ものづくり", size: "md" },
  { label: "テクノロジー", size: "md" },
  { label: "Hackathon", size: "md" },
  { label: "メタバース", size: "md" },
  { label: "3Dプリンター", size: "lg" },
  { label: "Spatial Computing", size: "md" },
  { label: "コミュニティ運営", size: "md" },
  { label: "写真", size: "md" },
  { label: "Video Editing", size: "md" },
  { label: "Full Stack", size: "md", accent: true },

  { label: "Motion Graphics", size: "sm" },
  { label: "映画", size: "sm" },
  { label: "洋楽", size: "sm" },
  { label: "アニメ", size: "sm" },
  { label: "旅行 ✈️", size: "sm" },
  { label: "Education", size: "sm" },
  { label: "Computer Science 💻", size: "sm" },
  { label: "Infrastructure", size: "sm" },
  { label: "Data Science 📊", size: "sm" },
  { label: "OSS", size: "sm" },
  { label: "自宅サーバー", size: "sm" },
  { label: "Cloud Computing", size: "sm" },
  { label: "AI Agent Orchestration", size: "sm" },
  { label: "LLM", size: "sm" },
  { label: "Apple", size: "sm" },
  { label: "長崎", size: "sm", accent: true },
  { label: "留学", size: "sm" },
  { label: "Thailand 🇹🇭", size: "sm" },
  { label: "India 🇮🇳", size: "sm" },
];
