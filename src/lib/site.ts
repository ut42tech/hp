/**
 * サイト全体で共有する定数。metadata や sitemap/robots などから参照する。
 */
export const site = {
  url: "https://ut42tech.com",
  name: "Takuya Uehara",
  description:
    "情報系大学院生 Takuya Uehara のポートフォリオ。個人開発・OSS・研究・登壇などを 1 つのサイトにまとめています。",
  locale: "ja_JP",
  ogImage: "/opengraph-image",
} as const;

export type Site = typeof site;
