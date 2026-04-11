import type { Profile } from "./types";

/**
 * プロフィールのダミーデータ。実データに差し替える際は、このファイルを直接編集する。
 * i18n 導入時は UI 文言とともに messages/ja.json 等へ移植する想定。
 */
export const profile: Profile = {
  name: "Takuya Uehara",
  role: "情報系大学院生 / ソフトウェアエンジニア",
  affiliation: "〇〇大学院 情報理工学系研究科",
  bio: "ヒューマンコンピュータインタラクションと Web フロントエンドの接点に興味があります。普段は TypeScript と React でプロトタイピングをしながら、研究では対話インターフェースの評価手法を検討しています。",
  image: "/profile.jpg",
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
      label: "Wantedly",
      href: "https://www.wantedly.com/id/ut42tech",
      icon: "wantedly",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@ut42tech",
      icon: "youtube",
    },
    {
      label: "note",
      href: "https://note.com/ut42tech",
      icon: "note",
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
  timeline: [
    {
      date: "2025-11",
      category: "event",
      title: "DevFest Tokyo 2025 登壇",
      description:
        "Next.js 16 の Proxy と Cache Components について 20 分の発表を行った。",
      location: "東京",
    },
    {
      date: "2025-09",
      category: "event",
      title: "Hack U 2025 出場",
      description:
        "学生向けハッカソンで対話型学習アプリを開発し、優秀賞を受賞。",
    },
    {
      date: "2025-07",
      category: "work",
      title: "Web 系スタートアップでフロントエンドインターン",
      description:
        "3 ヶ月間、管理画面の再設計と A/B テスト基盤の整備を担当した。",
      location: "東京",
    },
    {
      date: "2024-04",
      category: "education",
      title: "大学院 修士課程に進学",
      description:
        "情報理工学系研究科に進学し、ヒューマンコンピュータインタラクション研究室に所属。",
    },
    {
      date: "2023-10",
      category: "work",
      title: "塾講師アルバイト開始",
      description: "高校生向けに数学と情報を教えている。",
    },
    {
      date: "2024-03",
      category: "education",
      title: "学士課程を卒業",
      description: "情報系学部を卒業。卒業研究では対話 UI の予備調査を行った。",
    },
    {
      date: "2020-04",
      category: "education",
      title: "大学 学士課程に入学",
    },
    {
      date: "2020-03",
      category: "education",
      title: "高校を卒業",
    },
    {
      date: "2001-01",
      category: "life",
      title: "生まれる",
      description: "東京都出身。",
    },
  ],
  photos: [
    { src: "/photos/placeholder-1.svg", alt: "プレースホルダ画像 1" },
    { src: "/photos/placeholder-2.svg", alt: "プレースホルダ画像 2" },
    { src: "/photos/placeholder-3.svg", alt: "プレースホルダ画像 3" },
  ],
};
