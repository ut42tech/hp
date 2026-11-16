import type { Profile } from "./types.ts";

export const profile: Profile = {
  name: "Takuya Uehara",
  handle: "ut42tech",
  roleTags: ["学生エンジニア", "フルスタック", "デザイン", "INFJ"],
  affiliation: { role: "Master's Student", school: "Nagasaki University" },
  motto: "デザインとテクノロジーで、最高のユーザ体験を届けたい。",
  mottoEn: "Delivering the best experiences with design & technology.",
  email: "hello@ut42tech.com",
  social: [
    { label: "X", href: "https://x.com/ut42tech", icon: "x" },
    { label: "GitHub", href: "https://github.com/ut42tech", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ut42tech/", icon: "linkedin" },
    { label: "Qiita", href: "https://qiita.com/ut42tech", icon: "qiita" },
    { label: "Zenn", href: "https://zenn.dev/ut42tech", icon: "zenn" },
    { label: "note", href: "https://note.com/ut42tech", icon: "note" },
    { label: "YouTube", href: "https://www.youtube.com/@ut42tech", icon: "youtube" },
    { label: "Wantedly", href: "https://www.wantedly.com/id/tuehara", icon: "wantedly" },
  ],
};
