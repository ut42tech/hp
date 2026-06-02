"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import type { BlogPlatform, BlogPost } from "@/lib/blog/types";

import { BlogCard } from "./blog-card";

type Filter = "all" | BlogPlatform;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "qiita", label: "Qiita" },
  { value: "zenn", label: "Zenn" },
  { value: "note", label: "note" },
];

export function BlogFilter({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState<Filter>("all");

  const filtered =
    active === "all" ? posts : posts.filter((p) => p.platform === active);

  return (
    <div className="flex flex-col gap-6">
      <fieldset
        aria-label="記事のプラットフォームフィルター"
        className="flex flex-wrap gap-2 border-none p-0"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={active === f.value}
            onClick={() => setActive(f.value)}
          >
            <Badge
              variant={active === f.value ? "default" : "secondary"}
              className="cursor-pointer transition-colors"
            >
              {f.label}
            </Badge>
          </button>
        ))}
      </fieldset>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          このプラットフォームの記事はまだありません。
        </p>
      ) : (
        <ul
          aria-live="polite"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((post) => (
            <li key={post.url}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
