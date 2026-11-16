export type SocialIcon = "x" | "github" | "qiita" | "zenn" | "note" | "youtube" | "wantedly";

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
}

export interface Profile {
  name: string;
  handle: string;
  roleTags: string[];
  affiliation: { role: string; school: string };
  motto: string;
  mottoEn: string;
  social: SocialLink[];
}
