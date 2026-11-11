import type { Metadata } from "next";

import { About } from "@/components/home/about";
import { Highlights } from "@/components/home/highlights";
import { Intro } from "@/components/home/intro";
import { ProjectList } from "@/components/home/project-list";
import { Skills } from "@/components/home/skills";
import { Timeline } from "@/components/home/timeline";
import { Writing } from "@/components/home/writing";
import { FadeIn } from "@/components/motion/fade-in";
import { getHighlights } from "@/content/highlights";
import { getLatestPress } from "@/content/press";
import { getFeaturedTimeline, getTimeline } from "@/content/timeline";
import { getLatestBlogPosts } from "@/lib/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  description:
    "Takuya Uehara（上原拓也）の自己紹介。学生エンジニア / フルスタック・デザイン。デザインとテクノロジーで、最高のユーザ体験を届けたい。受賞・制作物・スキル・経歴・ブログをまとめています。",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const posts = await getLatestBlogPosts(3);

  return (
    <div className="mx-auto max-w-2xl px-5">
      <Intro />
      <FadeIn>
        <Highlights items={getHighlights()} />
      </FadeIn>
      <FadeIn>
        <About />
      </FadeIn>
      <FadeIn>
        <ProjectList />
      </FadeIn>
      <FadeIn>
        <Skills />
      </FadeIn>
      <FadeIn>
        <Timeline
          featured={getFeaturedTimeline()}
          all={getTimeline({ includeLife: true })}
        />
      </FadeIn>
      <FadeIn>
        <Writing posts={posts} press={getLatestPress(3)} />
      </FadeIn>
      {/* 以降のセクションは <FadeIn><Section …/></FadeIn> の形でここに追加する */}
    </div>
  );
}
