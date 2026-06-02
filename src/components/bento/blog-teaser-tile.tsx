import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { platformMeta } from "@/components/blog/platform-meta";
import { Card } from "@/components/ui/card";
import type { BlogPost } from "@/lib/blog/types";
import { cn } from "@/lib/utils";

interface BlogTeaserTileProps {
  posts: BlogPost[];
  className?: string;
}

export function BlogTeaserTile({ posts, className }: BlogTeaserTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Latest Blog</h2>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View all
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">記事は準備中です。</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => {
            const meta = platformMeta[post.platform];
            return (
              <li key={post.url}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-1 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                    {post.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
