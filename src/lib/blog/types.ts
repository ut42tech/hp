export type BlogPlatform = "qiita" | "zenn" | "note";

export interface BlogPost {
  platform: BlogPlatform;
  title: string;
  url: string;
  /** ISO 8601 文字列 */
  publishedAt: string;
  excerpt?: string;
  thumbnail?: string;
  /** 取得できるプラットフォームのみ（現状 Qiita のみ） */
  tags?: string[];
  /** 取得できるプラットフォームのみ（現状 Qiita のみ） */
  likes?: number;
}
