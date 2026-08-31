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
    },
  ],
};
