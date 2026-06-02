import type { Metadata } from "next";

import { BlogFilter } from "@/components/blog/blog-filter";
import { FadeIn } from "@/components/motion/fade-in";
import { getAllBlogPosts } from "@/lib/blog";
import { blogProfileUrls } from "@/lib/blog/config";

export const revalidate = 3600; // BLOG_REVALIDATE_SECONDS と同値（route segment config は静的リテラルを要求）

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Qiita・Zenn・note に投稿した記事をまとめています。Web 開発・HCI・クリエイティブな取り組みの記録。",
  alternates: { canonical: "/blogs" },
};

export default async function BlogsPage() {
  const posts = await getAllBlogPosts();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <FadeIn>
        <header className="mb-10 flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Blog
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            記事一覧
          </h1>
          <p className="text-sm text-muted-foreground">
            Qiita・Zenn・note の記事をまとめています。
          </p>
        </header>
      </FadeIn>

      <FadeIn delay={0.05}>
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              記事はまだありません。各プラットフォームをご覧ください。
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href={blogProfileUrls.qiita}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Qiita
              </a>
              <a
                href={blogProfileUrls.zenn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Zenn
              </a>
              <a
                href={blogProfileUrls.note}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                note
              </a>
            </div>
          </div>
        ) : (
          <BlogFilter posts={posts} />
        )}
      </FadeIn>
    </section>
  );
}
