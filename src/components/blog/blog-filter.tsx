"use client";

import { useState } from "react";

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
        className="flex flex-wrap gap-1 border-none p-0 -ml-3"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={active === f.value}
            onClick={() => setActive(f.value)}
            className="inline-flex min-h-11 items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs transition-colors ${
                active === f.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </span>
          </button>
        ))}
      </fieldset>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          このプラットフォームの記事はまだありません。
        </p>
      ) : (
        <ul aria-live="polite" className="divide-y divide-border">
          {filtered.map((post) => (
            <BlogCard key={post.url} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}
