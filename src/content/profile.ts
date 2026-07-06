import type { Profile } from "./types";

export const profile: Profile = {
  name: "Takuya Uehara",
  roleTags: ["学生エンジニア", "フルスタック", "デザイン", "INFJ"],
  affiliation: { role: "Master's Student", school: "Nagasaki University" },
  lab: { name: "Setozaki Lab", url: "https://www.setozakilab.com" },
  titles: [
    "長崎学生エンジニアコミュニティ ChoTech 代表",
    "tec-nova Nagasaki 学生チーフメンター & デザイン・システム担当",
    "角川ドワンゴ学園 N Code Labo プログラミング講師",
    "長崎大学ジュニアドクター育成塾 メンター",
    "Progate Path 学生アンバサダー",
  ],
  motto: "デザインとテクノロジーで、最高のユーザ体験を届けたい。",
  mottoEn: "Delivering the best experiences with design & technology.",
  bio: [
    "「デザインとテクノロジーで最高のユーザ体験を届けたい」がモットー。幼少期から好奇心旺盛な性格で、絵画や工作に没頭。小学生の頃にはPHPを独学しサーバーを自宅で運営。中学生の頃には自作PCやソフトウェア開発に興味を持ったり、3DCGアニメーションやモーショングラフィックスの映像制作など、つくることへの情熱は早くから芽生えていました。",
    "高校では弓道・茶道・写真を通じて日本文化の様式美に触れ、その感覚はいまもデザインの根底にあります。",
    "大学は長崎大学 情報データ科学部に進学し、コンピュータサイエンスとデータサイエンスを学ぶ。学部2年次に日本教育工学会2024年春季全国大会の口頭発表にて、最年少で学生優秀賞を受賞。卒業研究では生成AIを用いたコミュニケーション支援メタバースプラットフォームをWeb技術をメインにフルスクラッチで開発。",
    "タイやインドなどへの海外渡航経験や留学生との交流を通じて、言語や文化を超えたコミュニケーションの可能性にも強い関心を持っています。長崎のテックカルチャーを盛り上げたいという想いから、学生エンジニアコミュニティChoTechを創設し、地域の技術コミュニティの活性化にも取り組んでいます。",
  ],
  image: "/profile.jpg",
  social: [
    {
      label: "X",
      href: "https://x.com/ut42tech",
      icon: "x",
    },
    {
      label: "GitHub",
      href: "https://github.com/ut42tech",
      icon: "github",
    },
    {
      label: "Qiita",
      href: "https://qiita.com/ut42tech",
      icon: "qiita",
    },
    {
      label: "Zenn",
      href: "https://zenn.dev/ut42tech",
      icon: "zenn",
    },
    {
      label: "note",
      href: "https://note.com/ut42tech",
      icon: "note",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@ut42tech",
      icon: "youtube",
    },
    {
      label: "Wantedly",
      href: "https://www.wantedly.com/id/tuehara",
      icon: "wantedly",
    },
  ],
  techStack: [
    // Languages
    "TypeScript",
    "Python",
    "C#",
    "Swift",
    "Java",
    // Web Frameworks
    "React",
    "Next.js",
    "FastAPI",
    "Flask",
    "Tailwind CSS",
    "Three.js",
    // Infra / Cloud
    "AWS",
    "GCP",
    "Vercel",
    "Supabase",
    "Heroku",
    "Cloudflare",
    "Docker",
    "Proxmox",
    "Linux",
    "Git",
    // Creative
    "Unity",
    "Blender",
    "Cinema 4D",
    "After Effects",
    "Premiere Pro",
    "Photoshop",
    "Adobe XD",
    "Final Cut Pro",
    "Figma",
    // Academic
    "LaTeX",
    "Typst",
  ],
  photos: [
    {
      src: "/photos/home/1.jpg",
      alt: "タージ・マハル",
      caption: "インド留学中に訪れたタージ・マハル",
      date: "2025-02",
    },
    {
      src: "/photos/home/2.jpg",
      alt: "「長崎ハッカソン」会場に掲げられた横断幕",
      caption: "学生団体として「長崎ハッカソン」の立ち上げに携わりました。",
    },
    {
      src: "/photos/home/3.jpg",
      alt: "アユタヤ ワット・マハタートにて",
      caption: "タイ留学中に訪れたアユタヤの仏頭",
      date: "2023-09",
    },
  ],
};
