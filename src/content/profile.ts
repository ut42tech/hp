import type { Profile } from "./types";

/**
 * プロフィールのダミーデータ。実データに差し替える際は、このファイルを直接編集する。
 * i18n 導入時は UI 文言とともに messages/ja.json 等へ移植する想定。
 */
export const profile: Profile = {
  name: "ut42tech",
  role: "情報系大学院生 / ソフトウェアエンジニア",
  affiliation: "〇〇大学院 情報理工学系研究科",
  bio: "ヒューマンコンピュータインタラクションと Web フロントエンドの接点に興味があります。普段は TypeScript と React でプロトタイピングをしながら、研究では対話インターフェースの評価手法を検討しています。",
  social: [
    {
      label: "GitHub",
      href: "https://github.com/ut42tech",
      icon: "github",
    },
    {
      label: "X",
      href: "https://x.com/ut42tech",
      icon: "x",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/ut42tech",
      icon: "linkedin",
    },
    {
      label: "Contact",
      href: "https://x.com/ut42tech",
      icon: "mail",
    },
  ],
  techStack: [
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Node.js",
    "Python",
    "PyTorch",
    "Figma",
  ],
};
