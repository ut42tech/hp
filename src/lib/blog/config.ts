import type { BlogPlatform } from "./types";

/** 各プラットフォームのユーザー名。記事取得とプロフィールリンクに使用。 */
export const blogHandles: Record<BlogPlatform, string> = {
  qiita: "ut42tech",
  zenn: "ut42tech",
  note: "ut42tech",
};

/** ISR の再生成間隔（秒）。1時間。 */
export const BLOG_REVALIDATE_SECONDS = 3600;

/** 空状態で案内する各プラットフォームのプロフィールURL。 */
export const blogProfileUrls: Record<BlogPlatform, string> = {
  qiita: `https://qiita.com/${blogHandles.qiita}`,
  zenn: `https://zenn.dev/${blogHandles.zenn}`,
  note: `https://note.com/${blogHandles.note}`,
};
