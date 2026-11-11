import type { Metadata } from "next";

import { About } from "@/components/home/about";
import { Highlights } from "@/components/home/highlights";
import { Intro } from "@/components/home/intro";
import { ProjectList } from "@/components/home/project-list";
import { Skills } from "@/components/home/skills";
import { FadeIn } from "@/components/motion/fade-in";
import { getHighlights } from "@/content/highlights";

export const revalidate = 3600;

export const metadata: Metadata = {
  description:
    "Takuya Uehara（上原拓也）の自己紹介。学生エンジニア / フルスタックとして、デザインとテクノロジーで最高のユーザ体験を届けることをモットーに、生成AI・空間コンピューティングの研究やプロダクト開発に取り組んでいます。キーワード・代表作・掲載記事・経歴をまとめています。",
  alternates: { canonical: "/" },
};

export default function Home() {
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
      {/* 以降のセクションは <FadeIn><Section …/></FadeIn> の形でここに追加する */}
    </div>
  );
}
