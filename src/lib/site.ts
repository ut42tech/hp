/**
 * サイト全体で共有する定数。metadata や sitemap/robots などから参照する。
 */
export const site = {
  url: "https://ut42tech.com",
  name: "Takuya Uehara",
  description:
    "Takuya Uehara のパーソナルサイト。ソフトウェア開発・HCI 研究・OSS・コミュニティ活動などの取り組みをまとめています。",
  locale: "ja_JP",
  ogImage: "/opengraph-image",
  /** true にするとページ上部に工事中バナーを表示する */
  underConstruction: true,
} as const;

export type Site = typeof site;
