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

/**
 * OG 画像で使用する共通カラーパレット。
 * ダークグリーン基調で GitHub Primer 系の配色に揃えている。
 */
export const ogColors = {
  bg: "linear-gradient(135deg, #0a120d 0%, #0f261a 45%, #163b28 100%)",
  bgSolid: "#0a120d",
  fg: "#f5f5f7",
  accent: "#7ee787",
  accentDot: "#3fb950",
  accentLight: "#aff5b4",
  muted: "#7d8b80",
} as const;
