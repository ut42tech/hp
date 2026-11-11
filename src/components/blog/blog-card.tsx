import { Card } from "@/components/ui/card";
import type { BlogPost } from "@/lib/blog/types";
import { formatBlogDate } from "@/lib/blog/utils";

import { platformMeta } from "./platform-meta";

export function BlogCard({ post }: { post: BlogPost }) {
  const meta = platformMeta[post.platform];
  const { Icon } = meta;

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card transition-colors group-hover:border-accent">
        <div className="relative aspect-[1.91/1] w-full overflow-hidden">
          {post.thumbnail ? (
            // biome-ignore lint/performance/noImgElement: 外部の可変ホスト（Zenn Cloudinary / note）のため next/image を使わない
            <img
              src={post.thumbnail}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              style={{ backgroundColor: meta.color }}
            >
              <Icon className="size-10 text-white" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
            style={{ color: meta.color }}
          >
            <Icon className="size-3.5" />
            {meta.label}
          </span>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            <time dateTime={post.publishedAt}>
              {formatBlogDate(post.publishedAt)}
            </time>
            {typeof post.likes === "number" ? ` ・ ♥ ${post.likes}` : ""}
          </p>
          {post.excerpt ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          {post.tags?.length ? (
            <div className="mt-auto flex flex-wrap gap-1 pt-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </a>
  );
}
