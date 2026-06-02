import { fetchQiita } from "./qiita";
import { fetchNote, fetchZenn } from "./rss";
import type { BlogPost } from "./types";
import { sortByPublishedDesc } from "./utils";

/** 3プラットフォームを並行取得し、失敗は無視して成功分のみを新着順で返す。 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const results = await Promise.allSettled([
    fetchQiita(),
    fetchZenn(),
    fetchNote(),
  ]);
  const posts: BlogPost[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      posts.push(...result.value);
    } else {
      console.error("[blog] fetch failed:", result.reason);
    }
  }
  return sortByPublishedDesc(posts);
}

/** 最新 limit 件（ホームのティーザー用）。 */
export async function getLatestBlogPosts(limit: number): Promise<BlogPost[]> {
  const all = await getAllBlogPosts();
  return all.slice(0, limit);
}
