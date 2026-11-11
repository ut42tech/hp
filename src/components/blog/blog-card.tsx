import { Row } from "@/components/home/writing";
import type { BlogPost } from "@/lib/blog/types";
import { formatBlogDate } from "@/lib/blog/utils";

import { platformMeta } from "./platform-meta";

/** /blogs の 1 行。ホームの Writing と同じ Row を使い、Qiita のタグ・いいね数を添える。 */
export function BlogCard({ post }: { post: BlogPost }) {
  const tags = post.tags?.slice(0, 3) ?? [];
  const hasLikes = typeof post.likes === "number";

  return (
    <Row
      dateTime={post.publishedAt}
      date={formatBlogDate(post.publishedAt)}
      source={platformMeta[post.platform].label}
      title={post.title}
      url={post.url}
      extra={
        tags.length > 0 || hasLikes ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {tags.map((t) => `#${t}`).join(" ")}
            {tags.length > 0 && hasLikes ? " ・ " : ""}
            {hasLikes ? `♥ ${post.likes}` : ""}
          </span>
        ) : null
      }
    />
  );
}
